import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";
import { Erc20 } from "../typechain-types";

async function main() {
  const [deployer, feeRecipient] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    (await deployer.provider!.getBalance(deployer.address)).toString()
  );

  // Contract parameters
  const name = "FeeToken";
  const symbol = "FEET";
  const totalSupply = 1_000_000; // 1 million tokens
  const feeRecipientAddress = feeRecipient.address;
  const initialOwner = deployer.address;

  // Deploy the contract
  const Erc20Factory = await ethers.getContractFactory("Erc20");
  const token = (await Erc20Factory.deploy(
    name,
    symbol,
    totalSupply,
    feeRecipientAddress,
    initialOwner
  )) as Erc20;

  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("Erc20 deployed to:", tokenAddress);
  console.log("Fee recipient:", feeRecipientAddress);
  console.log("Total supply:", totalSupply);

  // Verify deployment
  const deployedTotalSupply = await token.totalSupply();
  const deployedFeeRecipient = await token.feeRecipient();
  const deployedOwner = await token.owner();

  console.log("\nDeployment Verification:");
  console.log("Total Supply:", ethers.formatEther(deployedTotalSupply), "tokens");
  console.log("Fee Recipient:", deployedFeeRecipient);
  console.log("Owner:", deployedOwner);

  // Save deployment info for frontend
  const deploymentInfo = {
    address: tokenAddress,
    name,
    symbol,
    totalSupply,
    feeRecipient: feeRecipientAddress,
    owner: deployedOwner,
    network: network.name,
    chainId: network.config.chainId,
    deployedAt: new Date().toISOString(),
  };

  const frontendDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  // Save deployment info
  fs.writeFileSync(
    path.join(frontendDir, "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Copy ABI to frontend
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "Erc20.sol",
    "Erc20.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  fs.writeFileSync(
    path.join(frontendDir, "Erc20.json"),
    JSON.stringify(artifact, null, 2)
  );
  console.log("\nDeployment info saved to frontend/src/contracts/");
  console.log("Contract ABI saved to frontend/src/contracts/Erc20.json");

  // Give some tokens to the deployer for testing
  console.log("\nGiving tokens to deployer for testing...");
  await token.giveMeOneFullToken();
  const deployerBalance = await token.balanceOf(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(deployerBalance), "tokens");

  // Give test tokens to fee recipient if local
  if (network.name === "localhost" || network.name === "hardhat") {
    await token.giveTokens(feeRecipientAddress, ethers.parseEther("100"));
    const feeRecipientBalance = await token.balanceOf(feeRecipientAddress);
    console.log("Fee recipient balance:", ethers.formatEther(feeRecipientBalance), "tokens");
  }

  console.log("\nDeployment completed successfully!");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
