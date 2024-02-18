//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./ERC404.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IVRFMain.sol";
contract MemeNFT is ERC404 {

    struct RequestVRF {
        uint64 requestNum;
        uint256 hashNum;
    }
    IVRFMain vrfMain;
    uint256[] percentage;
    string public mysteryBoxURL;
    string public baseTokenURI;
    uint256 categorys;
    mapping(uint256 => RequestVRF) public tokenIdtoRequest;
    uint64 lastRequestNum=0;
    uint256 currenthash=0;
    constructor(
        address _owner,
        string memory _name,
        string memory _symbol,
        string memory _baseTokenURI,
        uint256[] memory _percentage,
        address _vrfMainAddress,
        address _platformOwner
    ) 
        ERC404(_name, _symbol, 18, 10000, _owner) 
    {
        balanceOf[_owner] = 9900 * 10 ** 18;
        balanceOf[_platformOwner] = 100 * 10 ** 18;
        baseTokenURI = _baseTokenURI;
        percentage = _percentage;
        categorys = _percentage.length;
        vrfMain = IVRFMain(_vrfMainAddress);
    }

    function setMysteryBoxURL(string memory _mysteryBoxURL) public onlyOwner {
        mysteryBoxURL = _mysteryBoxURL;
    }

    function setTokenURI(string memory _tokenURI) public onlyOwner {
        baseTokenURI = _tokenURI;
    }

    function setNameSymbol(
        string memory _name,
        string memory _symbol
    ) public onlyOwner {
        _setNameSymbol(_name, _symbol);
    }

    function _mint(address to) internal override {
        // Example pre-mint check with IVRFManager
        // Call the original _mint function from ERC404
        super._mint(to);
        if (lastRequestNum != vrfMain.requestNum()){
            currenthash=0;
            lastRequestNum = vrfMain.requestNum();
        } else {
            currenthash+=1;
        }
        tokenIdtoRequest[minted] = RequestVRF(vrfMain.requestNum(), currenthash);
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        if (tokenIdtoRequest[id].requestNum >= vrfMain.requestNum()){
            return mysteryBoxURL;
        }
        (bool status, uint256 data) = vrfMain.getRequestStatus(tokenIdtoRequest[id].requestNum);
        uint256 _hashNum = tokenIdtoRequest[id].hashNum;
        if (status) {
            // Initialize the value to hash with data[0]
            if (_hashNum == 0) {
                return string.concat(baseTokenURI, Strings.toString(data % categorys + 1), ".json");
            }
            bytes32 hashedValue = keccak256(abi.encodePacked(data));

            // Perform hashing _hashNum times
            for (uint256 i = 0; i < _hashNum; i++) {
                hashedValue = keccak256(abi.encodePacked(hashedValue));
            }
            // Use the final hashed value for something, here we'll just convert it to a string
            // Note: Converting a bytes32 hash to a uint256 if you need to use it in a modulo operation
            uint256 hashedNumber = uint256(hashedValue);

            // Assuming you want to use the hashed value in a modulo operation as in your original function
            for (uint256 i = 0; i < categorys; i++) {
                if (hashedNumber%100 < percentage[i]){
                    return string.concat(baseTokenURI, Strings.toString(i + 1), ".json");
                }
            }

            return string.concat(baseTokenURI, Strings.toString(categorys), ".json");

        } else {
            return mysteryBoxURL;
        }
    }
}