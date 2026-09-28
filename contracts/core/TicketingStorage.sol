// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @notice Shared data used by all current ticketing modules.
 *
 * Keeping state in one file prevents different contributors from declaring
 * duplicate mappings or creating an unsafe storage layout.
 */
abstract contract TicketingStorage is ERC721 {
    struct EventInfo {
        string name;
        address organiser;
        uint256 facePrice;
        uint256 supply;
        uint256 sold;
        uint256 perWalletCap;
        bool saleOpen;
    }

    struct Listing {
        address seller;
        uint256 price;
    }

    // Public visibility preserves the getters in the existing contract ABI.
    mapping(uint256 => EventInfo) public events;
    mapping(uint256 => uint256) public ticketEventId;
    mapping(uint256 => uint256) public ticketFacePrice;
    mapping(uint256 => bool) public isUsed;
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => mapping(address => uint256)) public purchasedCount;

    uint256 public nextEventId = 1;
    uint256 public nextTokenId = 1;

    // Solidity events are blockchain logs that the frontend can observe.
    event EventCreated(
        uint256 indexed eventId,
        address indexed organiser,
        string name,
        uint256 facePrice,
        uint256 supply,
        uint256 perWalletCap
    );

    event SaleOpened(uint256 indexed eventId);
    event SaleClosed(uint256 indexed eventId);

    event TicketPurchased(
        uint256 indexed eventId,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );

    event TicketListedForResale(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    event TicketResold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    constructor(
        string memory tokenName,
        string memory tokenSymbol
    ) ERC721(tokenName, tokenSymbol) {}

    /**
     * @dev First reject unknown event IDs, then check the event-specific role.
     * There is intentionally no global organiser/admin role in this project.
     */
    modifier onlyEventOrganiser(uint256 eventId) {
        require(events[eventId].organiser != address(0), "event does not exist");
        require(
            events[eventId].organiser == msg.sender,
            "not event organiser"
        );
        _;
    }
}
