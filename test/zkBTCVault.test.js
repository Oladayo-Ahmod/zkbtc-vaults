const { expect } = require("chai");
const { ethers } = require("hardhat");
const { groth16 } = require("snarkjs");

describe("zkBTCVault", function () {
  let owner, user1, user2;
  let btcToken, nftBadge, vault;
  let mockVerifier;

  //  proof data 
 const proof = {
  a: [
    ethers.toBigInt("0x102ba07314a8146ea6a934a271628857514868a356257f81915e8aa1db6f5c0d"),
    ethers.toBigInt("0x2912d1855c7ffee3ae8703224f688904760a15bdc0747c1dc558911c1be2c65b")
  ],
  b: [
    [
      ethers.toBigInt("0x14e9f9bf018ef260723e93a8419393a2dd63dd7f1c5452cd16c7e766b6283f45"),
      ethers.toBigInt("0x257a28cdd104047de6e44b8687ebebc212feab5964214cbef5a9028241f53f36")
    ],
    [
      ethers.toBigInt("0x29d13fd9b92286caa796201ca21bbceb3bec23248f3383d7c66a2389c7f4854e"),
      ethers.toBigInt("0x2e8d1a9cfc1fc0ac279f74fd76e7dba4cdd487debafc79203087d42f6f2ee25e")
    ]
  ],
  c: [
    ethers.toBigInt("0x239f04ffc854f344ec7fd82fbd7f94fe5db00096d10ab21ca816128351d7389d"),
    ethers.toBigInt("0x30193db72c378a901bde074f8f41effdaeef756d2e2156b18d494d0b76cf2783")
  ],
  input: [
    ethers.toBigInt("0x0000000000000000000000000000000000000000000000000000000000000001")
  ]
};


  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock ERC20 (WBTC)
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    btcToken = await ERC20Mock.deploy("Wrapped BTC", "WBTC", 8);

    // Deploy NFT Badge
    const zkBTCVaultBadge = await ethers.getContractFactory("zkBTCVaultBadge");
    nftBadge = await zkBTCVaultBadge.deploy();

    // Deploy Vault
    const zkBTCVault = await ethers.getContractFactory("zkBTCVault");
    vault = await zkBTCVault.deploy(btcToken.target, nftBadge.target);

    // ✅ Transfer ownership of badge contract to vault
    await nftBadge.transferOwnership(vault.target);

    // Fund users with mock WBTC
    await btcToken.mint(user1.address, ethers.parseEther("10"));
    await btcToken.mint(user2.address, ethers.parseEther("5"));
  });

  describe("Deposit", () => {
    it("Should accept BTC deposits", async () => {
      const amount = ethers.parseEther("1");
      await btcToken.connect(user1).approve(vault.target, amount);
      
      await expect(vault.connect(user1).deposit(amount))
        .to.emit(vault, "VaultDeposited")
        .withArgs(user1.address, amount);

      expect(await vault.balances(user1.address)).to.equal(amount);
    });

    it("Should reject zero deposits", async () => {
      await expect(vault.connect(user1).deposit(0))
        .to.be.revertedWith("Amount must be > 0");
    });
  });

  describe("Unlock", () => {
    beforeEach(async () => {
      // Setup deposit for tests
      const amount = ethers.parseEther("1");
      await btcToken.connect(user1).approve(vault.target, amount);
      await vault.connect(user1).deposit(amount);
    });

    it("Should unlock vault with valid proof", async () => {
      await expect(
        vault.connect(user1).unlockVault(
          proof.a,
          proof.b,
          proof.c,
          proof.input
        )
      )
        .to.emit(vault, "VaultUnlocked")
        .withArgs(user1.address, proof.input[0]);

      expect(await vault.unlocked(user1.address)).to.be.true;
      expect(await vault.nullifiersUsed(proof.input[0])).to.be.true;
    });

    it("Should mint NFT badge on first unlock", async () => {
      await vault.connect(user1).unlockVault(
        proof.a,
        proof.b,
        proof.c,
        proof.input
      );

      expect(await nftBadge.balanceOf(user1.address)).to.equal(1);
    });

    it("Should reject duplicate nullifiers", async () => {
      await vault.connect(user1).unlockVault(
        proof.a,
        proof.b,
        proof.c,
        proof.input
      );

      await expect(
        vault.connect(user2).unlockVault(
          proof.a,
          proof.b,
          proof.c,
          proof.input
        )
      ).to.be.revertedWith("Proof already used");
    });
  });

  describe("Withdraw", () => {
   beforeEach(async () => {
  const amount = ethers.parseEther("1");
  await btcToken.connect(user1).approve(vault.target, amount);
  await vault.connect(user1).deposit(amount);

  // Clone and override nullifier to avoid reuse
  const proofCopy = JSON.parse(JSON.stringify(proof));
  const uniqueNullifier = ethers.toBigInt(
    ethers.keccak256(ethers.toUtf8Bytes(`${Date.now()}-${Math.random()}`))
  );
  proofCopy.input[0] = uniqueNullifier;

  // Save for test case to access
  this.currentProof = proofCopy;

  await vault.connect(user1).unlockVault(
    proofCopy.a,
    proofCopy.b,
    proofCopy.c,
    proofCopy.input
  );
});


    it("Should withdraw funds when unlocked", async () => {
      const userBalance = await vault.balances(user1.address);
      
      await expect(vault.connect(user1).withdraw())
        .to.emit(vault, "VaultWithdrawn")
        .withArgs(user1.address, userBalance);

      expect(await btcToken.balanceOf(user1.address)).to.equal(userBalance);
    });

    it("Should reject withdrawals when locked", async () => {
      await expect(vault.connect(user2).withdraw())
        .to.be.revertedWith("Vault is locked");
    });
  });

  describe("Admin Functions", () => {
    it("Should allow owner to update BTC token", async () => {
      const newToken = await (await ethers.getContractFactory("ERC20Mock"))
        .deploy("New BTC", "NBTC",8);
      
      await vault.connect(owner).setBTC(newToken.target);
      expect(await vault.btcToken()).to.equal(newToken.target);
    });

    it("Should reject non-owner BTC updates", async () => {
      await expect(vault.connect(user1).setBTC(ethers.ZeroAddress))
        .to.be.revertedWith("Only owner");
    });
  });
});