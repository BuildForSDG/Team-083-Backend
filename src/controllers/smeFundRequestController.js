/* eslint-disable no-underscore-dangle */
const SmeFundRequest = require('../models/SmeFundRequest');
const SmeProfile = require('../models/SmeProfile');
const ErrorHandler = require('../utility/error');

/**
     * SME creates a Fund request
     * @param {object} req
     * @param {object} res
     * @returns {object} res object
     */

const createFundRequest = async (req, res) => {
  const smeId = req.userData._id;

  const { milestone, description, amount } = req.body;

  // Check that SMEProfile is active
  const smeProfile = await SmeProfile.findOne({ smeId });
  if (!smeProfile) throw new ErrorHandler(404, 'Kindly create an SME profile to be able to request for funds');
  if (smeProfile.status !== 'VERIFIED') throw new ErrorHandler(400, `You cannot request for funds as your SME account is currently ${smeProfile.status}`);

  // validate user input
  if (!milestone || milestone.length < 5) throw new ErrorHandler(400, 'Kindly enter a milestone for this request');
  if (!amount) throw new ErrorHandler(400, 'Kindly enter an amount for this request');

  const newfundRequest = new SmeFundRequest({
    smeId, milestone, description, amount
  });

  // Create new Request
  await newfundRequest.save((err, fundRequest) => {
    if (err) throw new ErrorHandler(500, 'Something went wrong, please try again', err);
    res.status(201).json({
      status: 'success',
      message: 'Fund request created successfully',
      fundRequest
    });
  });
};

/**
    * View all Fund Requests by a SME
     * @param {object} req
     * @param {object} res
     * @returns {object} res object
 */

const viewSmeFundRequests = async (req, res) => {
  const { smeId } = req.params;
  const fundRequests = await SmeFundRequest.find({ smeId });

  // check if sme has requested for funds
  if (!fundRequests) throw new ErrorHandler(404, 'SME is yet to make a fund request');
  res.status(200).json({
    status: 'success',
    message: 'Requests found',
    fundRequests
  });
};

/**
    * View a specific Fund Request
     * @param {object} req
     * @param {object} res
     * @returns {object} res object
 */
const viewAFundRequest = async (req, res) => {
  const { requestId } = req.params;
  const fundRequest = await SmeFundRequest.findOne({ _id: requestId });
  if (!fundRequest) throw new ErrorHandler(404, 'That Request does not exist, might have been deleted');

  res.status(200).json({
    status: 'success',
    message: ' Request has been found',
    fundRequest
  });
};

module.exports = { createFundRequest, viewSmeFundRequests, viewAFundRequest };
