import { ethers } from "hardhat";
import { MyERC20Votes__factory, TokenizedBallot__factory } from "../typechain-types";
import * as dotenv from "dotenv";

dotenv.config();

// const MINT_VALUE = ethers.utils.parseUnits("100");
const TOKEN_CONTRACT_ADDRESS = "0xddeaA47c577cfdFd6F6e5FC7661102B63dDf1502";
const TRANSFERED_UNIT = "8"
const TRANSFERED_UNIT_2 = "5"


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

    printHeader("CONTRACT TOKEN - ATTACHMENT");

    const tokenContractFactory = new MyERC20Votes__factory(signer);
    const tokenContract = await tokenContractFactory.attach(TOKEN_CONTRACT_ADDRESS);

    console.log("Fetching votes from token contract...");
    console.log("Votes before self delegation:");

    const votesBeforeSelfDelegateTx = await tokenContract.getVotes(signer.address);
    const lastBlockSelfDelegateTx = await provider?.getBlock("latest");
    console.log(`The vote before self delegation is ${ethers.utils.formatUnits(votesBeforeSelfDelegateTx)} at block ${lastBlockSelfDelegateTx?.number}`);

    printHeader("CONTRACT TOKEN - SELF-DELEGATION - DEPLOYER");

    const delegateTx1 = await tokenContract.connect(signer).delegate(signer.address);
    const delegateTx1Receipt = await delegateTx1.wait();
    console.log(`${signer.address} self delegated Token from the Token contract address ${TOKEN_CONTRACT_ADDRESS} according to the transaction ${delegateTx1Receipt.transactionHash}`);

    const votesAfterSelfDelegate = await tokenContract.getVotes(signer.address);

    console.log("Votes after self delegation:");
    console.log(`The vote After self delegation is ${ethers.utils.formatUnits(votesAfterSelfDelegate)}`);

    printHeader("CONTRACT TOKEN - TRANSFERT");

    // Estimate gas for the first transaction
    const gasLimitTx2 = await tokenContract.estimateGas.transfer(nextSigner2.address, ethers.utils.parseUnits(TRANSFERED_UNIT));
    const gasLimitTx3 = await tokenContract.estimateGas.transfer(nextSigner3.address, ethers.utils.parseUnits(TRANSFERED_UNIT_2));

    const totalgas = gasLimitTx2.add(gasLimitTx3)


    const transferTxSigner3 = await tokenContract.connect(signer).transfer(nextSigner3.address, ethers.utils.parseUnits(TRANSFERED_UNIT), { gasLimit: totalgas })
    const transferTxReceipt3 = await transferTxSigner3.wait();
    const votesAfterTransfer3 = await tokenContract.getVotes(signer.address);
    console.log(`Account ${signer.address} has ${ethers.utils.formatUnits(votesAfterTransfer3)} voting powers after transferring to ${nextSigner3.address} at the block ${transferTxReceipt3.blockNumber}`);


    const transferTxSigner2 = await tokenContract.connect(signer).transfer(nextSigner2.address, ethers.utils.parseUnits(TRANSFERED_UNIT_2), { gasLimit: totalgas })

    const transferTxReceipt2 = await transferTxSigner2.wait()

    const votesAfterTransfer2 = await tokenContract.getVotes(signer.address)

    console.log(`Account ${signer.address} has ${ethers.utils.formatUnits(votesAfterTransfer2)} voting powers after transferring to ${nextSigner2.address} at the block ${transferTxReceipt2.blockNumber}`)




    printHeader("CONTRACT TOKEN - SELF-DELEGATION - OTHER SIGNERS");


    // Estimate gas for the first transaction
    const gasLimitDelegateTx2 = await tokenContract.estimateGas.delegate(nextSigner2.address);
    const gasLimitDelegateTx3 = await tokenContract.estimateGas.delegate(nextSigner3.address);
    const totalgasDelegate = gasLimitDelegateTx2.add(gasLimitDelegateTx3);


    const delegateTx2 = await tokenContract.connect(signer).delegate(nextSigner2.address, { gasLimit: totalgasDelegate });
    const delegateTxReceipt2 = await delegateTx2.wait();
    console.log(`${signer.address} delegated Token from the Token contract address ${TOKEN_CONTRACT_ADDRESS} to ${nextSigner2.address} according to the transaction ${delegateTxReceipt2.transactionHash} at block ${delegateTxReceipt2.blockNumber}`);

    const delegateTx3 = await tokenContract.connect(signer).delegate(nextSigner3.address, { gasLimit: totalgasDelegate });
    const delegateTxReceipt3 = await delegateTx3.wait();
    console.log(`${signer.address} delegated Token from the Token contract address ${TOKEN_CONTRACT_ADDRESS} to ${nextSigner3.address} according to the transaction ${delegateTxReceipt3.transactionHash} at block ${delegateTxReceipt3.blockNumber}`);

    // const tokenContractTx = await tokenContract.deployTransaction.wait();
    // console.log(`Token contract was deployed at address ${tokenContractTx.contractAddress} at block ${tokenContractTx.blockNumber}`);

    printHeader("GET PAST VOTE FROM LAST BLOCK");

    const gasLimitGetPastVotesTx2 = await tokenContract.estimateGas.getPastVotes(nextSigner2.address, lastBlock.number - 1);
    const gasLimitGetPastVotesTx3 = await tokenContract.estimateGas.getPastVotes(nextSigner3.address, lastBlock.number - 1);
    const totalgasGetPastVotes = gasLimitGetPastVotesTx2.add(gasLimitGetPastVotesTx3);

    const pastVotes = await tokenContract.getPastVotes(signer.address, lastBlock.number - 1, { gasLimit: totalgasGetPastVotes });
    console.log(`Account ${signer.address} has ${ethers.utils.formatUnits(pastVotes)} units of voting power at block ${lastBlock.number}`);

    const pastVotes2 = await tokenContract.getPastVotes(nextSigner2.address, lastBlock.number - 1, { gasLimit: totalgasGetPastVotes });
    console.log(`Account ${nextSigner2.address} has ${ethers.utils.formatUnits(pastVotes2)} units of voting power at block ${lastBlock.number}`);

    const pastVotes3 = await tokenContract.getPastVotes(nextSigner3.address, lastBlock.number - 1, { gasLimit: totalgasGetPastVotes });
    console.log(`Account ${nextSigner3.address} has ${ethers.utils.formatUnits(pastVotes3)} units of voting power at block ${lastBlock.number}`);

    printHeader("NEW SIGNER AFTER SELF-DELEGATION");

    const gasLimitSelfDelegatingTx2 = await tokenContract.estimateGas.delegate(nextSigner2.address);
    const gasLimitSelfDelegatingTx3 = await tokenContract.estimateGas.delegate(nextSigner3.address);
    const totalgasSelfDelegating = gasLimitSelfDelegatingTx2.add(gasLimitSelfDelegatingTx3);

    const MULTIPLIER = 3

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

    printFormatMarkdown();
}

deployContract()
    .catch((error) => {
        console.error('Error deploying contract:', error);
        process.exitCode = 1;
    });

