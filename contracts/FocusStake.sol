// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract FocusStake is Ownable {
    enum CommitmentState {
        Active,
        PausedBySlip,
        Succeeded,
        Failed
    }

    struct Commitment {
        address user;
        string title;
        uint256 stakeAmount;
        uint64 createdAt;
        uint64 deadline;
        uint32 slipCount;
        bool allowSlip;
        CommitmentState state;
    }

    uint256 public nextCommitmentId;
    mapping(uint256 => Commitment) public commitments;

    event CommitmentCreated(
        uint256 indexed commitmentId,
        address indexed user,
        string title,
        uint256 stakeAmount,
        uint64 deadline,
        bool allowSlip
    );
    event SlipRecorded(uint256 indexed commitmentId, uint32 slipCount);
    event CommitmentSucceeded(uint256 indexed commitmentId, uint256 payout);
    event CommitmentFailed(uint256 indexed commitmentId);

    error NotCommitmentOwner();
    error NotActive();
    error DeadlineInPast();
    error ZeroStake();
    error SlipNotEnabled();
    error AlreadySettled();

    constructor() Ownable(msg.sender) {}

    function createCommitment(
        string calldata title,
        uint256 deadline,
        bool allowSlip
    ) external payable returns (uint256 commitmentId) {
        if (msg.value == 0) revert ZeroStake();
        if (deadline <= block.timestamp) revert DeadlineInPast();

        commitmentId = nextCommitmentId++;
        commitments[commitmentId] = Commitment({
            user: msg.sender,
            title: title,
            stakeAmount: msg.value,
            createdAt: uint64(block.timestamp),
            deadline: uint64(deadline),
            slipCount: 0,
            allowSlip: allowSlip,
            state: CommitmentState.Active
        });

        emit CommitmentCreated(
            commitmentId,
            msg.sender,
            title,
            msg.value,
            uint64(deadline),
            allowSlip
        );
    }

    function markSucceeded(uint256 commitmentId) external {
        Commitment storage commitment = commitments[commitmentId];
        if (commitment.user != msg.sender) revert NotCommitmentOwner();
        if (commitment.state != CommitmentState.Active && commitment.state != CommitmentState.PausedBySlip) {
            revert AlreadySettled();
        }

        commitment.state = CommitmentState.Succeeded;
        uint256 payout = commitment.stakeAmount;
        commitment.stakeAmount = 0;

        (bool sent, ) = msg.sender.call{value: payout}("");
        require(sent, "Payout failed");

        emit CommitmentSucceeded(commitmentId, payout);
    }

    function recordSlip(uint256 commitmentId) external {
        Commitment storage commitment = commitments[commitmentId];
        if (commitment.user != msg.sender) revert NotCommitmentOwner();
        if (commitment.state != CommitmentState.Active) revert NotActive();
        if (!commitment.allowSlip) revert SlipNotEnabled();

        commitment.state = CommitmentState.PausedBySlip;
        commitment.slipCount += 1;

        emit SlipRecorded(commitmentId, commitment.slipCount);
    }

    function resumeAfterSlip(uint256 commitmentId, uint64 extraSeconds) external {
        Commitment storage commitment = commitments[commitmentId];
        if (commitment.user != msg.sender) revert NotCommitmentOwner();
        if (commitment.state != CommitmentState.PausedBySlip) revert NotActive();

        commitment.deadline += extraSeconds;
        commitment.state = CommitmentState.Active;
    }

    function markFailed(uint256 commitmentId) external onlyOwner {
        Commitment storage commitment = commitments[commitmentId];
        if (commitment.state == CommitmentState.Succeeded || commitment.state == CommitmentState.Failed) {
            revert AlreadySettled();
        }
        commitment.state = CommitmentState.Failed;

        emit CommitmentFailed(commitmentId);
    }
}
