// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Erc20 is ERC20, Ownable{

    address public feeRecipient;

    // uint256 public constant

constructor(
    string memory name,
    string memory symbol,
    uint256 totalSupply,
    address _feeRecipient,
    address initialOwner
) ERC20(name,symbol) Ownable(initialOwner){

    require(_feeRecipient != address(0),"Fee recipient cannot be zero address");
    feeRecipient = _feeRecipient;
    _mint(msg.sender, totalSupply * 10**decimals());
}

event FeeCollected(address indexed from, address indexed to, uint256 amount);
event FeeRecipient(address indexed oldFeeRecipient, address indexed newFeeRecipient);

function _transferWithFee(address from, address to , uint256 amount) internal{
require(from!=address(0),"Transfer from address should not be zero address"); 
require(to!=address(0),"Transfer to address should not be zero address"); 

uint256 fromBalance = balanceOf(from);
require(fromBalance >= amount, "Transfer amount exceeds balance");

uint256 feeAmount = (amount)/100;
uint256 transferAmount = amount - feeAmount;

_transfer(from, to , transferAmount);

if(feeAmount > 0){
    _transfer(from, feeRecipient, feeAmount);
    emit FeeCollected(from,to ,feeAmount);
}


}

function transfer(address to, uint256 amount) public override returns(bool){
    address owner = _msgSender();
    _transferWithFee(owner, to, amount);
    return true;
}

function transferFrom(address from, address to, uint256 amount) public override returns(bool){
address spender = _msgSender();
_spendAllowance(from,spender , amount);
_transferWithFee(from, to, amount);
return true;

}

function updateFeeRecipient(address newFeeRecipient) external onlyOwner{

    require(newFeeRecipient != address(0),"The new updated recipient should not be zero address");
    address oldFeeRecipient = feeRecipient;
    feeRecipient = newFeeRecipient;
    emit FeeRecipient(oldFeeRecipient, newFeeRecipient);
}
}