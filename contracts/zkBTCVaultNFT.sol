// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract zkBTCVaultBadge is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    mapping(address => bool) public hasClaimed;

    string public baseTokenURI;

    constructor(string memory _baseTokenURI) ERC721("zkBTC Vault Badge", "zkBTCBadge") {
        baseTokenURI = _baseTokenURI;
    }

    /// @notice Mint a soulbound badge to a user (once only)
    function mint(address to) external onlyOwner {
        require(!hasClaimed[to], "Already claimed");

        uint256 tokenId = nextTokenId;
        _mint(to, tokenId);
        _setTokenURI(tokenId, baseTokenURI);
        hasClaimed[to] = true;

        nextTokenId++;
    }

    /// @dev Prevents all transfers (soulbound)
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override
    {
        require(from == address(0) || to == address(0), "Soulbound: Non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
