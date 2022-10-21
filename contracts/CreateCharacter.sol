// SPDX-License-Identifier: UNLICENSED
// Author: @anton
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CreateCharacter is ERC721, Ownable {
    uint256 public mintPrice;
    uint256 public maxPerWallet;
    bool public isCharCreationAllowed;
    address payable public withdrawWallet;
    mapping(address => uint256) public walletMints;
    string internal baseTokenURI;
    mapping(address => string[]) public characterNames;

    constructor() payable ERC721("Character creation", "CHN") {
        mintPrice = 0.0001 ether;
        maxPerWallet = 10;
        withdrawWallet = payable(msg.sender);
    }

    function setIsCharCreationAllowed(bool _isCharCreationAllowed) external onlyOwner {
        isCharCreationAllowed = _isCharCreationAllowed;
    }

    function setBaseTokenURI(string calldata _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), 'Token does not exist!');
        return string(abi.encodePacked(baseTokenURI, Strings.toString(_tokenId), ".json"));
    }

    function withdraw() external onlyOwner {
        (bool success,) = withdrawWallet.call{value : address(this).balance}('');
        require(success, 'withdraw failed');
    }

    function charactersOwnedByAddress(address _address) public view returns (string[] memory) {
        return characterNames[_address];
    }

    function createCharacter(uint256 newItemId, string memory _charName) public payable {
        require(isCharCreationAllowed, 'Char creation is not allowed');
        require(msg.value <= mintPrice, 'Not enough funds');
        require(walletMints[msg.sender] + 1 < maxPerWallet, 'Char creation is not allowed due to max chars created');
        characterNames[msg.sender].push(_charName);
        walletMints[msg.sender] = walletMints[msg.sender] + 1;
        _safeMint(msg.sender, newItemId);
    }
}