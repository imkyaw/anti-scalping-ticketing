// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @notice The currently implemented public API.
 * Frontend and contract contributors can agree on this file before coding.
 */
interface IEventTicketing {
    function createEvent(
        string calldata name,
        uint256 facePrice,
        uint256 supply,
        uint256 perWalletCap
    ) external returns (uint256 eventId);

    function openSale(uint256 eventId) external;
    function closeSale(uint256 eventId) external;
    function buyTicket(uint256 eventId) external payable;
    function ticketsOf(
        address account
    ) external view returns (uint256[] memory tokenIds);
    function listForResale(uint256 tokenId, uint256 price) external;
    function buyResale(uint256 tokenId) external payable;
    function cancelResale(uint256 tokenId) external;
    function grantValidator(uint256 eventId, address validator) external;
    function markUsed(uint256 tokenId) external;

    function isValidator(
        uint256 eventId,
        address account
    ) external view returns (bool);

    function getListing(
        uint256 tokenId
    ) external view returns (address seller, uint256 price);

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
        );
}
