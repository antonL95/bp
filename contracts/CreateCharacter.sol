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
    string internal baseTokenURI;
    mapping(uint256 => string) private characterNames;
    mapping(string => uint256) private createdCharacterNames;
    mapping(address => string[]) private addressOwnedCharacters;


    constructor() payable ERC721("Character creation", "CHAR") {
        mintPrice = 0.0001 ether;
        maxPerWallet = 10;
        withdrawWallet = payable(msg.sender);
        isCharCreationAllowed = true;
    }

    //@dev function that allows/disallows minting of character
    function setIsCharCreationAllowed(bool _isCharCreationAllowed) external onlyOwner {
        isCharCreationAllowed = _isCharCreationAllowed;
    }

    //@dev function that sets base url for tokens metadata
    function setBaseTokenURI(string calldata _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    //@dev function that returns specific metadata url for given token
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), "Token does not exist!");
        return string(abi.encodePacked(baseTokenURI, Strings.toString(_tokenId), ".json"));
    }

    //@dev function that allowes owner to withdraw funds from smart contract
    function withdraw() external onlyOwner {
        (bool success,) = withdrawWallet.call{value : address(this).balance}("");
        require(success, "withdraw failed");
    }

    //@dev function that returns all character names owned by address
    function charactersOwnedByAddress(address _address) public view returns (string[] memory) {
        return addressOwnedCharacters[_address];
    }

    //@dev function that mints character and save character to a memory
    function createCharacter(uint256 newItemId, string memory _charName) public payable {
        require(isCharCreationAllowed, "Char creation is not allowed");
        require(msg.value <= mintPrice, "Not enough funds");
        require(balanceOf(msg.sender) + 1 < maxPerWallet, "Char creation is not allowed due to max chars created");
        require(createdCharacterNames[_charName] < 1, "Character with that name already exists");

        addressOwnedCharacters[msg.sender].push(_charName);
        createdCharacterNames[_charName] = 1;
        characterNames[newItemId] = _charName;
        _safeMint(msg.sender, newItemId);
    }

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner nor approved");
        require(balanceOf(to) + 1 < maxPerWallet, "Wallet can own only 10 characters");
        string memory _charName = characterNames[tokenId];
        for (uint256 i = 0; i < addressOwnedCharacters[from].length; i++) {
            if(bytes(addressOwnedCharacters[from][i]).length != bytes(_charName).length) {
                continue;
            }

            if(keccak256(bytes(addressOwnedCharacters[from][i])) == keccak256(bytes(_charName))) {
                delete addressOwnedCharacters[from][i];
                addressOwnedCharacters[to].push(characterNames[tokenId]);
                break;
            }
        }

        if(balanceOf(from) == 0) {
            delete addressOwnedCharacters[from];
        }

        _safeTransfer(from, to, tokenId, "");
    }


    /**
     * @dev See {IERC721-transferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner nor approved");
        require(balanceOf(to) + 1 < maxPerWallet, "Wallet can own only 10 characters");
        string memory _charName = characterNames[tokenId];
        for (uint256 i = 0; i < addressOwnedCharacters[from].length; i++) {
            if(bytes(addressOwnedCharacters[from][i]).length != bytes(_charName).length) {
                continue;
            }

            if(keccak256(bytes(addressOwnedCharacters[from][i])) == keccak256(bytes(_charName))) {
                delete addressOwnedCharacters[from][i];
                addressOwnedCharacters[to].push(characterNames[tokenId]);
                break;
            }
        }

        if(balanceOf(from) == 0) {
            delete addressOwnedCharacters[from];
        }

        _safeTransfer(from, to, tokenId, data);
    }

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner nor approved");
        require(balanceOf(to) + 1 < maxPerWallet, "Wallet can own only 10 characters");
        string memory _charName = characterNames[tokenId];
        for (uint256 i = 0; i < addressOwnedCharacters[from].length; i++) {
            if(bytes(addressOwnedCharacters[from][i]).length != bytes(_charName).length) {
                continue;
            }

            if(keccak256(bytes(addressOwnedCharacters[from][i])) == keccak256(bytes(_charName))) {
                delete addressOwnedCharacters[from][i];
                addressOwnedCharacters[to].push(characterNames[tokenId]);
                break;
            }
        }

        if(balanceOf(from) == 0) {
            delete addressOwnedCharacters[from];
        }

        _transfer(from, to, tokenId);
    }
}