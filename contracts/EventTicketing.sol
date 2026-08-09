// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title EventTicketing (Slice 1 — create + buy)
 * @notice One contract holds many events. Tickets are ERC-721 NFTs.
 *
 *   ERC-721 = a standard for "non-fungible" tokens: each ticket has a unique
 *   tokenId, like a unique seat pass, rather than interchangeable coins.
 *
 * This first slice only supports:
 *   - createEvent  (anyone becomes organiser of that event)
 *   - buyTicket    (lazy mint: mint the NFT only when someone pays)
 *   - getEventInfo (read event details; named to avoid clashing with ethers.js)
 *
 * Resale, validators, and check-in come in later slices.
 */
contract EventTicketing is ERC721 {
    // ---------------------------------------------------------------
    // Data structures
    // ---------------------------------------------------------------

    struct EventInfo {
        string name;
        address organiser; // who created this event (and may manage it later)
        uint256 facePrice; // price in wei (1 ETH = 10^18 wei)
        uint256 supply; // max number of tickets
        uint256 sold; // how many have been minted so far
        uint256 perWalletCap; // max tickets one address may buy
        bool saleOpen; // must be true before buyTicket works
    }

    // eventId => EventInfo
    mapping(uint256 => EventInfo) public events;

    // tokenId => which event this ticket belongs to
    mapping(uint256 => uint256) public ticketEventId;

    // tokenId => face price remembered on the ticket (needed for later resale cap)
    mapping(uint256 => uint256) public ticketFacePrice;

    // tokenId => whether gate staff has marked it used
    mapping(uint256 => bool) public isUsed;

    // eventId => buyer => how many tickets that buyer already holds for the event
    mapping(uint256 => mapping(address => uint256)) public purchasedCount;

    uint256 public nextEventId = 1;
    uint256 public nextTokenId = 1;

    // ---------------------------------------------------------------
    // Events (blockchain "logs")
    // ---------------------------------------------------------------
    // An "event" (log) is a cheap on-chain record apps can listen for.
    // It is NOT the same as our ticketing EventInfo — naming is confusing!

    event EventCreated(
        uint256 indexed eventId,
        address indexed organiser,
        string name,
        uint256 facePrice,
        uint256 supply,
        uint256 perWalletCap
    );

    event TicketPurchased(
        uint256 indexed eventId,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );

    // ---------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------

    constructor() ERC721("EventTicket", "TIX") {}

    // ---------------------------------------------------------------
    // Core functions (Slice 1)
    // ---------------------------------------------------------------

    /**
     * @notice Anyone can create an event; the caller becomes its organiser.
     * @param name Human-readable event name
     * @param facePrice Ticket price in wei
     * @param supply Max tickets that can be sold
     * @param perWalletCap Max tickets one wallet may buy
     * @return eventId The new event's id
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
            organiser: msg.sender, // msg.sender = the wallet that called this function
            facePrice: facePrice,
            supply: supply,
            sold: 0,
            perWalletCap: perWalletCap,
            saleOpen: true // Slice 1: sale opens immediately for easy testing
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

    /**
     * @notice Buy one ticket for an event. Lazy-mints an ERC-721 to the buyer.
     *
     *   "payable" means this function can receive ETH with the call.
     *   "msg.value" is how much ETH (in wei) the caller sent.
     *
     *   If any require() fails, the whole transaction REVERTS: no ticket is
     *   minted and the ETH is returned to the buyer (minus gas already spent).
     *   Gas = the small fee paid to the network to run your transaction.
     */
    function buyTicket(uint256 eventId) external payable {
        EventInfo storage ev = events[eventId];
        require(ev.organiser != address(0), "event does not exist");
        require(ev.saleOpen, "sale is closed");
        require(ev.sold < ev.supply, "sold out");
        require(
            purchasedCount[eventId][msg.sender] < ev.perWalletCap,
            "per-wallet cap reached"
        );
        require(msg.value == ev.facePrice, "incorrect payment");

        uint256 tokenId = nextTokenId;
        nextTokenId += 1;

        ev.sold += 1;
        purchasedCount[eventId][msg.sender] += 1;

        ticketEventId[tokenId] = eventId;
        ticketFacePrice[tokenId] = ev.facePrice;
        // isUsed defaults to false

        // Mint the NFT directly to the buyer (lazy mint = mint at purchase time)
        _safeMint(msg.sender, tokenId);

        // Forward payment to the event organiser
        (bool ok, ) = payable(ev.organiser).call{value: msg.value}("");
        require(ok, "payment to organiser failed");

        emit TicketPurchased(eventId, tokenId, msg.sender, msg.value);
    }

    // ---------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------

    /**
     * @notice Read event details. "view" = free to call, does not change state,
     *         and does not cost gas when called from outside a transaction.
     *
     * Named getEventInfo (not getEvent) because ethers.js v6 already uses
     * contract.getEvent(...) for reading blockchain log definitions.
     */
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
        EventInfo storage ev = events[eventId];
        require(ev.organiser != address(0), "event does not exist");
        return (
            ev.name,
            ev.organiser,
            ev.facePrice,
            ev.supply,
            ev.sold,
            ev.perWalletCap,
            ev.saleOpen
        );
    }
}
