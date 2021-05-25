// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;


interface ResultsOracle {

    ///@notice gets the result of the match given the id.
    ///@return local amount of goals local team have scored.
    ///@return away amount of goals away team have scored.
    function getResult(uint32 matchId) external returns (uint8 local, uint8 away);

    ///@notice test wether the connection has been succesfuly created or not.
    ///@return true allways returns true
    function testConnection() external pure returns (bool);

}
