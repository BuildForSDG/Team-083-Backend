const mongoose = require('mongoose');

const smeCategorySchema = mongoose.Schema({
  name: {
    type: String,

    unique: true,

    lowercase: true,

    required: true
  },
  description: {
    type: String,

    default: ''
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('smeCategory', smeCategorySchema);
