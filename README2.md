# Instructions : 
## week03
Form groups of 3 to 5 students
Complete the contracts together
Develop and run scripts for “TokenizedBallot.sol” within your group to give voting tokens, delegating voting power, casting votes, checking vote power and querying results
Write a report with each function execution and the transaction hash, if successful, or the revert reason, if failed
Share your code in a github repo in the submission form

## Scripts
- voting tokens
- checking vote power
- delegating voting power

- casting votes
- querying results

# Executions

## Deploy Token

yarn run ts-node --files scripts/1_BallotDeployContract.ts Ghost in the shell

## DelegateToken + Give Vote Token

yarn run ts-node --files scripts/2_DelegateBallot.ts

# casting votes

yarn run ts-node --files scripts/3_BallotGiveVote.ts

