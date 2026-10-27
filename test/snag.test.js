const { expect } = require("chai");
const { ethers } = require("hardhat");

const FEE_BPS = 100n; // 1%
const CHARITY_ID = "diapers-baby";

async function deployMulti(fee = FEE_BPS) {
  const [owner, alice, bob, charity] = await ethers.getSigners();
  const Factory = await ethers.getContractFactory("SnagRouterMulti");
  const router = await Factory.deploy(fee);
  await router.waitForDeployment();
  return { router, owner, alice, bob, charity };
}

describe("SnagRouterMulti", function () {
  it("sets owner and fee on deploy", async function () {
    const { router, owner } = await deployMulti();
    expect(await router.owner()).to.equal(owner.address);
    expect(await router.feeBps()).to.equal(FEE_BPS);
    expect(await router.MAX_FEE_BPS()).to.equal(1000n);
  });

  it("reverts when fee exceeds max", async function () {
    const Factory = await ethers.getContractFactory("SnagRouterMulti");
    await expect(Factory.deploy(1001)).to.be.revertedWith("Snag: fee too high");
  });

  it("registers a charity and emits CharityAdded", async function () {
    const { router, charity } = await deployMulti();
    const cid = ethers.keccak256(ethers.toUtf8Bytes(CHARITY_ID));
    await expect(router.addCharity(CHARITY_ID, charity.address))
      .to.emit(router, "CharityAdded")
      .withArgs(cid, charity.address);
    expect(await router.charityWallets(cid)).to.equal(charity.address);
  });

  it("only owner can addCharity", async function () {
    const { router, alice, charity } = await deployMulti();
    await expect(
      router.connect(alice).addCharity(CHARITY_ID, charity.address)
    ).to.be.revertedWith("Snag: not owner");
  });

  it("reverts addCharity on zero wallet", async function () {
    const { router } = await deployMulti();
    await expect(
      router.addCharity(CHARITY_ID, ethers.ZeroAddress)
    ).to.be.revertedWith("Snag: zero wallet");
  });

  it("splits 1% to charity and 99% to destination", async function () {
    const { router, alice, bob, charity } = await deployMulti();
    await router.addCharity(CHARITY_ID, charity.address);
    const amount = ethers.parseEther("1");
    const expectedSnag = amount / 100n;

    const charityBefore = await ethers.provider.getBalance(charity.address);
    const bobBefore = await ethers.provider.getBalance(bob.address);

    await expect(router.connect(alice).snagAndSend(CHARITY_ID, bob.address, { value: amount }))
      .to.emit(router, "Snagged");

    expect(await ethers.provider.getBalance(charity.address)).to.equal(charityBefore + expectedSnag);
    expect(await ethers.provider.getBalance(bob.address)).to.equal(bobBefore + (amount - expectedSnag));
    expect(await ethers.provider.getBalance(await router.getAddress())).to.equal(0n);
  });

  it("reverts on unknown charity id", async function () {
    const { router, alice, bob } = await deployMulti();
    await expect(
      router.connect(alice).snagAndSend("nope", bob.address, { value: 1000 })
    ).to.be.revertedWith("Snag: unknown charity");
  });

  it("reverts on zero value", async function () {
    const { router, alice, bob, charity } = await deployMulti();
    await router.addCharity(CHARITY_ID, charity.address);
    await expect(
      router.connect(alice).snagAndSend(CHARITY_ID, bob.address, { value: 0 })
    ).to.be.revertedWith("Snag: no value");
  });

  it("reverts on zero destination", async function () {
    const { router, alice, charity } = await deployMulti();
    await router.addCharity(CHARITY_ID, charity.address);
    await expect(
      router.connect(alice).snagAndSend(CHARITY_ID, ethers.ZeroAddress, { value: 1000 })
    ).to.be.revertedWith("Snag: zero destination");
  });

  it("rounds dust snag down to zero without reverting", async function () {
    const { router, alice, bob, charity } = await deployMulti();
    await router.addCharity(CHARITY_ID, charity.address);
    // 50 wei * 1% = 0.5 -> 0
    const bobBefore = await ethers.provider.getBalance(bob.address);
    await router.connect(alice).snagAndSend(CHARITY_ID, bob.address, { value: 50 });
    expect(await ethers.provider.getBalance(bob.address)).to.equal(bobBefore + 50n);
  });

  it("owner can update fee within cap; others cannot", async function () {
    const { router, alice } = await deployMulti();
    await expect(router.setFeeBps(200)).to.emit(router, "FeeUpdated").withArgs(100n, 200n);
    expect(await router.feeBps()).to.equal(200n);
    await expect(router.setFeeBps(1001)).to.be.revertedWith("Snag: fee too high");
    await expect(router.connect(alice).setFeeBps(50)).to.be.revertedWith("Snag: not owner");
  });

  it("addCharity reverts when the id already has a wallet", async function () {
    const { router, alice, bob } = await deployMulti();
    await router.addCharity(CHARITY_ID, alice.address);
    await expect(
      router.addCharity(CHARITY_ID, bob.address)
    ).to.be.revertedWith("Snag: charity exists");
  });

  it("charity wallet updates are two step with a delay", async function () {
    const { router, alice, bob } = await deployMulti();
    const cid = ethers.keccak256(ethers.toUtf8Bytes(CHARITY_ID));
    await router.addCharity(CHARITY_ID, alice.address);
    await router.proposeCharityWalletUpdate(CHARITY_ID, bob.address);
    expect(await router.charityWallets(cid)).to.equal(alice.address);
    await expect(
      router.confirmCharityWalletUpdate(CHARITY_ID)
    ).to.be.revertedWith("Snag: update not ready");
    await ethers.provider.send("evm_increaseTime", [86400]);
    await ethers.provider.send("evm_mine", []);
    await expect(router.confirmCharityWalletUpdate(CHARITY_ID))
      .to.emit(router, "CharityWalletUpdated")
      .withArgs(cid, alice.address, bob.address);
    expect(await router.charityWallets(cid)).to.equal(bob.address);
  });

  it("ownership can be transferred and renounced", async function () {
    const { router, alice, charity } = await deployMulti();
    await router.transferOwnership(alice.address);
    expect(await router.owner()).to.equal(alice.address);
    await expect(router.addCharity(CHARITY_ID, charity.address)).to.be.revertedWith("Snag: not owner");
    await router.connect(alice).renounceOwnership();
    expect(await router.owner()).to.equal(ethers.ZeroAddress);
  });

  it("reverts when destination is the contract itself", async function () {
    const { router, alice, charity } = await deployMulti();
    await router.addCharity(CHARITY_ID, charity.address);
    await expect(
      router.connect(alice).snagAndSend(CHARITY_ID, await router.getAddress(), { value: 1000 })
    ).to.be.revertedWith("Snag: self destination");
  });

  it("owner can recover stuck ETH; others cannot", async function () {
    const { router, owner, alice } = await deployMulti();
    const stuck = ethers.parseEther("0.5");
    await ethers.provider.send("hardhat_setBalance", [
      await router.getAddress(),
      "0x" + stuck.toString(16),
    ]);
    const before = await ethers.provider.getBalance(owner.address);
    const tx = await router.recoverETH(stuck);
    const receipt = await tx.wait();
    const gas = receipt.gasUsed * receipt.gasPrice;
    expect(await ethers.provider.getBalance(await router.getAddress())).to.equal(0n);
    expect(await ethers.provider.getBalance(owner.address)).to.equal(before + stuck - gas);
    await expect(router.connect(alice).recoverETH(1n)).to.be.revertedWith("Snag: not owner");
  });
});

