import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory, Contract } from "ethers";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts: SignerWithAddress[] = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deploy", "Deploys the contract", async (taskArgs, hre) => {
  const BookLibraryTokenFactory: ContractFactory = await hre.ethers.getContractFactory("BookLibraryToken");
  const bookLibraryToken: Contract = await BookLibraryTokenFactory.deploy();
  console.log("BookLibraryToken deployed to:", bookLibraryToken.address);

  const BookLibraryFactory: ContractFactory = await hre.ethers.getContractFactory("BookLibrary");
  const bookLibrary: Contract = await BookLibraryFactory.deploy(bookLibraryToken.address);
  console.log("BookLibrary deployed to:", bookLibrary.address);
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  networks: {
    ropsten: {
      url: "",
      accounts: []
    }
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
