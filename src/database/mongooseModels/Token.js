const mongoose = require('mongoose');

let tokenSchema = mongoose.Schema({
  title: String,
  code: {type: String, unique: true},
  type: {
    type: String,
    enum: ['ERC20'],
  },
  info: Object,
}, {timestamps: true});

module.exports = mongoose.model('crypto-token', tokenSchema);