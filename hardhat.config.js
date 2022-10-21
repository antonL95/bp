require('@nomicfoundation/hardhat-toolbox');
const dotenv = require('dotenv');
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.14',
  networks: {
    sepolia: {
      url: process.env.ETH_GOERLI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHSCAN_API_KEY,
    },
  },
};
