const mongoose = require('mongoose');
require('./TradeMessage');

const STATUS_REQUEST = 'request';
const STATUS_START = 'start';
const STATUS_PAYMENT = 'payment';
const STATUS_RELEASE = 'release';
const STATUS_DISPUTE = 'dispute';
const STATUS_CANCEL = 'cancel';
const STATUS_DONE = 'done';

let currencySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'user',
    required:[true, 'User required for creating Trade.']
  },
  advertisementOwner: {
    type: mongoose.Schema.Types.ObjectId, ref: 'user',
    required:[true, 'Trader required for creating Trade.']
  },
  advertisement: {
    type: mongoose.Schema.Types.ObjectId, ref: 'advertisement',
    required:[true, 'Advertisement required for creating Trade.']
  },
  startTime:{type: Number, default: 0},
  paymentTime:{type: Number, default: 0},
  status: {
    type:String,
    enum:[STATUS_REQUEST, STATUS_START, STATUS_PAYMENT, STATUS_RELEASE, STATUS_DISPUTE, STATUS_CANCEL, STATUS_DONE],
    required:[true, 'Trade status required.']
  },
  tokenCount: Number
}, {timestamps: true});

// currencySchema.pre('find', function() {
//   this.populate('messages').populate('user');
// });

currencySchema.virtual('messages', {
  ref: 'trade-message', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'trade', // is equal to `foreignField`
  // count: true // And only get the number of docs
});

currencySchema.set('toObject', { virtuals: true });
currencySchema.set('toJSON', { virtuals: true });

let Model = module.exports = mongoose.model('trade', currencySchema);

module.exports.STATUS_REQUEST = STATUS_REQUEST;
module.exports.STATUS_START = STATUS_START;
module.exports.STATUS_PAYMENT = STATUS_PAYMENT;
module.exports.STATUS_RELEASE = STATUS_RELEASE;
module.exports.STATUS_DISPUTE = STATUS_DISPUTE;
module.exports.STATUS_CANCEL = STATUS_CANCEL;
module.exports.STATUS_DONE = STATUS_DONE;