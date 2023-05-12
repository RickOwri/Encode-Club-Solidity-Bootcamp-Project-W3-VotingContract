
import { ethers } from "hardhat";
import { MyERC20Votes__factory } from "../typechain-types";


const MINT_VALUE = ethers.utils.parseUnits("10");


async function main() {
  
  
  // deployed
  const [deployer, acc1, acc2] = await ethers.getSigners();
  const contractFactory = new MyERC20Votes__factory(deployer);
  const contract = await contractFactory.deploy();
  const deployTxReceipt = await contract.deployTransaction.wait();
  console.log(
    `The contract was deployed at address ${contract.address} at the block ${deployTxReceipt.blockNumber}\n`
  );

  // mint
  const minTx = await contract.mint(acc1.address, MINT_VALUE);
  const mintTxReceipt = await minTx.wait();

  console.log(
    `Minted ${ethers.utils.formatUnits(MINT_VALUE)} tokens to the address ${acc1.address}
    at block ${mintTxReceipt.blockNumber}\n`
  );

  // balance and vote checking
  const balanceToken = await contract.balanceOf(acc1.address);

  console.log(
    `Account ${acc1.address} has ${ethers.utils.formatUnits(balanceToken)} MyTokens\n at block ${mintTxReceipt.blockNumber}\n`
  );

  const votes = await contract.getVotes(acc1.address);
  console.log(
    `Account ${acc1.address} has ${votes} votings powers\n`
  );

  // vote acquisition and delegation
  const delegateTx = await contract.connect(acc1).delegate(acc1.address);
  await delegateTx.wait();
  const votesAfter = await contract.getVotes(acc1.address);

  
  
  console.log(
    `Account ${acc1.address} has ${ethers.utils.formatUnits(votesAfter)} voting powers after self delegating\n`
    );
    
  // transfer
  const transfertTx = await contract
    .connect(acc1)
    .transfer(acc2.address, MINT_VALUE.div(2))
  
  await transfertTx.wait();
    
  const vote1AfterTransfer = await contract.getVotes(acc1.address)

  console.log(
    `Account ${acc1.address} has ${ethers.utils.formatUnits(vote1AfterTransfer)} voting powers after transfering\n`
    );
    
  
  const vote2AfterTransfer = await contract.getVotes(acc2.address)
  
  console.log(
    `Account ${acc2.address} has ${ethers.utils.formatUnits(vote2AfterTransfer)} voting powers after receiving\n`
    );
    
  const delegateTx2 = await contract.connect(acc2).delegate(acc2.address);
  await delegateTx2.wait()
  
  // last vote
  const vote2AfterDelegating = await  contract.getVotes(acc2.address)
  console.log(
    `Account ${acc2.address} has ${ethers.utils.formatUnits(vote2AfterDelegating)} voting powers after selft delegating\n`
    );
      
  const lastBlock = await ethers.provider.getBlock("latest");
      
  console.log(`Current block number is ${lastBlock.number}\n`)

  let pastVotes = await contract.getPastVotes(
    acc1.address,
    lastBlock.number - 1
  );

  pastVotes = await contract.getPastVotes(acc2.address, lastBlock.number - 1)

  console.log(
    `Account ${acc2.address} has ${ethers.utils.formatUnits(pastVotes)} voting powers after receiving at block ${lastBlock.number - 1}\n`
  );
  
  pastVotes = await contract.getPastVotes(acc2.address, lastBlock.number - 2)
  console.log(
    `Account ${acc2.address} has ${ethers.utils.formatUnits(pastVotes)} voting powers after receiving at block ${lastBlock.number - 2}\n`
  );
  
  pastVotes = await contract.getPastVotes(acc2.address, lastBlock.number - 3)
  console.log(
    `Account ${acc2.address} has ${ethers.utils.formatUnits(pastVotes)} voting powers after receiving at block ${lastBlock.number - 3}\n`
  );

  pastVotes = await contract.getPastVotes(acc2.address, lastBlock.number - 4)
  console.log(
    `Account ${acc2.address} has ${ethers.utils.formatUnits(pastVotes)} voting powers after receiving at block ${lastBlock.number - 4}\n`
  );

  pastVotes = await contract.getPastVotes(acc2.address, lastBlock.number - 5)
  console.log(
    `Account ${acc2.address} has ${ethers.utils.formatUnits(pastVotes)} voting powers after receiving at block ${lastBlock.number - 5}\n`
  );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