async function deploySingle(fee = FEE_BPS) {
  const [owner, alice, bob, charity] = await ethers.getSigners();
  const Factory = await ethers.getContractFactory("SnagRouter");
  const router = await Factory.deploy(charity.address, fee);
  await router.waitForDeployment();
  const TokenFactory = await ethers.getContractFactory("MockERC20");
  const token = await TokenFactory.deploy();
  await token.waitForDeployment();
  return { router, token, owner, alice, bob, charity };
}

describe("SnagRouter", function () {
  it("sets charity, fee, owner on deploy", async function () {
    const { router, owner, charity } = await deploySingle();
    expect(await router.owner()).to.equal(owner.address);
    expect(await router.charityWallet()).to.equal(charity.address);
    expect(await router.feeBps()).to.equal(FEE_BPS);
  });

  it("reverts on zero charity or excessive fee", async function () {
    const Factory = await ethers.getContractFactory("SnagRouter");
    const [, , , charity] = await ethers.getSigners();
    await expect(Factory.deploy(ethers.ZeroAddress, 100)).to.be.revertedWith("Snag: zero charity");
    await expect(Factory.deploy(charity.address, 1001)).to.be.revertedWith("Snag: fee too high");
  });

  it("splits ETH 1%/99% and emits Snagged", async function () {
    const { router, alice, bob, charity } = await deploySingle();
    const amount = ethers.parseEther("2");
    const charityBefore = await ethers.provider.getBalance(charity.address);
    const bobBefore = await ethers.provider.getBalance(bob.address);
    await expect(router.connect(alice).snagAndSend(bob.address, { value: amount }))
      .to.emit(router, "Snagged");
    expect(await ethers.provider.getBalance(charity.address)).to.equal(charityBefore + amount / 100n);
    expect(await ethers.provider.getBalance(bob.address)).to.equal(bobBefore + (amount - amount / 100n));
  });

  it("splits ERC20 1%/99% after approval", async function () {
    const { router, token, alice, bob, charity } = await deploySingle();
    const amount = ethers.parseEther("10");
    await token.mint(alice.address, amount);
    await token.connect(alice).approve(await router.getAddress(), amount);
    await router.connect(alice).snagAndSendERC20(await token.getAddress(), bob.address, amount);
    expect(await token.balanceOf(charity.address)).to.equal(amount / 100n);
    expect(await token.balanceOf(bob.address)).to.equal(amount - amount / 100n);
    expect(await token.balanceOf(await router.getAddress())).to.equal(0n);
  });

  it("charity wallet changes are two step with a delay; fee is owner only", async function () {
    const { router, alice, bob } = await deploySingle();
    await router.proposeCharityWallet(bob.address);
    expect(await router.pendingCharityWallet()).to.equal(bob.address);
    expect(await router.charityWallet()).to.not.equal(bob.address);
    await expect(router.confirmCharityWallet()).to.be.revertedWith("Snag: change not ready");
    await ethers.provider.send("evm_increaseTime", [86400]);
    await ethers.provider.send("evm_mine", []);
    await router.confirmCharityWallet();
    expect(await router.charityWallet()).to.equal(bob.address);
    await expect(router.proposeCharityWallet(ethers.ZeroAddress)).to.be.revertedWith("Snag: zero charity");
    await expect(router.connect(alice).setFeeBps(50)).to.be.revertedWith("Snag: not owner");
    await expect(router.connect(alice).proposeCharityWallet(alice.address)).to.be.revertedWith("Snag: not owner");
  });

  it("ownership transfers; self sends revert", async function () {
    const { router, alice } = await deploySingle();
    await expect(
      router.connect(alice).snagAndSend(await router.getAddress(), { value: 1000 })
    ).to.be.revertedWith("Snag: self destination");
    await router.transferOwnership(alice.address);
    expect(await router.owner()).to.equal(alice.address);
    await expect(router.setFeeBps(50)).to.be.revertedWith("Snag: not owner");
  });

  it("owner can recover stuck ERC20", async function () {
    const { router, token, owner, alice } = await deploySingle();
    await token.mint(await router.getAddress(), 1000);
    await router.recoverERC20(await token.getAddress(), 1000);
    expect(await token.balanceOf(owner.address)).to.equal(1000n);
    await expect(
      router.connect(alice).recoverERC20(await token.getAddress(), 1)
    ).to.be.revertedWith("Snag: not owner");
  });
});
