import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MyERC20Token__factory, TokenSale__factory } from "../typechain-types";

const TEST_RATIO = 10;
const TEST_BUY_TOKEN_AMOUNT = 1;
const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";


describe("NFT Shop", async () => {
    let contract: TokenSale;
    let paymentToken: MyERC20Token;
    let deployer: SignerWithAddress;
    let acc1: SignerWithAddress;
    let acc2: SignerWithAddress;

    beforeEach(async () => {
        [deployer, acc1, acc2] = await ethers.getSigners();
        const tokenFactory = new MyERC20Token__factory(deployer);
        paymentToken = await tokenFactory.deploy();
        await paymentToken.deployed();
        const contractFactory = new TokenSale__factory(deployer);
        contract = await contractFactory.deploy(TEST_RATIO, paymentToken.address);
        await contract.deployed();
        const giveRoleTx = await paymentToken.grantRole(
          MINTER_ROLE,
          contract.address
        );
        await giveRoleTx.wait();
      });
    

    describe("When the Shop contract is deployed", async () => {
        it("defines the ratio as provided in parameters", async () => {
          const ratio = await contract.ratio();
          expect(ratio).to.eq(TEST_RATIO);
        });
    

        it("uses a valid ERC20 as payment token", async () => {
            const tokenAddress = await contract.paymentToken();
            const tokenFactory = new MyERC20Token__factory(deployer);
            const tokenContract = tokenFactory.attach(tokenAddress);
            await expect(tokenContract.totalSupply()).not.to.be.reverted;
            await expect(tokenContract.balanceOf(deployer.address)).not.to.be
              .reverted;
            await expect(tokenContract.approve(acc1.address, 1)).not.to.be.reverted;
          });
        });
      


        describe("When a user buys an ERC20 from the Token contract", async () => {
            let tokenBalanceBefore: BigNumber;
        
            beforeEach(async () => {
                tokenBalanceBefore = await paymentToken.balanceOf(acc1.address);
                const buyTokensTx = await contract
                .connect(acc1)
                .buyTokens({ value: TEST_BUY_TOKENS_AMOUNT });
                await buyTokensTx.wait();
            });
        


            it("charges the correct amount of ETH", async () => {
                const ethBalanceAfter = await acc1.getBalance();
                const ethBalanceDiff = ethBalanceAfter.sub(ethBalanceBefore);
                expect(ethBalanceDiff).to.eq(TEST_BUY_TOKENS_AMOUNT);
              });
          
        
            it("gives the correct amount of tokens", async () => {
                const tokenBalanceAfter = await paymentToken.balanceOf(acc1.address);
                const tokenBalanceDiff = tokenBalanceAfter.sub(tokenBalanceBefore);
                expect(tokenBalanceDiff).to.eq(TEST_BUY_TOKENS_AMOUNT * TEST_RATIO);
            });
            });
        

        describe("When a user burns an ERC20 at the Shop contract", async () => {
            it("gives the correct amount of ETH", async () => {
                throw new Error("Not implemented");
            });

            it("burns the correct amount of tokens", async () => {
                throw new Error("Not implemented");
            });
        });

        describe("When a user buys an NFT from the Shop contract", async () => {
            it("charges the correct amount of ERC20 tokens", async () => {
                throw new Error("Not implemented");
            });

            it("gives the correct NFT", async () => {
                throw new Error("Not implemented");
            });
        });

        describe("When a user burns their NFT at the Shop contract", async () => {
            it("gives the correct amount of ERC20 tokens", async () => {
                throw new Error("Not implemented");
            });
        });

        describe("When the owner withdraws from the Shop contract", async () => {
            it("recovers the right amount of ERC20 tokens", async () => {
                throw new Error("Not implemented");
            });

            it("updates the owner pool account correctly", async () => {
                throw new Error("Not implemented");
            });
        });
    });
});