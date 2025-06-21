import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { Erc20 } from "../typechain-types"; // Adjust path as needed

describe("Erc20", function () {
  let Erc20Factory: any;
  let token: Erc20;
  let owner: Signer;
  let feeRecipient: Signer;
  let addr1: Signer;
  let addr2: Signer;
  let addrs: Signer[];

  const name = "NewToken";
  const symbol = "NTKN";
  const totalSupply = 10_000_000;

  beforeEach(async function () {
    [owner, feeRecipient, addr1, addr2, ...addrs] = await ethers.getSigners();

    Erc20Factory = await ethers.getContractFactory("Erc20");
    token = await Erc20Factory.deploy(
      name,
      symbol,
      totalSupply,
      await feeRecipient.getAddress(),
      await owner.getAddress()
    );

    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await token.name()).to.equal(name);
      expect(await token.symbol()).to.equal(symbol);
    });

    it("Should set the right total supply", async function () {
      const expectedTotalSupply = ethers.parseEther(totalSupply.toString());
      expect(await token.totalSupply()).to.equal(expectedTotalSupply);
    });

    it("Should set the right fee recipient", async function () {
      expect(await token.feeRecipient()).to.equal(await feeRecipient.getAddress());
    });

    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(await owner.getAddress());
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerAddress = await owner.getAddress();
      const ownerBalance = await token.balanceOf(ownerAddress);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Fee Calculations", function () {
    it("Should calculate 1% fee correctly", async function () {
      const amount = ethers.parseEther("100");
      const expectedFee = ethers.parseEther("1");
      expect(await token.calculateFee(amount)).to.equal(expectedFee);
    });

    it("Should calculate net transfer amount correctly", async function () {
      const amount = ethers.parseEther("100");
      const expectedNet = ethers.parseEther("99");
      expect(await token.calculateNetTransfer(amount)).to.equal(expectedNet);
    });
  });

  describe("Token Distribution", function () {
    it("Should give one full token to caller", async function () {
      const addr1Address = await addr1.getAddress();
      const initialBalance = await token.balanceOf(addr1Address);
      await token.connect(addr1).giveMeOneFullToken();
      const finalBalance = await token.balanceOf(addr1Address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("1"));
    });

    it("Should allow owner to give tokens to any address", async function () {
      const amount = ethers.parseEther("50");
      const addr1Address = await addr1.getAddress();
      const initialBalance = await token.balanceOf(addr1Address);

      await token.connect(owner).giveTokens(addr1Address, amount);
      const finalBalance = await token.balanceOf(addr1Address);
      expect(finalBalance - initialBalance).to.equal(amount);
    });

    it("Should not allow non-owner to give tokens", async function () {
      const amount = ethers.parseEther("50");
      await expect(
        token.connect(addr1).giveTokens(await addr2.getAddress(), amount)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });

  describe("Transfers with Fee", function () {
    beforeEach(async function () {
      await token.connect(owner).giveTokens(await addr1.getAddress(), ethers.parseEther("1000"));
    });

    it("Should transfer with 1% fee deducted", async function () {
      const transferAmount = ethers.parseEther("100");
      const expectedFee = ethers.parseEther("1");
      const expectedReceived = ethers.parseEther("99");

      const addr1Address = await addr1.getAddress();
      const addr2Address = await addr2.getAddress();
      const feeRecipientAddress = await feeRecipient.getAddress();

      const addr1Initial = await token.balanceOf(addr1Address);
      const addr2Initial = await token.balanceOf(addr2Address);
      const feeInitial = await token.balanceOf(feeRecipientAddress);

      await token.connect(addr1).transfer(addr2Address, transferAmount);

      const addr1Final = await token.balanceOf(addr1Address);
      const addr2Final = await token.balanceOf(addr2Address);
      const feeFinal = await token.balanceOf(feeRecipientAddress);

      expect(addr1Initial - addr1Final).to.equal(transferAmount);
      expect(addr2Final - addr2Initial).to.equal(expectedReceived);
      expect(feeFinal - feeInitial).to.equal(expectedFee);
    });

    it("Should emit FeeCollected event", async function () {
      const transferAmount = ethers.parseEther("100");
      const expectedFee = ethers.parseEther("1");

      await expect(token.connect(addr1).transfer(await addr2.getAddress(), transferAmount))
        .to.emit(token, "FeeCollected")
        .withArgs(await addr1.getAddress(), await addr2.getAddress(), expectedFee);
    });

    it("Should handle transferFrom with fee", async function () {
      const transferAmount = ethers.parseEther("100");
      const expectedFee = ethers.parseEther("1");
      const expectedReceived = ethers.parseEther("99");

      const addr1Address = await addr1.getAddress();
      const addr2Address = await addr2.getAddress();
      const ownerAddress = await owner.getAddress();
      const feeRecipientAddress = await feeRecipient.getAddress();

      await token.connect(addr1).approve(addr2Address, transferAmount);

      const addr1Initial = await token.balanceOf(addr1Address);
      const ownerInitial = await token.balanceOf(ownerAddress);
      const feeInitial = await token.balanceOf(feeRecipientAddress);

      await token.connect(addr2).transferFrom(addr1Address, ownerAddress, transferAmount);

      const addr1Final = await token.balanceOf(addr1Address);
      const ownerFinal = await token.balanceOf(ownerAddress);
      const feeFinal = await token.balanceOf(feeRecipientAddress);

      expect(addr1Initial - addr1Final).to.equal(transferAmount);
      expect(ownerFinal - ownerInitial).to.equal(expectedReceived);
      expect(feeFinal - feeInitial).to.equal(expectedFee);
    });

    it("Should fail if insufficient balance", async function () {
      const transferAmount = ethers.parseEther("2000");

      await expect(
        token.connect(addr1).transfer(await addr2.getAddress(), transferAmount)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("Fee Recipient Management", function () {
    it("Should allow owner to update fee recipient", async function () {
      const newRecipient = await addr1.getAddress();
      await expect(token.connect(owner).updateFeeRecipient(newRecipient))
        .to.emit(token, "FeeRecipientUpdated")
        .withArgs(await feeRecipient.getAddress(), newRecipient);

      expect(await token.feeRecipient()).to.equal(newRecipient);
    });

    it("Should not allow non-owner to update fee recipient", async function () {
      await expect(
        token.connect(addr1).updateFeeRecipient(await addr2.getAddress())
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should not allow setting fee recipient to zero address", async function () {
      await expect(
        token.connect(owner).updateFeeRecipient(ethers.ZeroAddress)
      ).to.be.revertedWith("Fee recipient cannot be zero address");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle small amounts correctly", async function () {
      const addr1Address = await addr1.getAddress();
      const addr2Address = await addr2.getAddress();

      await token.connect(owner).giveTokens(addr1Address, 1);
      await token.connect(addr1).transfer(addr2Address, 1);

      expect(await token.balanceOf(addr2Address)).to.equal(1);
      expect(await token.balanceOf(await feeRecipient.getAddress())).to.equal(0);
    });

    it("Should handle transfers that result in 0 fee", async function () {
      const smallAmount = 50;
      const addr1Address = await addr1.getAddress();
      const addr2Address = await addr2.getAddress();

      await token.connect(owner).giveTokens(addr1Address, smallAmount);
      await token.connect(addr1).transfer(addr2Address, smallAmount);

      expect(await token.balanceOf(addr2Address)).to.equal(smallAmount);
      expect(await token.balanceOf(await feeRecipient.getAddress())).to.equal(0);
    });
  });
});
