// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title EventTicketing (Slice 2 — resale + price cap)
 * @notice One contract holds many events. Tickets are ERC-721 NFTs.
 *
 *   ERC-721 = a standard for "non-fungible" tokens: each ticket has a unique
 *   tokenId, like a unique seat pass, rather than interchangeable coins.
 *
 * Supported so far:
 *   - createEvent / buyTicket / getEventInfo  (Slice 1)
 *   - listForResale / buyResale / getListing  (Slice 2 — anti-scalping)
 *
 * Anti-scalping idea: a ticket may only be listed at or below its original
 * face price. The check lives IN the contract, so any marketplace call that
 * goes through these functions cannot scalp. (Open peer-to-peer transfers
 * outside this listing flow are a later design choice.)
 *
 * Validators / check-in / openSale-closeSale come in later slices.
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

    /**
     * @dev A resale listing on this contract.
     *      price == 0 means "not listed".
     */
    struct Listing {
        address seller;
        uint256 price; // wei; must be <= ticketFacePrice when created
    }

    // eventId => EventInfo
    mapping(uint256 => EventInfo) public events;

    // tokenId => which event this ticket belongs to
    mapping(uint256 => uint256) public ticketEventId;

    // tokenId => face price remembered on the ticket (enforces resale cap)
    mapping(uint256 => uint256) public ticketFacePrice;

    // tokenId => whether gate staff has marked it used
    mapping(uint256 => bool) public isUsed;

    // tokenId => active resale listing (if any)
    mapping(uint256 => Listing) public listings;

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
    // Resale (Slice 2) — price capped at face value
    // ---------------------------------------------------------------

    /**
     * @notice Owner lists their ticket for resale through THIS contract.
     *
     *   Anti-scalping rule (enforced on-chain):
     *     price MUST be <= the ticket's original face price.
     *   If someone tries to list above face value, the call REVERTS —
     *   the whole transaction is undone; nothing is stored.
     *
     * @param tokenId The ticket NFT to list
     * @param price   Asking price in wei (1 ETH = 10^18 wei)
     */
    function listForResale(uint256 tokenId, uint256 price) external {
        require(_ownerOf(tokenId) == msg.sender, "not ticket owner");
        require(!isUsed[tokenId], "ticket already used");
        require(price > 0, "price must be > 0");
        // Core anti-scalping check — cannot list above original face value
        require(price <= ticketFacePrice[tokenId], "price above face value");

        listings[tokenId] = Listing({seller: msg.sender, price: price});

        emit TicketListedForResale(tokenId, msg.sender, price);
    }

    /**
     * @notice Buy a listed ticket at the listed (capped) price.
     *         Payment is forwarded to the seller; the NFT moves to the buyer.
     *
     *   We use the internal _transfer so the seller does not need a separate
     *   ERC-721 "approve" step — listing on this contract is the consent.
     */
    function buyResale(uint256 tokenId) external payable {
        Listing memory listing = listings[tokenId];
        require(listing.price > 0, "not listed");
        require(msg.sender != listing.seller, "seller cannot buy own listing");
        require(msg.value == listing.price, "incorrect payment");
        // Seller must still own the ticket (guards against stale listings)
        require(_ownerOf(tokenId) == listing.seller, "seller no longer owns ticket");
        require(!isUsed[tokenId], "ticket already used");

        address seller = listing.seller;
        uint256 price = listing.price;

        // Clear listing BEFORE interactions (checks-effects-interactions pattern)
        delete listings[tokenId];

        // Move the NFT from seller -> buyer
        _transfer(seller, msg.sender, tokenId);

        // Forward ETH to the seller
        (bool ok, ) = payable(seller).call{value: price}("");
        require(ok, "payment to seller failed");

        emit TicketResold(tokenId, seller, msg.sender, price);
    }

    /**
     * @notice Optional helper: cancel your own listing.
     */
    function cancelResale(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.price > 0, "not listed");
        require(listing.seller == msg.sender, "not seller");
        delete listings[tokenId];
    }

    // ---------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------

    /**
     * @notice Read an active resale listing. price == 0 means not listed.
     */
    function getListing(
        uint256 tokenId
    ) external view returns (address seller, uint256 price) {
        Listing memory listing = listings[tokenId];
        return (listing.seller, listing.price);
    }

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
