const hre = require("hardhat");

/**
 * Deploy a single PetitionContract
 * @param {string} petitionId - Unique identifier for the petition
 * @param {string} title - Title of the petition
 * @param {number} signatureThreshold - Minimum signatures required
 * @param {number} deadline - Unix timestamp for deadline
 * @returns {Promise<{contract: Contract, address: string, txHash: string}>}
 */
async function deployPetitionContract(petitionId, title, signatureThreshold, deadline) {
  console.log("Deploying PetitionContract...");
  console.log("Parameters:", {
    petitionId,
    title,
    signatureThreshold,
    deadline: new Date(deadline * 1000).toISOString(),
  });

  // Get the contract factory
  const PetitionContract = await hre.ethers.getContractFactory("PetitionContract");

  // Deploy the contract
  const petition = await PetitionContract.deploy(
    petitionId,
    title,
    signatureThreshold,
    deadline
  );

  await petition.waitForDeployment();

  const address = await petition.getAddress();
  const deploymentTx = petition.deploymentTransaction();

  console.log("PetitionContract deployed to:", address);
  console.log("Transaction hash:", deploymentTx.hash);

  return {
    contract: petition,
    address: address,
    txHash: deploymentTx.hash,
  };
}

/**
 * Verify contract on Polygonscan
 * @param {string} contractAddress - Address of deployed contract
 * @param {Array} constructorArgs - Constructor arguments used during deployment
 */
async function verifyContract(contractAddress, constructorArgs) {
  console.log("Verifying contract on Polygonscan...");

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("Contract already verified!");
    } else {
      console.error("Verification failed:", error.message);
    }
  }
}

/**
 * Main deployment script
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Example deployment - replace with actual values
  const petitionId = "test-petition-" + Date.now();
  const title = "Test Petition for Governance System";
  const signatureThreshold = 10;
  const deadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days from now

  const deployment = await deployPetitionContract(
    petitionId,
    title,
    signatureThreshold,
    deadline
  );

  // Wait for a few block confirmations before verifying
  console.log("Waiting for block confirmations...");
  await deployment.contract.deploymentTransaction().wait(5);

  // Verify on Polygonscan (only on testnet/mainnet)
  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId !== 31337n) { // Not local hardhat network
    await verifyContract(deployment.address, [
      petitionId,
      title,
      signatureThreshold,
      deadline,
    ]);
  }

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("Contract Address:", deployment.address);
  console.log("Transaction Hash:", deployment.txHash);
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  deployPetitionContract,
  verifyContract,
};
