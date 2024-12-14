require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("./tasks/ops");

module.exports = {
  solidity: "0.8.28",
  networks: {
    sonic: {
      url: "https://rpc.blaze.soniclabs.com",
      accounts: [process.env.SONIC_TESTNET],
    },
  },
};
