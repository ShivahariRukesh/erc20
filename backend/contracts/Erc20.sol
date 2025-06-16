// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Erc20{
     address public feeRecipient;
    
    // Fee percentage (1% = 100 basis points)
    uint256 public constant FEE_PERCENTAGE = 100; // 1%
    uint256 public constant BASIS_POINTS = 10000; // 100%

    event FeeCollected(address indexed from, address indexed to, uint256 feeAmount);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);

    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address _feeRecipient,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        require(_feeRecipient != address(0), "Fee recipient cannot be zero address");
        feeRecipient = _feeRecipient;
        _mint(msg.sender, totalSupply * 10**decimals());
    }




     function transfer(address to, uint256 amount) public override returns (bool) {
        address owner = _msgSender();
        _transferWithFee(owner, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transferWithFee(from, to, amount);
        return true;
    }

    // Internal function to handle transfers with fee
    function _transferWithFee(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        uint256 fromBalance = balanceOf(from);
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");

        // Calculate 1% fee
        uint256 feeAmount = (amount * FEE_PERCENTAGE) / BASIS_POINTS;
        uint256 transferAmount = amount - feeAmount;

        // Perform the transfer with fee
        _transfer(from, to, transferAmount);
        if (feeAmount > 0) {
            _transfer(from, feeRecipient, feeAmount);
            emit FeeCollected(from, to, feeAmount);
        }
    }

}