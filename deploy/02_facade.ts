import {HardhatRuntimeEnvironment} from "hardhat/types"

async function deployment(hre: HardhatRuntimeEnvironment): Promise<void> {
  const {deployments, getNamedAccounts} = hre
  const {deploy, get, execute} = deployments
  const {deployer} = await getNamedAccounts()

  const WETH = await get("WETH")
  const WBTC = await get("WBTC")
  const USDC = await get("USDC")

  const WBTCPriceProvider = await get("WBTCPriceProvider")
  const ETHPriceProvider = await get("ETHPriceProvider")

  const uniswapRouter = await get("UniswapRouter")

  await deploy("Facade", {
    from: deployer,
    args: [
      WETH.address,
      uniswapRouter.address,
      "0x0000000000000000000000000000000000000000",
    ],
  })

  await execute(
    "Facade",
    {from: deployer},
    "poolApprove",
    (await get("HegicWETHPUT")).address,
  )

  await execute(
    "Facade",
    {from: deployer},
    "poolApprove",
    (await get("HegicWETHCALL")).address,
  )

  await execute(
    "Facade",
    {from: deployer},
    "poolApprove",
    (await get("HegicWBTCPUT")).address,
  )

  await execute(
    "Facade",
    {from: deployer},
    "poolApprove",
    (await get("HegicWBTCCALL")).address,
  )
}

deployment.tags = ["test"]
export default deployment
