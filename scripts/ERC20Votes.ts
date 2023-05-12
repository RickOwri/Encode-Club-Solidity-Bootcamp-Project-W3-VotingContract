
import { ethers } from "hardhat";
import { MyERC20Votes__factory } from "../typechain-types";


const MINT_VALUE = ethers.utils.parseUnits("10");


async function main() {
  const [deployer, acc1, acc2] = await ethers.getSigners();
  const contractFactory = new MyERC20Votes__factory(deployer);
  const contract = await contractFactory.deploy();
  const deployTxReceipt = await contract.deployTransaction.wait();
  console.log(
    `The contract was deployed at address ${contract.address} at the block ${deployTxReceipt.blockNumber}\n`
  );
  const minTx = await contract.mint(acc1.address, MINT_VALUE);
  const mintTxReceipt = await minTx.wait();

  console.log(
    `Minted ${ethers.utils.formatUnits(MINT_VALUE)} tokens to the address ${acc1.address}
    at block ${mintTxReceipt.blockNumber}\n`
  );
  const balanceToken = await contract.balanceOf(acc1.address);

  console.log(
    `Account ${acc1.address} has ${ethers.utils.formatUnits(balanceToken)} MyTokens\n in block\n`
  );

  const votes = await contract.getVotes(acc1.address);
  console.log(
    `Account ${acc1.address} has ${votes} votings powers\n`
  );

  const delegateTx = await contract.connect(acc1).delegate(acc1.address);
  await delegateTx.wait();
  const votesAfter = await contract.getVotes(acc1.address);
  console.log(
    `Account ${acc1.address} has ${ethers.utils.formatUnits(votesAfter)} voting powers after self delegating\n`
  );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
