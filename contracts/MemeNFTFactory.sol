// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import {MemeNFT} from "./MemeNFT.sol";
import {IVRFMain} from "./interfaces/IVRFMain.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IMemeNFTFactoryEvent } from "./interfaces/events/IMemeNFTFactoryEvent.sol";
/// @title MemeNFTFactory
/// @dev Contract for creating and managing pools
contract MemeNFTFactory is Ownable, IMemeNFTFactoryEvent {

    address[] public memeNFTs;
    IVRFMain public vrfMain;
    constructor(address _vrfMain) Ownable(msg.sender){ 
        vrfMain = IVRFMain(_vrfMain);
    }

    /// @dev Sets the VRF Main contract address
    /// @param _vrfMain Address of the VRF Main contract
    function setVRFAccess(address _vrfMain) external onlyOwner {
        vrfMain = IVRFMain(_vrfMain);
        emit ChangeVRFMain(_vrfMain);
    }

    /*//////////////////////////////////////////////////////////////////////////
                        EXTERNAL NON-CONSTANT FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/

    /// @dev Creates a new MemeNFT with the provided configurations
    /// @param _name Name of the MemeNFT
    /// @param _symbol Symbol of the MemeNFT
    /// @param _baseTokenURI Base token URI
    /// @param _percentage Array of percentages
    function createMemeNFT(
        string memory _name,
        string memory _symbol,
        string memory _baseTokenURI,
        uint256[] memory _percentage
    ) external returns (address pool_) {
        MemeNFT memeNFT = new MemeNFT(msg.sender, _name, _symbol, _baseTokenURI, _percentage, address(vrfMain), owner());
        memeNFTs.push(address(memeNFT));
        emit MemeNFTCreated(address(memeNFT), _name, _symbol, _baseTokenURI, _percentage);
        return (address(memeNFT));
    }
}