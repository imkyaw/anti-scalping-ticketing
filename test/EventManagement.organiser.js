const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Event organiser tests: event setup, event-specific permissions, and sale
 * controls. These tests exercise blockchain rules only; no frontend is used.
 */
describe("EventTicketing — event organiser", function () {
  const facePrice = ethers.parseEther("0.01");

  async function deployFixture() {
    const [organiser, otherWallet, buyer] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("EventTicketing");
    const ticketing = await Factory.deploy();
    await ticketing.waitForDeployment();

    await ticketing
      .connect(organiser)
      .createEvent("Campus Concert", facePrice, 100, 4);

    return { ticketing, organiser, otherWallet, buyer };
  }

  it("records the creator and event setup correctly", async function () {
    const { ticketing, organiser } = await deployFixture();

    const eventInfo = await ticketing.getEventInfo(1);
    expect(eventInfo.name).to.equal("Campus Concert");
    expect(eventInfo.organiser).to.equal(organiser.address);
    expect(eventInfo.facePrice).to.equal(facePrice);
    expect(eventInfo.supply).to.equal(100n);
    expect(eventInfo.perWalletCap).to.equal(4n);
    expect(eventInfo.sold).to.equal(0n);
    expect(eventInfo.saleOpen).to.equal(true);
  });

  it("allows only the organiser to close and reopen their sale", async function () {
    const { ticketing, organiser } = await deployFixture();

    await expect(ticketing.connect(organiser).closeSale(1))
      .to.emit(ticketing, "SaleClosed")
      .withArgs(1);
    expect((await ticketing.getEventInfo(1)).saleOpen).to.equal(false);

    await expect(ticketing.connect(organiser).openSale(1))
      .to.emit(ticketing, "SaleOpened")
      .withArgs(1);
    expect((await ticketing.getEventInfo(1)).saleOpen).to.equal(true);
  });

  it("rejects sale controls from another wallet", async function () {
    const { ticketing, otherWallet } = await deployFixture();

    await expect(
      ticketing.connect(otherWallet).closeSale(1)
    ).to.be.revertedWith("not event organiser");

    await expect(
      ticketing.connect(otherWallet).openSale(1)
    ).to.be.revertedWith("not event organiser");
  });

  it("rejects an invalid event ID", async function () {
    const { ticketing, organiser } = await deployFixture();

    await expect(ticketing.connect(organiser).closeSale(999)).to.be.revertedWith(
      "event does not exist"
    );
    await expect(ticketing.getEventInfo(999)).to.be.revertedWith(
      "event does not exist"
    );
  });

  it("prevents ticket purchases while the organiser has closed the sale", async function () {
    const { ticketing, organiser, buyer } = await deployFixture();
    await ticketing.connect(organiser).closeSale(1);

    await expect(
      ticketing.connect(buyer).buyTicket(1, { value: facePrice })
    ).to.be.revertedWith("sale is closed");
  });

  it("rejects invalid price, supply, and purchase-limit setup", async function () {
    const { ticketing, organiser } = await deployFixture();

    await expect(
      ticketing.connect(organiser).createEvent("No price", 0, 10, 1)
    ).to.be.revertedWith("facePrice must be > 0");

    await expect(
      ticketing.connect(organiser).createEvent("No supply", facePrice, 0, 1)
    ).to.be.revertedWith("supply must be > 0");

    await expect(
      ticketing.connect(organiser).createEvent("No cap", facePrice, 10, 0)
    ).to.be.revertedWith("perWalletCap must be > 0");
  });
});
