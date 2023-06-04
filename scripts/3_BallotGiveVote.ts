import { ethers } from "hardhat";
import { MyToken__factory, TokenizedBallot__factory } from "../typechain-types";
import * as dotenv from "dotenv";

dotenv.config();

// const MINT_VALUE = ethers.utils.parseUnits("100");
const TOKEN_CONTRACT_ADDRESS = "0x35a24F28f846DB57F13B534799659824A81f31FF";
const TOKENIZEDBALLOT_CONTRACT_ADDRESS = "0x9267611856783B54c2d296F3594519bb37BFc63c";
// const TRANSFERED_UNIT = "0.01"
// const TRANSFERED_UNIT_2 = "0.02"
const PROPOSAL_1 = 1
const PROPOSAL_2 = 2
const VOTED_AMOUNT1 = ethers.utils.parseUnits("1")
const VOTED_AMOUNT2 = ethers.utils.parseUnits("2")
const VOTED_AMOUNT3 = ethers.utils.parseUnits("3")


function printHeader(argument: string) {
  const POINT_NUMBER = 20 * 2 - (argument.length) / 2;
  const POINTS = '-'.repeat(POINT_NUMBER);
  console.log(`\n${POINTS}${argument}${POINTS}\n`);
}

function printCommandLineInput() {
  const commandLineInput: string = process.env.npm_config_argv || '';
  console.log(commandLineInput);
}

function printFormatMarkdown() {
  const formatCODE = '```';
  console.log(formatCODE);
}

function waiter(seconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}



