// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers, } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const BookLibraryTokenFactory: ContractFactory = await ethers.getContractFactory("BookLibraryToken");
  const bookLibraryToken: Contract = await BookLibraryTokenFactory.deploy();
  console.log("BookLibraryToken deployed to:", bookLibraryToken.address);

  const BookLibraryFactory: ContractFactory = await ethers.getContractFactory("BookLibrary");
  const bookLibrary: Contract = await BookLibraryFactory.deploy(bookLibraryToken.address);
  console.log("BookLibrary deployed to:", bookLibrary.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
