// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IMemeNFTFactoryEvent {
    event MemeNFTCreated(
        address indexed memeNFT,
        string name,
        string symbol,
        string baseTokenURI,
        uint256[] percentage
    );
    event ChangeVRFMain(address indexed vrfMain);
}