const mongoose = require('mongoose');

const TYPE_TEXT = 'text';
const TYPE_FILE = 'file';

const currencySchema = mongoose.Schema({
  trade: {
    type: mongoose.Schema.Types.ObjectId, ref: 'trade',
    required:[true, 'Trade required for creating TradeMessage.']
  },
  type: {
    type: String,
    enum: [TYPE_TEXT, TYPE_FILE],
    required:[true, 'Trade message type required.']
  },
  content: {
    type: String,
    required:[true, 'Trade message content required.']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId, ref: 'user',
    required:[true, 'Trade message sender required.']
  },
}, {timestamps: true});

currencySchema.pre('find', function() {
  this.populate('sender');
});

module.exports = mongoose.model('trade-message', currencySchema);

module.exports.TYPE_FILE = TYPE_FILE;
module.exports.TYPE_TEXT = TYPE_TEXT;