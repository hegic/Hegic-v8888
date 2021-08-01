import {HardhatRuntimeEnvironment} from "hardhat/types"
import {HegicPool} from "../typechain/HegicPool"
import {OptionsManager} from "../typechain/OptionsManager"

async function deployment(hre: HardhatRuntimeEnvironment): Promise<void> {
  const {deployments, getNamedAccounts, ethers} = hre
  const {deploy} = deployments
  const {deployer} = await getNamedAccounts()

  const HEGIC = await deploy("HEGIC", {
    contract: "ERC20Mock",
    from: deployer,
    log: true,
    args: ["HEGIC", "H", 18],
  })

  const USDC = await deploy("USDC", {
    contract: "ERC20Mock",
    from: deployer,
    log: true,
    args: ["USDC (Mock)", "USDC", 6],
  })

  const WETH = await deploy("WETH", {
    contract: "WETHMock",
    from: deployer,
    log: true,
  })

  const WBTC = await deploy("WBTC", {
    contract: "ERC20Mock",
    from: deployer,
    log: true,
    args: ["WBTC (Mock)", "WBTC", 8],
  })

  const BTCPriceProvider = await deploy("WBTCPriceProvider", {
    contract: "PriceProviderMock",
    from: deployer,
    log: true,
    args: [50000e8],
  })

  const ETHPriceProvider = await deploy("ETHPriceProvider", {
    contract: "PriceProviderMock",
    from: deployer,
    log: true,
    args: [2500e8],
  })

  const OptionsManager = await deploy("OptionsManager", {
    from: deployer,
    log: true,
  })

  const WBTCStaking = await deploy("WBTCStaking", {
    contract: "HegicStaking",
    from: deployer,
    log: true,
    args: [HEGIC.address, WBTC.address, "WBTC Staking", "WBTC S"],
  })

  const WETHStaking = await deploy("WETHStaking", {
    contract: "HegicStaking",
    from: deployer,
    log: true,
    args: [HEGIC.address, WETH.address, "WBTC Staking", "WETH S"],
  })

  const USDCStaking = await deploy("USDCStaking", {
    contract: "HegicStaking",
    from: deployer,
    log: true,
    args: [HEGIC.address, USDC.address, "USDC Staking", "USDC S"],
  })

  const HegicAtmCall_WETH = await deploy("HegicWETHCALL", {
    contract: "HegicCALL",
    from: deployer,
    log: true,
    args: [
      WETH.address,
      "HegicAtmCall_WETH",
      "hEAC",
      OptionsManager.address,
      ethers.constants.AddressZero,
      WETHStaking.address,
      ETHPriceProvider.address,
    ],
  })

  const HegicAtmPut_WETH = await deploy("HegicWETHPUT", {
    contract: "HegicPUT",
    from: deployer,
    log: true,
    args: [
      USDC.address,
      "HegicAtmPut_WETH",
      "hEAP",
      OptionsManager.address,
      ethers.constants.AddressZero,
      USDCStaking.address,
      ETHPriceProvider.address,
      18,
    ],
  })

  const HegicAtmCall_WBTC = await deploy("HegicWBTCCALL", {
    contract: "HegicCALL",
    from: deployer,
    log: true,
    args: [
      WBTC.address,
      "HegicAtmCall_WBTC",
      "hWAC",
      OptionsManager.address,
      ethers.constants.AddressZero,
      WBTCStaking.address,
      BTCPriceProvider.address,
    ],
  })

  const HegicAtmPut_WBTC = await deploy("HegicWBTCPUT", {
    contract: "HegicPUT",
    from: deployer,
    log: true,
    args: [
      USDC.address,
      "HegicAtmPut_WBTC",
      "hWAP",
      OptionsManager.address,
      ethers.constants.AddressZero,
      USDCStaking.address,
      BTCPriceProvider.address,
      8,
    ],
  })

  const WETHCALLPricer = await deploy("ETHCallPriceCalculator", {
    contract: "PriceCalculator",
    from: deployer,
    log: true,
    args: [1e13, ETHPriceProvider.address, HegicAtmCall_WETH.address],
  })

  const WETHPUTPricer = await deploy("ETHPutPriceCalculator", {
    contract: "PriceCalculator",
    from: deployer,
    log: true,
    args: [1e13, ETHPriceProvider.address, HegicAtmPut_WETH.address],
  })

  const WBTCCALLPricer = await deploy("BTCCallPriceCalculator", {
    contract: "PriceCalculator",
    from: deployer,
    log: true,
    args: [1e13, BTCPriceProvider.address, HegicAtmCall_WBTC.address],
  })

  const WBTCPUTPricer = await deploy("BTCPutPriceCalculator", {
    contract: "PriceCalculator",
    from: deployer,
    log: true,
    args: [1e13, BTCPriceProvider.address, HegicAtmPut_WBTC.address],
  })

  const HegicAtmCall_WETHInstance = (await ethers.getContract(
    "HegicWETHCALL",
  )) as HegicPool

  const HegicAtmPut_WETHInstance = (await ethers.getContract(
    "HegicWETHPUT",
  )) as HegicPool

  const HegicAtmCall_WBTCInstance = (await ethers.getContract(
    "HegicWBTCCALL",
  )) as HegicPool

  const HegicAtmPut_WBTCInstance = (await ethers.getContract(
    "HegicWBTCPUT",
  )) as HegicPool

  const optionsManagerInstance = (await ethers.getContract(
    "OptionsManager",
  )) as OptionsManager

  await optionsManagerInstance.grantRole(
    await optionsManagerInstance.HEGIC_POOL_ROLE(),
    HegicAtmCall_WETH.address,
  )

  await optionsManagerInstance.grantRole(
    await optionsManagerInstance.HEGIC_POOL_ROLE(),
    HegicAtmPut_WETH.address,
  )

  await optionsManagerInstance.grantRole(
    await optionsManagerInstance.HEGIC_POOL_ROLE(),
    HegicAtmCall_WBTC.address,
  )

  await optionsManagerInstance.grantRole(
    await optionsManagerInstance.HEGIC_POOL_ROLE(),
    HegicAtmPut_WBTC.address,
  )

  await HegicAtmCall_WETHInstance.setPriceCalculator(WETHCALLPricer.address)
  await HegicAtmPut_WETHInstance.setPriceCalculator(WETHPUTPricer.address)

  await HegicAtmCall_WBTCInstance.setPriceCalculator(WBTCCALLPricer.address)
  await HegicAtmPut_WBTCInstance.setPriceCalculator(WBTCPUTPricer.address)
}

deployment.tags = ["test"]
export default deployment
