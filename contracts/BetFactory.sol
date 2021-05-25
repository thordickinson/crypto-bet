// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
import './Bet.sol';
import './ResultsOracle.sol';

contract BetFactory {

    address private _manager;
    address private _oracleAddress;
    address[] betList;
    error OracleConnectionError();
    event BetCreated(address betAddress);

    constructor(){
        _manager = msg.sender;
    }

    function createBet(uint16 matchId, uint32 minAmount) public returns (address) {
        address bet = address(new Bet(_manager, _oracleAddress, matchId, minAmount ));
        betList.push(bet);
        emit BetCreated(bet);
        return bet;
    }
    
    modifier onlyManager(){
        require(msg.sender == _manager, "0x200: Must be the manager");
        _;
    }

    function setOracleAddress(address oracleAddress) public onlyManager {
        require(oracleAddress != address(0), "0x201: Invalid oracle address");
        ResultsOracle oracle = ResultsOracle(oracleAddress);
        if(!oracle.testConnection()){
            revert OracleConnectionError();
        }
        _oracleAddress = oracleAddress;
    }

    function setManager(address newManager) public onlyManager {
        require(newManager != address(0));
        _manager = newManager;
    }

    function betListCount() public view returns (uint) {
        return betList.length;
    }

}
