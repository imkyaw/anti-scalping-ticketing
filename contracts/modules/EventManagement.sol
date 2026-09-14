// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TicketingStorage} from "../core/TicketingStorage.sol";

/**
 * @notice Current event creation and event-reading functions.
 */
abstract contract EventManagement is TicketingStorage {
    /**
     * @notice Anyone may create an event and becomes that event's organiser.
     */
    function createEvent(
        string calldata name,
        uint256 facePrice,
        uint256 supply,
        uint256 perWalletCap
    ) external returns (uint256 eventId) {
        require(bytes(name).length > 0, "name required");
        require(facePrice > 0, "facePrice must be > 0");
        require(supply > 0, "supply must be > 0");
        require(perWalletCap > 0, "perWalletCap must be > 0");

        eventId = nextEventId;
        nextEventId += 1;

        events[eventId] = EventInfo({
            name: name,
            organiser: msg.sender,
            facePrice: facePrice,
            supply: supply,
            sold: 0,
            perWalletCap: perWalletCap,
            // Existing behavior: a new event's sale opens immediately.
            saleOpen: true
        });

        emit EventCreated(
            eventId,
            msg.sender,
            name,
            facePrice,
            supply,
            perWalletCap
        );
    }

    function getEventInfo(
        uint256 eventId
    )
        external
        view
        returns (
            string memory name,
            address organiser,
            uint256 facePrice,
            uint256 supply,
            uint256 sold,
            uint256 perWalletCap,
            bool saleOpen
        )
    {
        EventInfo storage eventInfo = events[eventId];
        require(eventInfo.organiser != address(0), "event does not exist");

        return (
            eventInfo.name,
            eventInfo.organiser,
            eventInfo.facePrice,
            eventInfo.supply,
            eventInfo.sold,
            eventInfo.perWalletCap,
            eventInfo.saleOpen
        );
    }
}
