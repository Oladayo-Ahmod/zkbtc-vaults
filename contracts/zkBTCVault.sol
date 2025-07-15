// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./verifier.sol";
import "./zkBTCVaultNFT.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract zkBTCVault is Groth16Verifier {
    IERC20 public btcToken; // e.g., WBTC token
    address public owner;
    zkBTCVaultBadge public nftBadge;
    string public baseBadgeURI = "ipfs://BADGE_METADATA_CID/";
    mapping(address => uint256) public balances;
    mapping(address => bool) public unlocked;
    mapping(uint256 => bool) public nullifiersUsed;

    event VaultDeposited(address indexed user, uint256 amount);
    event VaultUnlocked(address indexed user, uint256 nullifier);
    event VaultWithdrawn(address indexed user, uint256 amount);

    constructor(address _btcToken, address _nftBadge) {
        owner = msg.sender;
        btcToken = IERC20(_btcToken);
        nftBadge = zkBTCVaultBadge(_nftBadge);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(btcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        balances[msg.sender] += amount;
        emit VaultDeposited(msg.sender, amount);
    }

    function unlockVault(
    uint[2] calldata a,
    uint[2][2] calldata b,
    uint[2] calldata c,
    uint[1] calldata input 
    ) external {
    require(input.length == 1, "Expected 1 public inputs");
    uint256 nullifier = input[0];

    require(!nullifiersUsed[nullifier], "Proof is already used");
    
    // This will now properly integrate with Solidity's control flow
    bool proofValid = verifyProof(a, b, c, input);
    require(proofValid, "Invalid ZK proof");

    unlocked[msg.sender] = true;
    nullifiersUsed[nullifier] = true;

    // Check NFT balance - simplified version
    if (nftBadge.balanceOf(msg.sender) == 0) {
        nftBadge.mintBadge(msg.sender, string(abi.encodePacked(baseBadgeURI, "badge.json")));
    }

    emit VaultUnlocked(msg.sender, nullifier);
}
    function withdraw() external {
        require(unlocked[msg.sender], "Vault is locked");
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw");

        balances[msg.sender] = 0;
        require(btcToken.transfer(msg.sender, amount), "Withdraw failed!");

        emit VaultWithdrawn(msg.sender, amount);
    }

    function setBTC(address _btcToken) external {
        require(msg.sender == owner, "Only owner");
        btcToken = IERC20(_btcToken);
    }
}