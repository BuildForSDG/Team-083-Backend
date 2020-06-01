const mongoose = require('mongoose');

const smeFundRequestSchema = mongoose.Schema({
  smeId: {
    type: String,
    required: true
  },
  milestone: {
    type: String,
    required: true,
    minlength: 15,
    maxlength: 150
  },
  description: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('SmeFundRequest', smeFundRequestSchema);
