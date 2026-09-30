// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TicketingStorage} from "../core/TicketingStorage.sol";

/**
 * @notice Event-specific validator permissions and one-time ticket check-in.
 *
 * Verifies the attendee's fresh wallet signature and
 * ownership. This module performs the on-chain part: it authorises gate staff
 * and permanently records that a valid ticket has been used.
 */
abstract contract TicketValidation is TicketingStorage {
    /**
     * @notice Give a wallet permission to validate one specific event.
     *         Only that event's organiser may grant the permission.
     */
    function grantValidator(
        uint256 eventId,
        address validator
    ) external onlyEventOrganiser(eventId) {
        require(validator != address(0), "invalid validator");

        validators[eventId][validator] = true;
        emit ValidatorGranted(eventId, validator, msg.sender);
    }

    /**
     * @notice Convenience view for the future frontend and integration tests.
     */
    function isValidator(
        uint256 eventId,
        address account
    ) external view returns (bool) {
        return validators[eventId][account];
    }

    /**
     * @notice Mark a ticket used at the gate. The caller must be a validator
     *         for the ticket's event, and each ticket can be used only once.
     */
    function markUsed(uint256 tokenId) external {
        address ticketOwner = _ownerOf(tokenId);
        require(ticketOwner != address(0), "ticket does not exist");

        uint256 eventId = ticketEventId[tokenId];
        require(validators[eventId][msg.sender], "not event validator");
        require(!isUsed[tokenId], "ticket already used");

        isUsed[tokenId] = true;
        emit TicketUsed(tokenId, eventId, msg.sender, ticketOwner);
    }
}
