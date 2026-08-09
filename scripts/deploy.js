/**
 * Deploy EventTicketing to the local Hardhat network and create a sample event
 * so the frontend has something to show immediately.
 *
 * Run with: npx hardhat run scripts/deploy.js --network localhost
 */
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  // Get the first Hardhat account (a test wallet with fake ETH)
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Compile (if needed) and deploy the contract
  const EventTicketing = await hre.ethers.getContractFactory("EventTicketing");
  const ticketing = await EventTicketing.deploy();
  await ticketing.waitForDeployment();

  const address = await ticketing.getAddress();
  console.log("EventTicketing deployed to:", address);

  // Create a demo event so the UI can display something without extra steps.
  // 0.01 ETH = 10^16 wei
  const facePrice = hre.ethers.parseEther("0.01");
  const tx = await ticketing.createEvent(
    "Campus Concert",
    facePrice,
    100, // supply
    4 // per-wallet cap
  );
  await tx.wait();
  console.log("Demo event #1 created: Campus Concert @ 0.01 ETH");

  // Write address + ABI for the frontend to import.
  // ABI = Application Binary Interface: the "menu" of functions the contract exposes,
  // so ethers.js knows how to encode/decode calls.
  const artifact = await hre.artifacts.readArtifact("EventTicketing");
  const outDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  fs.mkdirSync(outDir, { recursive: true });

  const deployment = {
    address,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    abi: artifact.abi,
  };

  fs.writeFileSync(
    path.join(outDir, "EventTicketing.json"),
    JSON.stringify(deployment, null, 2)
  );
  console.log("Wrote frontend/src/contracts/EventTicketing.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
