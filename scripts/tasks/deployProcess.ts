import { task } from "hardhat/config"
import { readFileSync, writeFileSync } from "../helpers/pathHelper"
import _ from "lodash"
task("deploy:contract", "Deploy contract")
  .addParam("contract")
  .setAction(async ({ contract }, hre) => {
    await hre.run("compile")
    const [signer]: any = await hre.ethers.getSigners()
    const contractFactory = await hre.ethers.getContractFactory(contract)
    // if you mint in constructor, you need to add value in deploy function
    const deployContract: any = await contractFactory.connect(signer).deploy()
    console.log(`TestToken.sol deployed to ${deployContract.address}`)

    const address = {
      main: deployContract.address,
    }
    const addressData = JSON.stringify(address)
    writeFileSync(`scripts/address/${hre.network.name}/`, "mainContract.json", addressData)

    await deployContract.deployed()
  },
  )

task("deploy:token", "Deploy Token")
  .addFlag("verify", "Validate contract after deploy")
  .setAction(async ({ verify }, hre) => {
    await hre.run("compile")
    const [signer]: any = await hre.ethers.getSigners()
    const feeData = await hre.ethers.provider.getFeeData()

    const donateTokenFactory = await hre.ethers.getContractFactory("contracts/DonateToken.sol:DonateToken", )
    const amount = BigInt(100000000000000)
    const donateTokenDeployContract: any = await donateTokenFactory.connect(signer).deploy(amount, {
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
      // gasLimit: 6000000, // optional: for some weird infra network
    })
    console.log(`DonateToken.sol deployed to ${donateTokenDeployContract.address}`)

    const address = {
      main: donateTokenDeployContract.address,
    }
    const addressData = JSON.stringify(address)
    writeFileSync(`scripts/address/${hre.network.name}/`, "DonateToken.json", addressData)

    await donateTokenDeployContract.deployed()

    if (verify) {
      console.log("verifying contract...")
      await donateTokenDeployContract.deployTransaction.wait(3)
      try {
        await hre.run("verify:verify", {
          address: donateTokenDeployContract.address,
          constructorArguments: [100000000000000],
          contract: "contracts/DonateToken.sol:DonateToken",
        })
      } catch (e) {
        console.log(e)
      }
    }
  },
  )

task("deploy:nftFactory", "Deploy NFT factory")
  .addFlag("verify", "Validate contract after deploy")
  .setAction(async ({ verify }, hre) => {
    await hre.run("compile")
    const [signer]: any = await hre.ethers.getSigners()
    const feeData = await hre.ethers.provider.getFeeData()

    const nftContractFactory = await hre.ethers.getContractFactory("contracts/PoolFactory.sol:PoolFactory", )
    const nftDeployContract: any = await nftContractFactory.connect(signer).deploy(
      //my wallet address
      {
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        maxFeePerGas: feeData.maxFeePerGas,
        // gasLimit: 6000000, // optional: for some weird infra network
    })
    console.log(`PoolFactory.sol deployed to ${nftDeployContract.address}`)

    const address = {
      main: nftDeployContract.address,
    }
    const addressData = JSON.stringify(address)
    writeFileSync(`scripts/address/${hre.network.name}/`, "PoolFactory.json", addressData)

    await nftDeployContract.deployed()

    if (verify) {
      console.log("verifying nft contract...")
      await nftDeployContract.deployTransaction.wait(3)
      try {
        await hre.run("verify:verify", {
          address: nftDeployContract.address,
          contract: "contracts/PoolFactory.sol:PoolFactory",
        })
      } catch (e) {
        console.log(e)
      }
    }
  },
  )

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

  task("deploy:memeNFT", "Deploy meme NFT")
  .addFlag("verify", "Validate contract after deploy")
  .setAction(async ({ verify }, hre) => {
    await hre.run("compile")
    const [signer]: any = await hre.ethers.getSigners()
    const feeData = await hre.ethers.provider.getFeeData()

    const memeNFT = await hre.ethers.getContractFactory("contracts/MemeNFT.sol:MemeNFT", )
    const _name = "MemeNFT"
    const _symbol = "Meme"
    const _baseURI = "https://ipfs.io/ipfs/"
    const _percentage = [10, 25, 45, 70, 100]
    const data = readFileSync(`scripts/address/${hre.network.name}/`, "VRFMain.json")
    //get main : in json
    const _VRFMain = JSON.parse(data).main;
    const memeNFTDeployContract: any = await memeNFT.connect(signer).deploy(
      _name,
      _symbol,
      _baseURI,
      _percentage,
      _VRFMain,
      {
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
      // gasLimit: 6000000, // optional: for some weird infra network
    })
    console.log(`MemeNFT.sol deployed to ${memeNFTDeployContract.address}`)

    const address = {
      main: memeNFTDeployContract.address,
    }
    const addressData = JSON.stringify(address)
    writeFileSync(`scripts/address/${hre.network.name}/`, "MemeNFT.json", addressData)

    await memeNFTDeployContract.deployed()

    if (verify) {
      console.log("verifying contract...")
      await memeNFTDeployContract.deployTransaction.wait(3)
      try {
        await hre.run("verify:verify", {
          address: memeNFTDeployContract.address,
          constructorArguments: [_name, _symbol, _baseURI, _percentage, _VRFMain],
          contract: "contracts/MemeNFT.sol:MemeNFT",
        })
      } catch (e) {
        console.log(e)
      }
    }
  },
  )


  task("deploy:memeNFTFactory", "Deploy meme NFT Factory")
  .addFlag("verify", "Validate contract after deploy")
  .setAction(async ({ verify }, hre) => {
    await hre.run("compile")
    const [signer]: any = await hre.ethers.getSigners()
    const feeData = await hre.ethers.provider.getFeeData()

    const memeNFTFactory = await hre.ethers.getContractFactory("contracts/MemeNFTFactory.sol:MemeNFTFactory", )

    const data = readFileSync(`scripts/address/${hre.network.name}/`, "VRFMain.json")
    //get main : in json
    const _VRFMain = JSON.parse(data).main;
    const memeNFTFactoryDeployContract: any = await memeNFTFactory.connect(signer).deploy(
      _VRFMain,
      {
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
      // gasLimit: 6000000, // optional: for some weird infra network
    })
    console.log(`MemeNFTFactory.sol deployed to ${memeNFTFactoryDeployContract.address}`)

    const address = {
      main: memeNFTFactoryDeployContract.address,
    }
    const addressData = JSON.stringify(address)
    writeFileSync(`scripts/address/${hre.network.name}/`, "MemeNFTFactory.json", addressData)

    await memeNFTFactoryDeployContract.deployed()

    if (verify) {
      console.log("verifying contract...")
      await memeNFTFactoryDeployContract.deployTransaction.wait(3)
      try {
        await hre.run("verify:verify", {
          address: memeNFTFactoryDeployContract.address,
          constructorArguments: [_VRFMain],
          contract: "contracts/MemeNFTFactory.sol:MemeNFTFactory",
        })
      } catch (e) {
        console.log(e)
      }
    }
  },
  )
