import {HardhatUserConfig} from "hardhat/types"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-etherscan"
import "hardhat-typechain"
import "hardhat-deploy"
import "hardhat-abi-exporter"
import "hardhat-deploy-ethers"
import "hardhat-docgen"
import "hardhat-gas-reporter"
import "hardhat-watcher"
import "solidity-coverage"
import {config as dotEnvConfig} from "dotenv"

dotEnvConfig()

const INFURA_API_KEY = process.env.INFURA_API_KEY || ""
const ROPSTEN_PRIVATE_KEY =
  process.env.ROPSTEN_PRIVATE_KEY ||
  "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3" // well known private key
const {ETHERSCAN_API_KEY} = process.env

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ROPSTEN_PRIVATE_KEY],
    },
    coverage: {
      url: "http://127.0.0.1:8555",
    },
    hlocal: {
      url: "http://localhost:8545",
      accounts: {
        mnemonic:
          "myth like bonus scare over problem client lizard pioneer submit female collect", // well known symbolic
      },
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  mocha: {
    reporter: "nyan",
  },
  gasReporter: {
    currency: "USD",
    // gasPrice: 20,
    coinmarketcap: "27d369d7-d392-4cb6-8d37-fd8a6279ce7e",
    enabled: process.env.REPORT_GAS ? true : false,
  },
  docgen: {
    path: "./docs",
    runOnCompile: true,
  },
}

export default config
