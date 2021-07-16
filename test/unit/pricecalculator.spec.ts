import {ethers, deployments} from "hardhat"
import {BigNumber as BN, Signer} from "ethers"
import {solidity} from "ethereum-waffle"
import chai from "chai"
import {HegicPool} from "../../typechain/HegicPool"
import {WethMock} from "../../typechain/WethMock"
import {PriceCalculator} from "../../typechain/PriceCalculator"
import {PriceProviderMock} from "../../typechain/PriceProviderMock"

chai.use(solidity)
const {expect} = chai

describe("PriceCalculator", async () => {
  let hegicPoolWETH: HegicPool
  let priceCalculator: PriceCalculator
  let WETH: WethMock
  let fakePriceProvider: PriceProviderMock
  let alice: Signer

  beforeEach(async () => {
    await deployments.fixture()
    ;[, alice] = await ethers.getSigners()

    WETH = (await ethers.getContract("WETH")) as WethMock

    hegicPoolWETH = (await ethers.getContract("HegicWETHCALL")) as HegicPool

    fakePriceProvider = (await ethers.getContract(
      "ETHPriceProvider",
    )) as PriceProviderMock
    priceCalculator = (await ethers.getContract(
      "ETHCallPriceCalculator",
    )) as PriceCalculator

    await WETH.connect(alice).deposit({value: BN.from(10).pow(20)})
    await WETH.connect(alice).approve(
      hegicPoolWETH.address,
      ethers.constants.MaxUint256,
    )
    await hegicPoolWETH
      .connect(alice)
      .provideFrom(await alice.getAddress(), 100000, true, 100000)
  })

  describe("constructor & settings", async () => {
    it("should set all initial state", async () => {
      expect(await priceCalculator.impliedVolRate()).to.be.eq(
        BN.from(10000000000000),
      )
      expect(await priceCalculator.utilizationRate()).to.be.eq(BN.from(0))
      expect(await priceCalculator.priceProvider()).to.be.eq(
        fakePriceProvider.address,
      )
    })

    describe("setImpliedVolRate", async () => {
      it("should revert if the caller is not the owner", async () => {
        await expect(
          priceCalculator.connect(alice).setImpliedVolRate(BN.from(22000)),
        ).to.be.revertedWith("caller is not the owner")
      })

      it("should set the impliedVolRate correctly", async () => {
        const impliedVolRateBefore = await priceCalculator.impliedVolRate()
        expect(impliedVolRateBefore).to.be.eq(BN.from(10000000000000))
        await priceCalculator.setImpliedVolRate(BN.from(11000))
        const impliedVolRateAfter = await priceCalculator.impliedVolRate()
        expect(impliedVolRateAfter).to.be.eq(BN.from(11000))
      })
    })

    describe("calculateTotalPremium", async () => {
      it("should revert if the strike is not the current price", async () => {
        await expect(
          priceCalculator.calculateTotalPremium(
            BN.from(604800),
            BN.from(100),
            BN.from(50100),
          ),
        ).to.be.revertedWith("Only ATM options are currently available")
      })

      it("should return correct values", async () => {
        const feeResponse = await priceCalculator.calculateTotalPremium(
          BN.from(604800),
          BN.from(ethers.utils.parseUnits("1")),
          BN.from(2500e8),
        )
        expect(feeResponse.settlementFee).to.be.eq("155400000000000000")
        expect(feeResponse.premium).to.be.eq("621600000000000000")
      })
    })
  })
})
