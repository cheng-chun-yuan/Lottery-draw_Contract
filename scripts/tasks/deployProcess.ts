import { task } from "hardhat/config"
import { readFileSync, writeFileSync } from "../helpers/pathHelper"
import _ from "lodash"

  task("deploy:VRFMain", "Deploy VRFMain")
  .addFlag("verify", "Validate contract after deploy")
  .setAction(async ({ verify }, hre) => {
    await hre.run("compile")
    const [signer]: any = await hre.ethers.getSigners()
    const feeData = await hre.ethers.provider.getFeeData()

    const VRFMain = await hre.ethers.getContractFactory("contracts/VRFMain.sol:VRFMain", )
    const subscriptionId = 1418 //fuji:1418, sepolia: 9353
    const VRFMainDeployContract: any = await VRFMain.connect(signer).deploy(
      subscriptionId,
      {
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
      // gasLimit: 6000000, // optional: for some weird infra network
    })
    console.log(`VRFMain.sol deployed to ${VRFMainDeployContract.address}`)

    const address = {
      main: VRFMainDeployContract.address,
    }
    const addressData = JSON.stringify(address)
    writeFileSync(`scripts/address/${hre.network.name}/`, "VRFMain.json", addressData)

    await VRFMainDeployContract.deployed()

    if (verify) {
      console.log("verifying contract...")
      await VRFMainDeployContract.deployTransaction.wait(3)
      try {
        await hre.run("verify:verify", {
          address: VRFMainDeployContract.address,
          constructorArguments: [subscriptionId],
          contract: "contracts/VRFMain.sol:VRFMain",
        })
      } catch (e) {
        console.log(e)
      }
    }
  },
  )


  task("deploy:MemeNFTFactory", "Deploy Meme NFT Factory")
  .addFlag("verify", "Validate contract after deploy")
  .setAction(async ({ verify }, hre) => {
    await hre.run("compile")
    const [signer]: any = await hre.ethers.getSigners()
    const feeData = await hre.ethers.provider.getFeeData()

    const MemeNFTFactory = await hre.ethers.getContractFactory("contracts/MemeNFTFactory.sol:MemeNFTFactory", )

    const data = readFileSync(`scripts/address/${hre.network.name}/`, "VRFMain.json")
    //get main : in json
    const _VRFMain = JSON.parse(data).main;
    const MemeNFTFactoryDeployContract: any = await MemeNFTFactory.connect(signer).deploy(
      _VRFMain,
      {
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
      // gasLimit: 6000000, // optional: for some weird infra network
    })
    console.log(`MemeNFTFactory.sol deployed to ${MemeNFTFactoryDeployContract.address}`)

    const address = {
      main: MemeNFTFactoryDeployContract.address,
    }
    const addressData = JSON.stringify(address)
    writeFileSync(`scripts/address/${hre.network.name}/`, "MemeNFTFactory.json", addressData)

    await MemeNFTFactoryDeployContract.deployed()

    if (verify) {
      console.log("verifying contract...")
      await MemeNFTFactoryDeployContract.deployTransaction.wait(3)
      try {
        await hre.run("verify:verify", {
          address: MemeNFTFactoryDeployContract.address,
          constructorArguments: [_VRFMain],
          contract: "contracts/MemeNFTFactory.sol:MemeNFTFactory",
        })
      } catch (e) {
        console.log(e)
      }
    }
  },
  )
