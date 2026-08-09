require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    // OpenZeppelin 5.6 uses the Cancun opcode `mcopy`; enable that EVM version.
    settings: { evmVersion: "cancun" },
  },
  networks: {
    // Hardhat Network: a free local fake blockchain that runs on your machine.
    // No real money is involved. MetaMask can connect to it at http://127.0.0.1:8545
    hardhat: {
      chainId: 31337,
      hardfork: "cancun",
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
};
