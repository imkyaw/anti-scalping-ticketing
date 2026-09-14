// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TicketingStorage} from "../core/TicketingStorage.sol";

/**
 * @notice Current listing, capped resale, cancellation and listing-view logic.
 */
abstract contract ResaleMarket is TicketingStorage {
    function listForResale(uint256 tokenId, uint256 price) external {
        require(_ownerOf(tokenId) == msg.sender, "not ticket owner");
        require(!isUsed[tokenId], "ticket already used");
        require(price > 0, "price must be > 0");
        require(price <= ticketFacePrice[tokenId], "price above face value");

        listings[tokenId] = Listing({seller: msg.sender, price: price});
        emit TicketListedForResale(tokenId, msg.sender, price);
    }

    function buyResale(uint256 tokenId) external payable {
        Listing memory listing = listings[tokenId];

        require(listing.price > 0, "not listed");
        require(msg.sender != listing.seller, "seller cannot buy own listing");
        require(msg.value == listing.price, "incorrect payment");
        require(
            _ownerOf(tokenId) == listing.seller,
            "seller no longer owns ticket"
        );
        require(!isUsed[tokenId], "ticket already used");

        address seller = listing.seller;
        uint256 price = listing.price;

        delete listings[tokenId];
        _transfer(seller, msg.sender, tokenId);

        (bool paymentSent, ) = payable(seller).call{value: price}("");
        require(paymentSent, "payment to seller failed");

        emit TicketResold(tokenId, seller, msg.sender, price);
    }

    function cancelResale(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.price > 0, "not listed");
        require(listing.seller == msg.sender, "not seller");
        delete listings[tokenId];
    }

    function getListing(
        uint256 tokenId
    ) external view returns (address seller, uint256 price) {
        Listing memory listing = listings[tokenId];
        return (listing.seller, listing.price);
    }
}
