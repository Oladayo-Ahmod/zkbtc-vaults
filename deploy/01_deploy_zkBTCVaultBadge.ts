import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployZkBTCVaultBadge: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("📦 Deploying zkBTCVaultBadge...");

  const zkBTCVaultBadge = await deploy("zkBTCVaultBadge", {
    from: deployer,
    args: [], // No constructor args
    log: true,
  });

  log(`✅ zkBTCVaultBadge deployed at: ${zkBTCVaultBadge.address}`);
};

export default deployZkBTCVaultBadge;

deployZkBTCVaultBadge.tags = ["zkBTCVaultBadge"];
