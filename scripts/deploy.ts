import { ethers } from "hardhat";

async function main() {
  const focusStakeFactory = await ethers.getContractFactory("FocusStake");
  const focusStake = await focusStakeFactory.deploy();
  await focusStake.waitForDeployment();

  console.log("FocusStake deployed to:", await focusStake.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
