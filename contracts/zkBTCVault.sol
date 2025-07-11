// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./verifier.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract zkBTCVault is Verifier {
    IERC20 public btcToken; // e.g., WBTC token
    address public owner;
    mapping(address => uint256) public balances;
    mapping(address => bool) public unlocked;
    mapping(uint256 => bool) public nullifiersUsed;

    event VaultDeposited(address indexed user, uint256 amount);
    event VaultUnlocked(address indexed user, uint256 nullifier);
    event VaultWithdrawn(address indexed user, uint256 amount);

    zkBTCVaultNFT public nftBadge;
    string public baseBadgeURI = "ipfs://YOUR_BADGE_METADATA_CID/";

    constructor(address _btcToken, address _nftBadge) {
        owner = msg.sender;
        btcToken = IERC20(_btcToken);
        nftBadge = zkBTCVaultNFT(_nftBadge);
    }

    /**
     * @notice Deposit BTC (represented as ERC20 like WBTC) into the vault
     */
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(btcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        balances[msg.sender] += amount;
        emit VaultDeposited(msg.sender, amount);
    }

    /**
     * @notice Unlock vault access using a ZK proof.
     * @param a Groth16 proof param
     * @param b Groth16 proof param
     * @param c Groth16 proof param
     * @param input Public inputs: [expectedHash, nullifier]
     */
    function unlockVault(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[] memory input
    ) public {
        require(input.length == 2, "Expected 2 public inputs");
        uint256 expectedHash = input[0];
        uint256 nullifier = input[1];

        require(!nullifiersUsed[nullifier], "Proof already used");
        require(verifyProof(a, b, c, input), "Invalid ZK proof");

        unlocked[msg.sender] = true;
        nullifiersUsed[nullifier] = true;
          // Mint NFT badge
        if (!nftBadge.hasMinted(msg.sender)) {
            nftBadge.mintBadge(msg.sender, string(abi.encodePacked(baseBadgeURI, "badge.json")));
        }

        emit VaultUnlocked(msg.sender, nullifier);
    }

    /**
     * @notice Withdraw tokens after unlocking
     */
    function withdraw() external {
        require(unlocked[msg.sender], "Vault is locked");
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw");

        balances[msg.sender] = 0;
        require(btcToken.transfer(msg.sender, amount), "Withdraw failed");

        emit VaultWithdrawn(msg.sender, amount);
    }

    // Admin recovery or updates 
    function setBTC(address _btcToken) external {
        require(msg.sender == owner, "Only owner");
        btcToken = IERC20(_btcToken);
    }
}
