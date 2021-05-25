// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "./ResultsOracle.sol";

contract Bet {
    
    struct Result {
        uint256 amount;
        uint8 home;
        uint8 away;
    }
    
    
    address private manager;
    uint32 private matchId;
    uint8 private constant maxParticipants = 10;
    mapping(address => Result) participants;
    address[] private participantList;
    uint32 private minAmount;
    address internal oracleAddress;
    ResultsOracle internal oracle;
    bool private open = true;
    
    constructor(address _manager, address _oracleAddress, uint32 _matchId, uint32 _minAmount){
        manager = _manager;
        matchId = _matchId;
        minAmount = _minAmount;
        oracleAddress = _oracleAddress;
        oracle = ResultsOracle(oracleAddress);
    }
    
    modifier requireManager(){
        require(msg.sender == manager, "0x001: You must be the manager");
        _;
    }

    modifier requireOpen(){
        require(open, "0x004: Bet is closed");
        _;
    }
    

    function isOpen() public view returns(bool){
        return open;
    }
    
    function getMatchId() public view returns(uint32){
        return matchId;
    }
    
    function getManager() public view returns(address){
        return manager;
    }
    
    function placeBet(uint8 home, uint8 away) public payable requireOpen {
        require(msg.value >= minAmount, "0x002: Need to give more ether");
        Result memory actual = participants[msg.sender];
        require(actual.amount == 0, "0x003: Already on the bet");
        require(participantList.length < maxParticipants, "0x004: Too much participants");
        participants[msg.sender] = Result({amount: msg.value, home: home, away: away});
        participantList.push(msg.sender);
    }
    
    function findWinner() public requireManager {
        address[] memory winners = new address[](maxParticipants);
        (uint8 home, uint8 away) = oracle.getResult(matchId);
        uint8 count = 0;
        for(uint8 i = 0; i < participantList.length; i++){
            address participant = participantList[i];
            Result memory participantResult = participants[participant];
            assert(participantResult.amount > 0);
            if(home == participantResult.home && away == participantResult.away){
                winners[count++] = participant;
            }
        }
        address self = address(this);
        uint amount = self.balance / count;
        for(uint8 i = 0; i < count; i++){
            address payable winner = payable(winners[i]);
            winner.transfer(amount);
        }
        open = false;
        assert(self.balance == 0);
    }   
}
