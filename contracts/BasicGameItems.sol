// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BasicGameItems is ERC1155, Ownable{
    uint256 public constant GOLD = 0;
    uint256 public constant SWORD = 1;
    uint256 public constant SHIELD = 2;
    uint256 public constant LEGENDARY_ARMOR = 999;
    mapping(uint256 => uint256) private PRICE_PER_ITEM;
    bool private legendaryItemMinted = false;

    constructor() ERC1155("http://localhost/items/{id}.json") {
        _mint(owner(), GOLD, 10**18, "");
        PRICE_PER_ITEM[SWORD] = 10;
        PRICE_PER_ITEM[SHIELD] = 15;
    }

    //@dev asigns a specific price of golds to specific item
    function assignPricePerItem(
        uint256 _id,
        uint256 _price
    ) public onlyOwner {
        require(_id == GOLD, "Cannot set price for gold");
        PRICE_PER_ITEM[_id] = _price;
    }

    //@dev return price of golds for specific item
    function getPriceForItem(
        uint256 _id
    ) public view returns(uint256) {
        require(_id == GOLD, "Cannot get price for gold");
        return PRICE_PER_ITEM[_id];
    }

    //@dev allows owner of the contract send specific amount of gold
    function sendGold(
        uint256 _amount,
        address _to
    ) public onlyOwner {
        safeTransferFrom(owner(),_to,GOLD,_amount,"");
    }

    //@dev mints a sword item by a given amount to specific address
    function mintSword(
        uint256 _amount,
        address _to
    ) public onlyOwner {
        _mint(_to,SWORD,_amount,"");
    }

    //@dev mints a shield item by a given amount to specific address
    function mintShield(
        uint256 _amount,
        address _to
    ) public onlyOwner {
        _mint(_to,SHIELD,_amount,"");
    }

    //@dev mints the legendary item to specific address but there can be only one legendary item
    function mintLegendaryItem(
        address _to
    ) public onlyOwner {
        require(legendaryItemMinted == false, "Cannot mint more than 1");
        legendaryItemMinted = true;
        _mint(_to,LEGENDARY_ARMOR,1,"");
    }

    //@dev public function by which user can exchange specific item for gold if the item is burnable and if its not gold
    function tradeObjectForGold(
        uint256 _id,
        uint256 _amount
    ) public {
        require(_id != GOLD, "Cannot trade gold");
        require(_id != LEGENDARY_ARMOR, "Cannot trade legendary armor");

        _burn(msg.sender, _id, _amount);
        _safeTransferFrom(owner(), msg.sender, GOLD, PRICE_PER_ITEM[_id] * _amount, '0x00');
    }
}