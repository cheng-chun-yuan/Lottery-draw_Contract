// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVRFMain {
    function requestNum() external view returns (uint64);
    function getRequestStatus(uint64 _requestNum) external view returns (bool fulfilled, uint256 randomWord);
}