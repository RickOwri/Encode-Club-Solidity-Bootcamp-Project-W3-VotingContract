import { ethers } from "hardhat";
import { MyToken__factory, TokenizedBallot__factory} from "../typechain-types";
import * as dotenv from "dotenv";

dotenv.config();

const TARGET_BLOCK = 30;

const MINT_VALUE = ethers.utils.parseUnits("100");


function divideOutput(argument: string) {
    const POINT_NUMBER = 20*2-(argument.length)/2
    const POINTS = '-'.repeat(POINT_NUMBER)
    // console.log(20`${argument}`);
    console.log(`\n${POINTS}${argument}${POINTS}\n`);
} 

function commandLineInputer() {
    const commandLineInput: string = process.env.npm_config_argv || '';
    console.log(commandLineInput)
}

function formatMarkdown() {
    const formatCODE = '```'
    console.log(formatCODE)
}

async function deployContract() {


    formatMarkdown()


    divideOutput("ACCOUNT - CONNECTION");


    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_SANGOKU ?? "");

  
    const provider = new ethers.providers.InfuraProvider(
      "sepolia",
      process.env.INFURA_API_KEY
    );


    
    const lastBlock = await provider?.getBlock("latest");



    const signer = wallet.connect(provider)


    const balance = await signer.getBalance();


    console.log(`Connected to the address ${signer.address}`);

    console.log(`Balance is ${balance} WEI`);

    divideOutput("CONTRACT TOKEN - DEPLOYMENT");

    const proposals = process.argv.slice(2);

    // deploy contracts
    console.log("Proposals: ");
    proposals.forEach((element, index) => {
        console.log(`Proposal N. ${index + 1}: ${element}`);
    });

    const PROPOSALS = proposals.map(ethers.utils.formatBytes32String)
    
    const tokenContractFactory = new MyToken__factory(signer);

    const tokenContract = await tokenContractFactory.deploy();

    await tokenContract.deployed();

    const tokenContractTx = await tokenContract.deployTransaction.wait();

    console.log(`Token contract was deployed at address ${tokenContractTx.contractAddress} at the block ${tokenContractTx.blockNumber}`);

    divideOutput("CONTRACT TOKEN - MINTED");

    const mintTx = await tokenContract.mint(
        signer.address,
        MINT_VALUE
        )

    const mintTxReceipt = await mintTx.wait();

    console.log(`Token was Minted for the Token contract at address ${tokenContract.address}\nby the deployer ${signer.address}\nat the block ${mintTxReceipt.blockNumber}\n`);
    

    divideOutput("CONTRACT TOKENIZEDBALLOT");



    const tokenizedBallotFactory = new TokenizedBallot__factory(signer);

    const formatedBLOCKNUMBER = await ethers.BigNumber.from(TARGET_BLOCK);

    const tokenizedBallot = await tokenizedBallotFactory.deploy(
        PROPOSALS,
        tokenContract.address,
        lastBlock.number+TARGET_BLOCK,
    );
    
    await tokenizedBallot.deployed();
    
    const tokenizedBallotTx = await tokenizedBallot.deployTransaction.wait();
    
    console.log(`TokenizedBallot contract was deployed at address ${tokenizedBallotTx.contractAddress}\nby the deployer ${signer.address}\nat the block ${tokenizedBallotTx.blockNumber}`);
    
    console.log(`The targeted block is ${lastBlock.number+TARGET_BLOCK}`);
    
    formatMarkdown()


}



// deployContract()
// .then(() => process.exit(0))
// .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

deployContract()
    .catch((error) => {
        console.error('Error deploying contract:', error);
        process.exitCode = 1;
});

