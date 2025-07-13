// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ERC20Mock
 * @dev A mock ERC20 token with minting and burning capabilities for testing purposes
 */
contract ERC20Mock is ERC20, Ownable {
    uint8 private _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        _decimals = decimals_;
    }

    /**
     * @dev Mints tokens to an address
     * @param to The address to mint to
     * @param amount The amount to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burns tokens from an address
     * @param from The address to burn from
     * @param amount The amount to burn
     */
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }

    /**
     * @dev Overrides decimals() for tokens with non-18 decimal places
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Simulates token transfer with fee (for testing fee-on-transfer tokens)
     * @param recipient The recipient address
     * @param amount The amount to transfer
     * @param feeBps The fee in basis points (e.g., 30 = 0.3%)
     */
    function transferWithFee(
        address recipient,
        uint256 amount,
        uint256 feeBps
    ) public returns (bool) {
        require(feeBps < 10_000, "Fee too high");
        uint256 fee = (amount * feeBps) / 10_000;
        _transfer(msg.sender, recipient, amount - fee);
        _transfer(msg.sender, owner(), fee);
        return true;
    }

    /**
     * @dev Approves and then calls another contract in one tx
     * @param spender The spender address
     * @param amount The amount to approve
     * @param data The calldata for the external call
     */
    function approveAndCall(
        address spender,
        uint256 amount,
        bytes memory data
    ) public returns (bool) {
        approve(spender, amount);
        (bool success, ) = spender.call(data);
        require(success, "Call failed");
        return true;
    }
}