const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Slice 2 tests: resale listing + on-chain face-value price cap.
 *
 * Anti-scalping: listForResale MUST revert if price > ticketFacePrice.
 * That rule lives in the contract — the UI cannot bypass it.
 */
describe("EventTicketing (Slice 2 — resale)", function () {
  async function readyTicketFixture() {
    const [organiser, seller, buyer] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("EventTicketing");
    const ticketing = await Factory.deploy();
    await ticketing.waitForDeployment();

    const facePrice = ethers.parseEther("0.01");
    await ticketing
      .connect(organiser)
      .createEvent("Campus Concert", facePrice, 10, 4);

    // Seller buys ticket #1 at face value
    await ticketing.connect(seller).buyTicket(1, { value: facePrice });

    return { ticketing, organiser, seller, buyer, facePrice, tokenId: 1n };
  }

  it("lists at or below face value and completes a resale", async function () {
    const { ticketing, seller, buyer, facePrice, tokenId } =
      await readyTicketFixture();

    // List at exactly face value (allowed)
    await ticketing.connect(seller).listForResale(tokenId, facePrice);

    const listing = await ticketing.getListing(tokenId);
    expect(listing.seller).to.equal(seller.address);
    expect(listing.price).to.equal(facePrice);

    // Buyer pays listed price; ETH goes to seller; NFT moves to buyer
    await expect(
      ticketing.connect(buyer).buyResale(tokenId, { value: facePrice })
    ).to.changeEtherBalances([buyer, seller], [-facePrice, facePrice]);

    expect(await ticketing.ownerOf(tokenId)).to.equal(buyer.address);

    // Listing cleared after sale
    const after = await ticketing.getListing(tokenId);
    expect(after.price).to.equal(0n);
  });

  it("allows listing below face value", async function () {
    const { ticketing, seller, buyer, tokenId } = await readyTicketFixture();
    const cheap = ethers.parseEther("0.005"); // half of face value

    await ticketing.connect(seller).listForResale(tokenId, cheap);

    await expect(
      ticketing.connect(buyer).buyResale(tokenId, { value: cheap })
    ).to.changeEtherBalances([buyer, seller], [-cheap, cheap]);

    expect(await ticketing.ownerOf(tokenId)).to.equal(buyer.address);
  });

  it("REVERTS when listing price is above face value (anti-scalping)", async function () {
    const { ticketing, seller, facePrice, tokenId } =
      await readyTicketFixture();

    const scalped = facePrice + 1n; // one wei over face value

    // This is the key anti-scalping test: overpriced listing is rejected on-chain
    await expect(
      ticketing.connect(seller).listForResale(tokenId, scalped)
    ).to.be.revertedWith("price above face value");
  });

  it("reverts when non-owner tries to list", async function () {
    const { ticketing, buyer, facePrice, tokenId } = await readyTicketFixture();

    await expect(
      ticketing.connect(buyer).listForResale(tokenId, facePrice)
    ).to.be.revertedWith("not ticket owner");
  });

  it("reverts buyResale when payment does not match listed price", async function () {
    const { ticketing, seller, buyer, facePrice, tokenId } =
      await readyTicketFixture();

    await ticketing.connect(seller).listForResale(tokenId, facePrice);

    await expect(
      ticketing
        .connect(buyer)
        .buyResale(tokenId, { value: ethers.parseEther("0.02") })
    ).to.be.revertedWith("incorrect payment");
  });
});
