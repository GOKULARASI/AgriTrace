const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();

  await supplyChain.waitForDeployment();
  const address = await supplyChain.getAddress();
  
  console.log("SupplyChain deployed to:", address);

  // Save the contract address and ABI to backend
  const backendDir = path.join(__dirname, '../../backend/config');
  if (!fs.existsSync(backendDir)) fs.mkdirSync(backendDir, { recursive: true });

  fs.writeFileSync(
    path.join(backendDir, 'contractAddress.json'),
    JSON.stringify({ address }, undefined, 2)
  );

  const artifact = await hre.artifacts.readArtifact("SupplyChain");
  fs.writeFileSync(
    path.join(backendDir, 'SupplyChain.json'),
    JSON.stringify(artifact, null, 2)
  );
  console.log("Artifacts saved to backend");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
