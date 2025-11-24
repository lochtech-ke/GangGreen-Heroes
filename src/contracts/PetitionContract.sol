// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PetitionContract
 * @dev Smart contract for managing petition signatures on Polygon blockchain
 * @notice This contract allows users to sign petitions and tracks signature counts
 */
contract PetitionContract {
    // Petition data structure
    struct Petition {
        string petitionId;
        string title;
        uint256 signatureThreshold;
        uint256 deadline;
        uint256 signatureCount;
        bool isActive;
    }
    
    // State variables
    Petition public petition;
    mapping(address => bool) public hasSigned;
    address[] public signers;
    address public creator;
    
    // Events
    event PetitionCreated(
        string indexed petitionId,
        string title,
        uint256 signatureThreshold,
        uint256 deadline,
        address creator
    );
    
    event PetitionSigned(
        address indexed signer,
        uint256 timestamp,
        uint256 totalSignatures
    );
    
    event PetitionThresholdReached(
        uint256 signatureCount,
        uint256 timestamp
    );
    
    /**
     * @dev Constructor to initialize the petition
     * @param _petitionId Unique identifier for the petition
     * @param _title Title of the petition
     * @param _signatureThreshold Minimum signatures required
     * @param _deadline Unix timestamp for petition deadline
     */
    constructor(
        string memory _petitionId,
        string memory _title,
        uint256 _signatureThreshold,
        uint256 _deadline
    ) {
        require(_signatureThreshold > 0, "Signature threshold must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_petitionId).length > 0, "Petition ID cannot be empty");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        petition = Petition({
            petitionId: _petitionId,
            title: _title,
            signatureThreshold: _signatureThreshold,
            deadline: _deadline,
            signatureCount: 0,
            isActive: true
        });
        
        creator = msg.sender;
        
        emit PetitionCreated(_petitionId, _title, _signatureThreshold, _deadline, msg.sender);
    }
    
    /**
     * @dev Sign the petition
     * @notice Users can only sign once and must sign before deadline
     */
    function signPetition() external {
        require(petition.isActive, "Petition is not active");
        require(block.timestamp <= petition.deadline, "Petition deadline has passed");
        require(!hasSigned[msg.sender], "Already signed this petition");
        
        hasSigned[msg.sender] = true;
        signers.push(msg.sender);
        petition.signatureCount++;
        
        emit PetitionSigned(msg.sender, block.timestamp, petition.signatureCount);
        
        // Check if threshold is reached
        if (petition.signatureCount >= petition.signatureThreshold) {
            emit PetitionThresholdReached(petition.signatureCount, block.timestamp);
        }
    }
    
    /**
     * @dev Get all signers
     * @return Array of addresses that signed the petition
     */
    function getSigners() external view returns (address[] memory) {
        return signers;
    }
    
    /**
     * @dev Check if a specific user has signed
     * @param user Address to check
     * @return Boolean indicating if user has signed
     */
    function hasUserSigned(address user) external view returns (bool) {
        return hasSigned[user];
    }
    
    /**
     * @dev Get petition status
     * @return signatureCount Current number of signatures
     * @return signatureThreshold Required number of signatures
     * @return deadline Petition deadline timestamp
     * @return isActive Whether petition is still active
     */
    function getPetitionStatus() external view returns (
        uint256 signatureCount,
        uint256 signatureThreshold,
        uint256 deadline,
        bool isActive
    ) {
        return (
            petition.signatureCount,
            petition.signatureThreshold,
            petition.deadline,
            petition.isActive
        );
    }
    
    /**
     * @dev Get petition details
     * @return petitionId Unique identifier
     * @return title Petition title
     * @return signatureCount Current signatures
     * @return signatureThreshold Required signatures
     * @return deadline Deadline timestamp
     * @return isActive Active status
     * @return creator Address of petition creator
     */
    function getPetitionDetails() external view returns (
        string memory petitionId,
        string memory title,
        uint256 signatureCount,
        uint256 signatureThreshold,
        uint256 deadline,
        bool isActive,
        address creator_
    ) {
        return (
            petition.petitionId,
            petition.title,
            petition.signatureCount,
            petition.signatureThreshold,
            petition.deadline,
            petition.isActive,
            creator
        );
    }
    
    /**
     * @dev Check if petition has reached threshold
     * @return Boolean indicating if threshold is met
     */
    function hasReachedThreshold() external view returns (bool) {
        return petition.signatureCount >= petition.signatureThreshold;
    }
    
    /**
     * @dev Check if petition is expired
     * @return Boolean indicating if deadline has passed
     */
    function isExpired() external view returns (bool) {
        return block.timestamp > petition.deadline;
    }
    
    /**
     * @dev Get total number of signers
     * @return Number of unique signers
     */
    function getSignerCount() external view returns (uint256) {
        return signers.length;
    }
}
