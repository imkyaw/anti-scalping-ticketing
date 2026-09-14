// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TicketingStorage} from "./core/TicketingStorage.sol";
import {EventManagement} from "./modules/EventManagement.sol";
import {PrimarySales} from "./modules/PrimarySales.sol";
import {ResaleMarket} from "./modules/ResaleMarket.sol";

/**
 * @title EventTicketing
 * @notice The one contract deployed by Hardhat.
 *
 * Solidity combines these inherited modules into one contract address with
 * one shared state. The split only improves team ownership of source files;
 * it does not change the deployed architecture or existing behavior.
 */
contract EventTicketing is EventManagement, PrimarySales, ResaleMarket {
    constructor() TicketingStorage("EventTicket", "TIX") {}
}
