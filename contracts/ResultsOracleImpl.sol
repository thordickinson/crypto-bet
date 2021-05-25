// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import './ResultsOracle.sol';

contract ResultsOracleImpl is ResultsOracle {

    struct MatchResult {
        uint32 matchId;
        uint8 home;
        uint8 away;
    }
    address private manager;
    mapping(uint32 => MatchResult) private results;

    constructor(){
        manager = msg.sender;
    }


    modifier requireManager(){
        require(manager == msg.sender, "0x4004: Sender must be the manager");
        _;
    }

    function setManager(address newManager) public  requireManager {
        require(newManager != address(0), "0x4002: Manager address is required");
        manager = newManager;
    }

    function setResult(uint32 matchId, uint8 home, uint8 away) public requireManager {
        MatchResult memory result = results[matchId];
        require(result.matchId == 0, "0x4003: Match already has a result");
        results[matchId] = MatchResult({matchId: matchId, home: home, away: away});
    }

    function getResult(uint32 matchId) public override view returns (uint8, uint8){
        MatchResult memory result = results[matchId];
        require(result.matchId > 0, "0x401: Match not found");
        return (result.home, result.away);
    }

    function testConnection() public override pure returns(bool) {
        return true;
    }
}
