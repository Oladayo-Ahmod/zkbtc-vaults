import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy"
import dotenv from 'dotenv'
dotenv.config()

const PRIVATE_KEY= process.env.PRIVATE_KEY
const config: HardhatUserConfig = {
  solidity: "0.8.28",
   networks: {
        citrea: {
            url: "https://rpc.testnet.citrea.xyz",
            chainId: 5115,
            accounts: [PRIVATE_KEY!],
             saveDeployments: true,
        },
    },

      namedAccounts: {
      deployer: {
          default: 0, 
          1: 0,
      },
  },
};

export default config;
