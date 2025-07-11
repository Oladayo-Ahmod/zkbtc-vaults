// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./verifier.sol";

contract zkBTCVault is Verifier {
    mapping(address => bool) public unlocked;

    event VaultUnlocked(address indexed user);

    /**
     * @notice Unlock the vault by proving knowledge of a secret.
     * @param a The `a` parameter from the Groth16 proof.
     * @param b The `b` parameter from the Groth16 proof.
     * @param c The `c` parameter from the Groth16 proof.
     * @param input The public signals (should include expected Poseidon hash).
     */
    function unlockVault(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[] memory input
    ) public {
        require(verifyProof(a, b, c, input), "Invalid ZK proof");
        unlocked[msg.sender] = true;
        emit VaultUnlocked(msg.sender);
    }

    /**
     * @notice Example protected function
     */
    function claimBTC() external view returns (string memory) {
        require(unlocked[msg.sender], "Vault is locked");
        return "Access granted to claim your BTC!";
    }
}
