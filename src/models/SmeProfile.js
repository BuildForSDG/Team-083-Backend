const mongoose = require('mongoose');

const smeProfileSchema = mongoose.Schema({
  smeId: {

    type: String,

    required: true,

    unique: true
  },
  businessName: {

    type: String,

    required: true,

    lowercase: true,

    unique: true
  },
  category: {

    type: String,

    lowercase: true,

    required: true
  },
  address: {
    type: String,

    required: true
  },
  elevatorPitch: {

    type: String,

    required: true
  },
  pitchDeck: {
    type: String,

    default: ''
  },
  tinNumber: {

    type: Number,

    required: true,

    unique: true
  },
  cacNumber: {

    type: Number,

    required: true,

    unique: true
  },
  logo: {

    type: String,

    default: ''
  },
  status: {
    type: String,

    enum: ['UNVERIFIED', 'VERIFIED', 'SUSPENDED'],

    default: 'UNVERIFIED',

    uppercase: true
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('smeProfiles', smeProfileSchema);
