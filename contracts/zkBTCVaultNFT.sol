// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract zkBTCVaultBadge is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    mapping(address => bool) private _hasMinted;

    constructor() ERC721("zkBTC Vault Badge", "zkBTCBadge") Ownable(msg.sender) {}


    /// @dev Soulbound enforcement: only mint or burn allowed, no transfers
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        require(
            from == address(0) || to == address(0),
            "Soulbound: cannot transfer"
        );
        return super._update(to, tokenId, auth);
    }

    function hasMinted(address user) external view returns (bool) {
    return _hasMinted[user];
    }

    function mintBadge(address to, string memory uri) external onlyOwner {
    require(!_hasMinted[to], "Already minted");
    uint256 tokenId = ++_tokenIdCounter;
    _safeMint(to, tokenId);
    _setTokenURI(tokenId, uri);
    _hasMinted[to] = true;
    }
}