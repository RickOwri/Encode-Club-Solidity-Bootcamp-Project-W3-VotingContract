// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./MyERC20Votes.sol";


interface IMyVoteToken {
    function getPastVotes(address, uint256) external view returns (uint256);
}

contract Ballot {

    struct Proposal {
        bytes32 name;   
        uint voteCount; 
    }

    IMyVoteToken public tokenContract;
    Proposal[] public proposals;
    uint256 public targetBlockNumber;

    mapping(address => uint256) public votingPowerSpent;

    constructor(
            bytes32[] memory proposalNames,
            address _tokenContract,
            uint256 _targetBlockNumber                
        ) {
        tokenContract = IMyVoteToken(_tokenContract);
        targetBlockNumber = block.number;
        targetBlockNumber = _targetBlockNumber;
        for (uint256 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    function vote(uint256 proposal, uint256 amount) external {
        require(
            tokenContract.getPastVotes(msg.sender, targetBlockNumber) >= amount
        );
        // TODO: Account voting power
        // TODO: Update votes for the proposals
        proposals[proposal].voteCount += amount;    
    }

    function votingPower(address account) public view returns (uint256) {
        return
            tokenContract.getPastVotes(account, targetBlockNumber) -
            votingPowerSpent[account];
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}
