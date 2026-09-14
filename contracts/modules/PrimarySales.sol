// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TicketingStorage} from "../core/TicketingStorage.sol";

/**
 * @notice Current primary ticket purchase and lazy-mint logic.
 */
abstract contract PrimarySales is TicketingStorage {
    function buyTicket(uint256 eventId) external payable {
        EventInfo storage eventInfo = events[eventId];

        require(eventInfo.organiser != address(0), "event does not exist");
        require(eventInfo.saleOpen, "sale is closed");
        require(eventInfo.sold < eventInfo.supply, "sold out");
        require(
            purchasedCount[eventId][msg.sender] < eventInfo.perWalletCap,
            "per-wallet cap reached"
        );
        require(msg.value == eventInfo.facePrice, "incorrect payment");

        uint256 tokenId = nextTokenId;
        nextTokenId += 1;

        eventInfo.sold += 1;
        purchasedCount[eventId][msg.sender] += 1;
        ticketEventId[tokenId] = eventId;
        ticketFacePrice[tokenId] = eventInfo.facePrice;

        // Lazy mint means the ERC-721 ticket is created at purchase time.
        _safeMint(msg.sender, tokenId);

        (bool paymentSent, ) = payable(eventInfo.organiser).call{
            value: msg.value
        }("");
        require(paymentSent, "payment to organiser failed");

        emit TicketPurchased(eventId, tokenId, msg.sender, msg.value);
    }
}
