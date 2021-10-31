// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract Ownable 
{    
    address private _owner;

    constructor()
    {
        _owner = msg.sender;
    }

    modifier onlyOwner() 
    {
        require(
            msg.sender == _owner,
            "Function accessible only by the owner!");
        _;
    }
}