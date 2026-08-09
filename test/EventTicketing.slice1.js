const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Slice 1 tests: createEvent + buyTicket basics.
 * More cases (resale cap, validators, etc.) land in later slices.
 */
describe("EventTicketing (Slice 1)", function () {
  async function deployFixture() {
    const [organiser, buyer, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("EventTicketing");
    const ticketing = await Factory.deploy();
    await ticketing.waitForDeployment();
    return { ticketing, organiser, buyer, other };
  }

  it("creates an event and lets a buyer purchase one ticket", async function () {
    const { ticketing, organiser, buyer } = await deployFixture();
    const facePrice = ethers.parseEther("0.01");

    // Organiser creates the event
    await ticketing
      .connect(organiser)
      .createEvent("Campus Concert", facePrice, 10, 2);

    const ev = await ticketing.getEventInfo(1);
    expect(ev.name).to.equal("Campus Concert");
    expect(ev.organiser).to.equal(organiser.address);
    expect(ev.facePrice).to.equal(facePrice);
    expect(ev.supply).to.equal(10n);
    expect(ev.sold).to.equal(0n);
    expect(ev.saleOpen).to.equal(true);

    // Buyer pays exactly facePrice and receives token #1
    await expect(
      ticketing.connect(buyer).buyTicket(1, { value: facePrice })
    ).to.changeEtherBalances([buyer, organiser], [-facePrice, facePrice]);

    expect(await ticketing.ownerOf(1)).to.equal(buyer.address);
    expect(await ticketing.ticketEventId(1)).to.equal(1n);
    expect(await ticketing.ticketFacePrice(1)).to.equal(facePrice);
    expect(await ticketing.isUsed(1)).to.equal(false);

    const after = await ticketing.getEventInfo(1);
    expect(after.sold).to.equal(1n);
  });

  it("reverts when payment is wrong", async function () {
    const { ticketing, organiser, buyer } = await deployFixture();
    const facePrice = ethers.parseEther("0.01");
    await ticketing
      .connect(organiser)
      .createEvent("Campus Concert", facePrice, 10, 2);

    await expect(
      ticketing.connect(buyer).buyTicket(1, { value: ethers.parseEther("0.02") })
    ).to.be.revertedWith("incorrect payment");
  });
});
