import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const WBTC_ADDRESS = "0x56DE001f5BB7D8F6cb197C719D6397d6B840Bb3D"

const deployZkBTCVault: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, get, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("🔗 Fetching zkBTCVaultBadge deployment...");
  const badgeDeployment = await get("zkBTCVaultBadge");

  log("🚀 Deploying zkBTCVault...");
  const vaultDeployment = await deploy("zkBTCVault", {
    from: deployer,
    args: [badgeDeployment.address, WBTC_ADDRESS],
    log: true,
  });

  log(`✅ zkBTCVault deployed at: ${vaultDeployment.address}`);
};

export default deployZkBTCVault;

deployZkBTCVault.tags = ["zkBTCVault"];
