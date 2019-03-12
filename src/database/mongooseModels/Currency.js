const mongoose = require('mongoose');

let currencySchema = mongoose.Schema({
  title: String,
  code: {type: String, unique: true}
}, {timestamps: true});

module.exports = mongoose.model('currency', currencySchema);