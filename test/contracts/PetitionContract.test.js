const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PetitionContract", function () {
  let PetitionContract;
  let petition;
  let owner;
  let signer1;
  let signer2;
  let signer3;

  const petitionId = "test-petition-123";
  const title = "Test Petition for Feature Request";
  const signatureThreshold = 3;
  let deadline;

  beforeEach(async function () {
    // Get signers
    [owner, signer1, signer2, signer3] = await ethers.getSigners();

    // Set deadline to 30 days from now
    const currentTime = await time.latest();
    deadline = currentTime + (30 * 24 * 60 * 60);

    // Deploy contract
    PetitionContract = await ethers.getContractFactory("PetitionContract");
    petition = await PetitionContract.deploy(
      petitionId,
      title,
      signatureThreshold,
      deadline
    );
    await petition.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct petition details", async function () {
      const details = await petition.getPetitionDetails();
      expect(details.petitionId).to.equal(petitionId);
      expect(details.title).to.equal(title);
      expect(details.signatureThreshold).to.equal(signatureThreshold);
      expect(details.deadline).to.equal(deadline);
      expect(details.isActive).to.be.true;
      expect(details.creator_).to.equal(owner.address);
    });

    it("Should initialize with zero signatures", async function () {
      const status = await petition.getPetitionStatus();
      expect(status.signatureCount).to.equal(0);
    });

    it("Should emit PetitionCreated event", async function () {
      const currentTime = await time.latest();
      const newDeadline = currentTime + (30 * 24 * 60 * 60);

      await expect(
        PetitionContract.deploy(
          "new-petition",
          "New Petition",
          5,
          newDeadline
        )
      )
        .to.emit(PetitionContract, "PetitionCreated")
        .withArgs("new-petition", "New Petition", 5, newDeadline, owner.address);
    });

    it("Should revert if signature threshold is zero", async function () {
      const currentTime = await time.latest();
      const newDeadline = currentTime + (30 * 24 * 60 * 60);

      await expect(
        PetitionContract.deploy(petitionId, title, 0, newDeadline)
      ).to.be.revertedWith("Signature threshold must be greater than 0");
    });

    it("Should revert if deadline is in the past", async function () {
      const pastDeadline = (await time.latest()) - 1000;

      await expect(
        PetitionContract.deploy(petitionId, title, signatureThreshold, pastDeadline)
      ).to.be.revertedWith("Deadline must be in the future");
    });

    it("Should revert if petition ID is empty", async function () {
      const currentTime = await time.latest();
      const newDeadline = currentTime + (30 * 24 * 60 * 60);

      await expect(
        PetitionContract.deploy("", title, signatureThreshold, newDeadline)
      ).to.be.revertedWith("Petition ID cannot be empty");
    });

    it("Should revert if title is empty", async function () {
      const currentTime = await time.latest();
      const newDeadline = currentTime + (30 * 24 * 60 * 60);

      await expect(
        PetitionContract.deploy(petitionId, "", signatureThreshold, newDeadline)
      ).to.be.revertedWith("Title cannot be empty");
    });
  });

  describe("Signing Petition", function () {
    it("Should allow a user to sign the petition", async function () {
      await expect(petition.connect(signer1).signPetition())
        .to.emit(petition, "PetitionSigned")
        .withArgs(signer1.address, await time.latest(), 1);

      expect(await petition.hasUserSigned(signer1.address)).to.be.true;
      const status = await petition.getPetitionStatus();
      expect(status.signatureCount).to.equal(1);
    });

    it("Should prevent duplicate signatures", async function () {
      await petition.connect(signer1).signPetition();

      await expect(
        petition.connect(signer1).signPetition()
      ).to.be.revertedWith("Already signed this petition");
    });

    it("Should track multiple signers", async function () {
      await petition.connect(signer1).signPetition();
      await petition.connect(signer2).signPetition();
      await petition.connect(signer3).signPetition();

      const signers = await petition.getSigners();
      expect(signers.length).to.equal(3);
      expect(signers).to.include(signer1.address);
      expect(signers).to.include(signer2.address);
      expect(signers).to.include(signer3.address);
    });

    it("Should emit PetitionThresholdReached when threshold is met", async function () {
      await petition.connect(signer1).signPetition();
      await petition.connect(signer2).signPetition();

      await expect(petition.connect(signer3).signPetition())
        .to.emit(petition, "PetitionThresholdReached")
        .withArgs(3, await time.latest());
    });

    it("Should prevent signing after deadline", async function () {
      // Fast forward time past deadline
      await time.increaseTo(deadline + 1);

      await expect(
        petition.connect(signer1).signPetition()
      ).to.be.revertedWith("Petition deadline has passed");
    });

    it("Should update signature count correctly", async function () {
      await petition.connect(signer1).signPetition();
      expect(await petition.getSignerCount()).to.equal(1);

      await petition.connect(signer2).signPetition();
      expect(await petition.getSignerCount()).to.equal(2);

      await petition.connect(signer3).signPetition();
      expect(await petition.getSignerCount()).to.equal(3);
    });
  });

  describe("Petition Status", function () {
    it("Should correctly report if threshold is reached", async function () {
      expect(await petition.hasReachedThreshold()).to.be.false;

      await petition.connect(signer1).signPetition();
      await petition.connect(signer2).signPetition();
      expect(await petition.hasReachedThreshold()).to.be.false;

      await petition.connect(signer3).signPetition();
      expect(await petition.hasReachedThreshold()).to.be.true;
    });

    it("Should correctly report if petition is expired", async function () {
      expect(await petition.isExpired()).to.be.false;

      await time.increaseTo(deadline + 1);
      expect(await petition.isExpired()).to.be.true;
    });

    it("Should return correct petition status", async function () {
      await petition.connect(signer1).signPetition();

      const status = await petition.getPetitionStatus();
      expect(status.signatureCount).to.equal(1);
      expect(status.signatureThreshold).to.equal(signatureThreshold);
      expect(status.deadline).to.equal(deadline);
      expect(status.isActive).to.be.true;
    });
  });

  describe("View Functions", function () {
    it("Should return empty signers array initially", async function () {
      const signers = await petition.getSigners();
      expect(signers.length).to.equal(0);
    });

    it("Should return correct signer count", async function () {
      expect(await petition.getSignerCount()).to.equal(0);

      await petition.connect(signer1).signPetition();
      expect(await petition.getSignerCount()).to.equal(1);
    });

    it("Should correctly check if user has signed", async function () {
      expect(await petition.hasUserSigned(signer1.address)).to.be.false;

      await petition.connect(signer1).signPetition();
      expect(await petition.hasUserSigned(signer1.address)).to.be.true;
      expect(await petition.hasUserSigned(signer2.address)).to.be.false;
    });

    it("Should return complete petition details", async function () {
      const details = await petition.getPetitionDetails();

      expect(details.petitionId).to.equal(petitionId);
      expect(details.title).to.equal(title);
      expect(details.signatureCount).to.equal(0);
      expect(details.signatureThreshold).to.equal(signatureThreshold);
      expect(details.deadline).to.equal(deadline);
      expect(details.isActive).to.be.true;
      expect(details.creator_).to.equal(owner.address);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle signing at exact deadline", async function () {
      await time.increaseTo(deadline);
      await expect(petition.connect(signer1).signPetition()).to.not.be.reverted;
    });

    it("Should handle threshold of 1", async function () {
      const currentTime = await time.latest();
      const newDeadline = currentTime + (30 * 24 * 60 * 60);

      const singleThresholdPetition = await PetitionContract.deploy(
        "single-threshold",
        "Single Threshold Petition",
        1,
        newDeadline
      );

      await expect(singleThresholdPetition.connect(signer1).signPetition())
        .to.emit(singleThresholdPetition, "PetitionThresholdReached");
    });

    it("Should handle large signature thresholds", async function () {
      const currentTime = await time.latest();
      const newDeadline = currentTime + (30 * 24 * 60 * 60);

      const largePetition = await PetitionContract.deploy(
        "large-threshold",
        "Large Threshold Petition",
        1000,
        newDeadline
      );

      await largePetition.connect(signer1).signPetition();
      expect(await largePetition.hasReachedThreshold()).to.be.false;
    });
  });
});
