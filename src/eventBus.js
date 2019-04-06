const EventEmitter = require('events');
const ee = new EventEmitter();

module.exports = ee;

module.exports.EVENT_TRANSACTION_POST_SAVE = 'transaction_post_save';
module.exports.EVENT_TRADE_POST_SAVE = 'trade_post_save';