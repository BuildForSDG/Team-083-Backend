/* eslint-disable no-underscore-dangle */
const SmeProfile = require('../models/SmeProfile');
const ErrorHandler = require('../utility/error');


/**
     * SME creates a Profile to be verified
     * @param {object} req
     * @param {object} res
     * @returns {object} res object
     */
const createSmeProfile = async (req, res) => {
  const {
    businessName, category, elevatorPitch, pitchDeck, address, tinNumber, cacNumber
  } = req.body;
  const smeId = req.userData._id;

  // Check if user has a profile setup already
  // For MVP only one SME profile per SME
  const userHasSmeProfile = await SmeProfile.find({ smeId });
  if (userHasSmeProfile) throw new ErrorHandler(408, 'You already have a profile');

  // Required fields check
  if (typeof tinNumber !== 'number') throw new ErrorHandler(401, 'Valid Tin Number is required');
  if (typeof cacNumber !== 'number') throw new ErrorHandler(402, 'Valid CAC registration Number is required');
  if (!businessName || businessName.length < 2) throw new ErrorHandler(403, 'Enter a valid businessName');
  if (!address || address.length < 2) throw new ErrorHandler(404, 'Enter a valid address for your business');
  if (!elevatorPitch || elevatorPitch.length < 2) throw new ErrorHandler(405, 'A short Elevator pitch is required for funders');
  if (!category) throw new ErrorHandler(406, 'Kindly select a category to proceed');


  const newSmeProfile = new SmeProfile({
    smeId, businessName, category, address, elevatorPitch, pitchDeck, tinNumber, cacNumber
  });

  // Create new profile
  await newSmeProfile.save((err, profile) => {
    if (err) throw new ErrorHandler(500, 'Something went wrong, please try again', err);
    res.status(201).json({
      status: 'success',
      message: 'Profile setup successfull',
      profile
    });
  });
};

/**
 * Get a specific SME's Profile
 * @param {object} req
 * @param {object} res
 * @returns {object} res object
 */
const viewASmeProfile = async (req, res) => {
  const { id } = req.params;

  const smeProfile = await SmeProfile.findById({ _id: id });
  if (!smeProfile) throw new ErrorHandler(404, 'SME Profile does not exist');
  res.status(200).json({
    status: 'success',
    message: 'Found Profile',
    profile: smeProfile
  });
};

/**
 * Get logged in User's SME Profile
 * @param {object} req
 * @param {object} res
 */
const loggedInUserSmeProfile = async (req, res) => {
  const smeId = req.userData._id;

  const smeProfile = await SmeProfile.find({ smeId });
  if (!smeProfile) throw new ErrorHandler(404, 'You do not have a profile saved');
  res.status(200).json({
    status: 'success',
    message: 'Profile found successfully',
    profile: smeProfile
  });
};
/**
 * Get all SME Profiles
 * @param {object} req
 * @param {object} res
 * @returns {object} res object
 */
const viewAllProfiles = async (req, res) => {
  const smeProfiles = await SmeProfile.find();
  if (!smeProfiles) throw new ErrorHandler(404, 'SME Profile does not exist');
  res.status(200).json({
    status: 'success',
    message: `${smeProfiles.length} profiles found`,
    profiles: smeProfiles
  });
};

/**
     * Admin verifies a SME Profile
     * @param {object} req
     * @param {object} res
     * @returns {object} res object
     */
const verifyProfile = async (req, res) => {
  const { id } = req.params;

  // Confirm validity of the profile before proceeding
  const smeprofileExists = await SmeProfile.findById({ _id: id });
  if (!smeprofileExists) throw new ErrorHandler(404, 'Profile not found');
  // Confirm that the profile is not previously verified
  if (smeprofileExists.status === 'VERIFIED') throw new ErrorHandler(400, 'Profile has already been verified');
  const approve = await SmeProfile.findByIdAndUpdate({ _id: smeprofileExists._id },
    { $set: { status: 'VERIFIED' } }, { new: true });
  if (!approve) throw new ErrorHandler(500, 'Something went wrong, please try again later');
  res.status(200).json({
    status: 'success',
    message: `${smeprofileExists.businessName}'s Profile has been verified successfully`,
    profile: approve
  });
};
/**
     * Admin unverifies a SME Profile
     * @param {object} req
     * @param {object} res
     * @returns {object} res object
     */

const unverifyProfile = async (req, res) => {
  const { id } = req.params;

  // Confirm validity of the profile before proceeding
  const smeprofileExists = await SmeProfile.findById({ _id: id });
  if (!smeprofileExists) throw new ErrorHandler(404, 'Profile not found');

  // Confirm that it is only verified accounts that are unverified
  if (smeprofileExists.status !== 'VERIFIED') throw new ErrorHandler(400, 'Profile has not been verified');

  const unverify = await SmeProfile.findByIdAndUpdate({ _id: smeprofileExists._id },
    { $set: { status: 'UNVERIFIED' } }, { new: true });
  if (!unverify) throw new ErrorHandler(500, 'Something went wrong, please try again later');
  res.status(200).json({
    status: 'success',
    message: `${smeprofileExists.businessName}'s Profile has been unverified successfully`,
    profile: unverify
  });
};

module.exports = {
  createSmeProfile,
  verifyProfile,
  viewAllProfiles,
  viewASmeProfile,
  loggedInUserSmeProfile,
  unverifyProfile
};