async function deployContract() {
  printFormatMarkdown();
  printHeader("ACCOUNT - CONNECTION");

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_SANGOKU ?? "");
  const wallet2 = new ethers.Wallet(process.env.PRIVATE_KEY_VEGETA ?? "");
  const wallet3 = new ethers.Wallet(process.env.PRIVATE_KEY_TRUNK ?? "");

  const provider = new ethers.providers.InfuraProvider("sepolia", process.env.INFURA_API_KEY);

  const signer = wallet.connect(provider);
  const nextSigner2 = wallet2.connect(provider);
  const nextSigner3 = wallet3.connect(provider);

  const lastBlock = await provider?.getBlock("latest");

  console.log(`Connected to the address ${signer.address}`);
  console.log(`Connected to the block number ${lastBlock?.number}`);

  const balance = await signer.getBalance();
  console.log(`Balance is ${balance} WEI`);

  printHeader("CONTRACT - ATTACHMENT");

  const tokenContractFactory = new MyToken__factory(signer);
  const tokenContract = await tokenContractFactory.attach(TOKEN_CONTRACT_ADDRESS);

  const TokenizedBallotContractfactory = new TokenizedBallot__factory(signer);
  const TokenizedBallotContract = await TokenizedBallotContractfactory.attach(TOKENIZEDBALLOT_CONTRACT_ADDRESS);

  
  const gasLimitGetPastVotesTx2 = await tokenContract.estimateGas.getPastVotes(nextSigner2.address, lastBlock.number - 1);
  const gasLimitGetPastVotesTx3 = await tokenContract.estimateGas.getPastVotes(nextSigner3.address, lastBlock.number - 1);
  const totalgasGetPastVotes = gasLimitGetPastVotesTx2.add(gasLimitGetPastVotesTx3);

  const gasLimitSelfDelegatingTx2 = await tokenContract.estimateGas.delegate(nextSigner2.address);
  const gasLimitSelfDelegatingTx3 = await tokenContract.estimateGas.delegate(nextSigner3.address);
  const totalgasSelfDelegating = gasLimitSelfDelegatingTx2.add(gasLimitSelfDelegatingTx3);

  const MULTIPLIER = 3


  printHeader("PREPARE");

  const selfDelegateTx = await tokenContract.connect(signer).delegate(signer.address, { gasLimit: totalgasSelfDelegating.mul(MULTIPLIER) });
  const selfDelegateReceiptTx = await selfDelegateTx.wait();
  const currentVotes = await tokenContract.getVotes(signer.address, { gasLimit: totalgasGetPastVotes.mul(MULTIPLIER) })
  console.log(`Account ${signer.address} has ${ethers.utils.formatUnits(currentVotes)} units of voting power getVotes from transaction ${selfDelegateReceiptTx.transactionHash} at block ${lastBlock.number}`);

  const selfDelegateTx2 = await tokenContract.connect(nextSigner2).delegate(nextSigner2.address, { gasLimit: totalgasSelfDelegating.mul(MULTIPLIER) });
  const selfDelegateReceiptTx2 = await selfDelegateTx2.wait();
  const currentVotes2 = await tokenContract.getVotes(nextSigner2.address, { gasLimit: totalgasGetPastVotes.mul(MULTIPLIER) })
  console.log(`Account ${nextSigner2.address} has ${ethers.utils.formatUnits(currentVotes2)} units of voting power getVotes from transaction ${selfDelegateReceiptTx2.transactionHash} at block ${lastBlock.number}`);

  const selfDelegateTx3 = await tokenContract.connect(nextSigner3).delegate(nextSigner3.address, { gasLimit: totalgasSelfDelegating.mul(MULTIPLIER) });
  const selfDelegateReceiptTx3 = await selfDelegateTx3.wait();
  const currentVotes3 = await tokenContract.getVotes(nextSigner3.address,{ gasLimit: totalgasGetPastVotes.mul(MULTIPLIER) })
  console.log(`Account ${nextSigner3.address} has ${ethers.utils.formatUnits(currentVotes3)} units of voting power getVotes from transaction ${selfDelegateReceiptTx3.transactionHash} at block ${lastBlock.number}`);


  
  printHeader("GAZ COST - MANAGEMENT");
  const gasLimitVotingPower = await TokenizedBallotContract.estimateGas.votingPower(signer.address,  { gasLimit:2000000000});
  const gasLimitForVoteMarge = await TokenizedBallotContract.estimateGas.vote(PROPOSAL_1, VOTED_AMOUNT1, { gasLimit:2000000000});
  
  // console.log("tt")
  const gasLimitForVote = gasLimitForVoteMarge.add(gasLimitVotingPower);
  // console.log("tt")
  
  console.log(`Connection to Tokenized Ballot Contract with Account ${signer.address}`);
  const nextSignerVotingPower = await TokenizedBallotContract.votingPower(signer.address, { gasLimit: gasLimitVotingPower });
  
  const castVote = await TokenizedBallotContract.connect(signer).vote(PROPOSAL_1, VOTED_AMOUNT1, { gasLimit: gasLimitForVote });
  const castVoteReceiptTx = await castVote.wait();
  
  const winnerNameTx = await TokenizedBallotContract.winningProposal()
  console.table({
    ballotContractAddress: TOKENIZEDBALLOT_CONTRACT_ADDRESS,
    addressAccount: signer.address,
    votingPower: ethers.utils.formatUnits(nextSignerVotingPower),
    // vote: castVote,
    winningProposal:`${ethers.utils.formatUnits(winnerNameTx)}` 
  })


  console.log(`Connection to Tokenized Ballot Contract with Account ${nextSigner2.address} `)  
  const nextSignerVotingPower2 = await TokenizedBallotContract.votingPower(nextSigner2.address, { gasLimit: gasLimitVotingPower });

  const castVote2 = await TokenizedBallotContract.connect(nextSigner2).vote(PROPOSAL_1, VOTED_AMOUNT2, { gasLimit: gasLimitForVote });
  const castVoteReceiptTx2 = await castVote2.wait();
  const winnerNameTx2 = await TokenizedBallotContract.winningProposal()
  console.table({
    ballotContractAddress: TOKENIZEDBALLOT_CONTRACT_ADDRESS,
    addressAccount: nextSigner2.address,
    votingPower: ethers.utils.formatUnits(nextSignerVotingPower2),
    // vote: castVote2,
    winningProposal: `${ethers.utils.formatUnits(winnerNameTx2)}`

  })


  console.log(`Connection to Tokenized Ballot Contract with Account ${nextSigner3.address} `)
  
  const nextSignerVotingPower3 = await TokenizedBallotContract.votingPower(nextSigner3.address, { gasLimit: gasLimitVotingPower });
  const castVote3 = await TokenizedBallotContract.connect(nextSigner3).vote(PROPOSAL_2, VOTED_AMOUNT3, { gasLimit: gasLimitForVote });
  const castVoteReceiptTx3 = await castVote3.wait();
  const winnerNameTx3 = await TokenizedBallotContract.winningProposal()
  console.table({
    ballotContractAddress: TOKENIZEDBALLOT_CONTRACT_ADDRESS,
    addressAccount: nextSigner3.address,
    votingPower: ethers.utils.formatUnits(nextSignerVotingPower3),
    // vote: castVote3,
    winningProposal: `${ethers.utils.formatUnits(winnerNameTx3)}`

  })

  const votingResult = await TokenizedBallotContract.winnerName();
  console.log(`The winning proposition is ${ethers.utils.parseBytes32String(votingResult)}`);

  printFormatMarkdown();
}

deployContract()
  .catch((error) => {
    console.error('Error deploying contract:', error);
    process.exitCode = 1;
  });

