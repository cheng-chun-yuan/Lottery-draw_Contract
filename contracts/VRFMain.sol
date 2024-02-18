//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./interfaces/IVRFManager.sol";
import "./interfaces/events/IVRFMainEvent.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

contract VRFMain is VRFConsumerBaseV2, IVRFMainEvent {

    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256 randomWords;
    }

    mapping(uint256 => RequestStatus) public s_requests; 

    VRFCoordinatorV2Interface COORDINATOR;
    uint256[] public requestIds;
    uint64 public requestNum;
    uint256 public lastRequestId;
    uint64 s_subscriptionId;
    // address vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;// sepolia vrf coordinator
    // bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c; //sepolia keyhash
    address vrfCoordinator = 0x2eD832Ba664535e5886b75D64C46EB9a228C2610; // fuji vrf coordinator
    bytes32 keyHash = 0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61; //fuji keyhash
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;
    address public owner;

    constructor(
        uint64 subscriptionId
    ) 
        VRFConsumerBaseV2(vrfCoordinator)
    {
        owner = msg.sender;
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
    }

    function executeRandom() external {
        uint256 _requestId = _requestRandomWords();
        requestIds.push(_requestId);
        requestNum += 1;
    }

    function _requestRandomWords()
        internal
        onlyOwner
        returns (uint256 requestId)
    {
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            1
        );
        s_requests[requestId] = RequestStatus({
            randomWords: uint256(0),
            exists: true,
            fulfilled: false
        });
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords[0];
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function getRequestStatus(
        uint64 _requestNum
    ) external view returns (bool fulfilled, uint256 randomWord) {
        uint256 requestId = requestIds[_requestNum];
        RequestStatus storage status = s_requests[requestId];
        return (status.fulfilled, status.randomWords);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }
}