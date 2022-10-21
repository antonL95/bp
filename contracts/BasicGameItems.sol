// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BasicGameItems is ERC1155, Ownable{
    uint256 public constant GOLD = 0;
    uint256 public constant SWORD = 1;
    uint256 public constant SHIELD = 2;
    mapping(uint256 => uint256) private PRICE_PER_ITEM;

    constructor() ERC1155("https://eth.antonloginov.com/api/item/{id}.json") {
        _mint(owner(), GOLD, 10**18, "");
        _mint(owner(), SWORD, 10**9, "");
        _mint(owner(), SHIELD, 10**9, "");
        PRICE_PER_ITEM[SWORD] = 10;
        PRICE_PER_ITEM[SHIELD] = 15;
    }

    function assignPricePerItem(
        uint256 _id,
        uint256 _price
    ) public onlyOwner {
        require(_id == GOLD, "Cannot set price for gold");
        PRICE_PER_ITEM[_id] = _price;
    }

    function sendGold(
        uint256 _amount,
        address _to
    ) public onlyOwner {
        safeTransferFrom(owner(),_to,GOLD,_amount,'0x00');
    }

    function sendSword(
        uint256 _amount,
        address _to
    ) public onlyOwner {
        safeTransferFrom(owner(),_to,SWORD,_amount,'0x00');
    }

    function sendShield(
        uint256 _amount,
        address _to
    ) public onlyOwner {
        safeTransferFrom(owner(),_to,SHIELD,_amount,'0x00');
    }

    function tradeObjectForGold(
        uint256 _id,
        uint256 _amount
    ) public {
        require(balanceOf(msg.sender, _id) >= _amount, "Not enough assets");
        require(_id != GOLD, "Cannot trade gold");

        _safeTransferFrom(msg.sender, owner(), _id, _amount, '0x00');
        _safeTransferFrom(owner(), msg.sender, GOLD, PRICE_PER_ITEM[_id] * _amount, '0x00');
    }
}