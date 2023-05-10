import { ethers } from "hardhat";

async function main() {
  const accounts = await ethers.getSigners();
  const tokenContractFactory = await ethers.getContractFactory("MyERC20Token");
  const tokenContract = await tokenContractFactory.deploy();
  await tokenContract.deployed();
  console.log(`Contract deployed at ${tokenContract.address}`);
  // Fetching the role code
  const code = await tokenContract.MINTER_ROLE();
  // Giving role
  const roleTx = await tokenContract.grantRole(code, accounts[2].address)
  await roleTx.wait();
  // Minting tokens
  const mintTx = await tokenContract
    .connect(accounts[2])
    .mint(accounts[0].address, 2);
  await mintTx.wait();
  // Sending a transaction
  const tx = await tokenContract.transfer(accounts[1].address, 1);
  await tx.wait();
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    tokenContract.name(),
    tokenContract.symbol(),
    tokenContract.decimals(),
    tokenContract.totalSupply(),
  ]);
  console.log({ name, symbol, decimals, totalSupply });
  const myBalance = await tokenContract.balanceOf(accounts[0].address);
  console.log(`My Balance is ${myBalance.toString()} decimals units`);
  const otherBalance = await tokenContract.balanceOf(accounts[1].address);
  console.log(`The Balance of Acc1 is ${otherBalance.toString()} decimals units`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
