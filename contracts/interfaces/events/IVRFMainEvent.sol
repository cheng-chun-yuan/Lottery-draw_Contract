// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IVRFMainEvent {
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
}