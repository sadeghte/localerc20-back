const mongoose = require('mongoose');
const User = require('./User');
const EventBus = require('../../eventBus');

const TYPE_DEPOSIT = 'deposit';
const TYPE_WITHDRAW = 'withdraw';
const TYPE_BUY = 'buy';
const TYPE_SELL = 'sell';

const STATUS_NEW = 'new';
const STATUS_PENDING = 'pending';
const STATUS_DONE = 'done';
const STATUS_CANCEL = 'cancel';

let modelSchema = mongoose.Schema({
  type: {
    type: String,
    enum: [TYPE_DEPOSIT, TYPE_WITHDRAW, TYPE_BUY, TYPE_SELL],
    required:[true, 'Transaction type required.']
  },
  status: {
    type: String,
    enum: [STATUS_NEW, STATUS_PENDING, STATUS_DONE, STATUS_CANCEL],
    required:[true, 'Transaction status required.']
  },
  txHash: {
    type: String,
    unique: true,
    // required:[true, 'Transaction hash required.']
  },
  from: {
    type: String,
    required:[true, 'Transaction from required.']
  },
  token:{
    type: String,
    required:[true, 'Transaction token required.']
  },
  to: {
    type: String,
    required:[true, 'Transaction to required.']
  },
  txTime: mongoose.Schema.Types.Date,
  amount: Number,
  comments: {
    type: String,
    default: ""
  },
}, {timestamps: true});

modelSchema.post('save', function(doc) {
  EventBus.emit(EventBus.EVENT_TRANSACTION_POST_SAVE, doc);
});

const Model = module.exports = mongoose.model('transaction', modelSchema);

module.exports.TYPE_DEPOSIT = TYPE_DEPOSIT;
module.exports.TYPE_WITHDRAW = TYPE_WITHDRAW;
module.exports.TYPE_BUY = TYPE_BUY;
module.exports.TYPE_SELL = TYPE_SELL;

module.exports.STATUS_NEW = STATUS_NEW;
module.exports.STATUS_PENDING = STATUS_PENDING;
module.exports.STATUS_DONE = STATUS_DONE;
module.exports.STATUS_CANCEL = STATUS_CANCEL;