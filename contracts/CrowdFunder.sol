// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title CrowdFunder
/// @author nemild
contract CrowdFunder {
    // Variables set on create by owner
    address public owner;
    address payable public fundRecipient; // owner may be different than recipient, and must be payable
    uint256 public minimumToRaise; // required to tip, else everyone gets refund
    string private campaignUrl;
    bytes1 private version = "1";

    // Data structures
    enum State {
        Fundraising,
        ExpiredRefund,
        Successful
    }
    struct Contribution {
        uint256 amount;
        address payable contributor;
    }

    // State variables
    State public state = State.Fundraising; // initialize on create
    uint256 public totalRaised;
    uint256 public raiseBy;
    uint256 public completeAt;
    Contribution[] private contributions;

    event LogFundingReceived(
        address addr,
        uint256 amount,
        uint256 currentTotal
    );
    event LogWinnerPaid(address winnerAddress);

    modifier inState(State _state) {
        require(state == _state, "invalid state");
        _;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // Wait 24 weeks after final contract state before allowing contract destruction
    modifier atEndOfLifecycle() {
        require(
            ((state == State.ExpiredRefund || state == State.Successful) &&
                completeAt + 24 weeks < block.timestamp)
        );
        _;
    }

    function crowdFund(
        uint256 timeInHoursForFundraising,
        string memory _campaignUrl,
        address payable _fundRecipient,
        uint256 _minimumToRaise
    ) public {
        owner = msg.sender;
        fundRecipient = _fundRecipient;
        campaignUrl = _campaignUrl;
        minimumToRaise = _minimumToRaise;
        raiseBy = block.timestamp + (timeInHoursForFundraising * 1 hours);
    }

    function contribute()
        public
        payable
        inState(State.Fundraising)
        returns (uint256 id)
    {
        contributions.push(
            Contribution({amount: msg.value, contributor: payable(msg.sender)}) // use array, so can iterate
        );
        totalRaised += msg.value;

        emit LogFundingReceived(msg.sender, msg.value, totalRaised);

        checkIfFundingCompleteOrExpired();
        return contributions.length - 1; // return id
    }

    function checkIfFundingCompleteOrExpired() public {
        if (totalRaised > minimumToRaise) {
            state = State.Successful;
            payOut();

            // could incentivize sender who initiated state change here
        } else if (block.timestamp > raiseBy) {
            state = State.ExpiredRefund; // backers can block.timestamp collect refunds by calling getRefund(id)
        }
        completeAt = block.timestamp;
    }

    function payOut() public inState(State.Successful) {
        fundRecipient.transfer(address(this).balance);
        emit LogWinnerPaid(fundRecipient);
    }

    function getRefund(uint256 id)
        public
        inState(State.ExpiredRefund)
        returns (bool)
    {
        require(
            contributions.length > id &&
                id >= 0 &&
                contributions[id].amount != 0
        );

        uint256 amountToRefund = contributions[id].amount;
        contributions[id].amount = 0;

        contributions[id].contributor.transfer(amountToRefund);

        return true;
    }

    function removeContract() public isOwner atEndOfLifecycle {
        selfdestruct(payable(owner));
        // owner gets all money that hasn't be claimed
    }
}
// ** END EXAMPLE **
