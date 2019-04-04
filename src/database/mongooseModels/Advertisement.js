const mongoose = require('mongoose');

const dayOpeningHourSchema = new mongoose.Schema({
  start: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{2}\:\d{2}/.test(v);
      },
      message: props => `${props.value} is not a valid time string. example: (04:05)!`
    },
    required:[true, 'Opening hour start time required.']
  },
  end: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{2}\:\d{2}/.test(v);
      },
      message: props => `${props.value} is not a valid time window. example: (04:05)!`
    },
    required:[true, 'Opening hour end time required.']
  },
  enable: Boolean
}, {_id: false});

let currencySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'user',
    required:[true, 'Advertisement user required.']
  },
  type: {
    type:String,
    enum:['buy','sell'],
    required:[true, 'Advertisement type required.']
  },
  token: {
    type: mongoose.Schema.Types.ObjectId, ref: 'crypto-token',
    required:[true, 'Advertisement token required.']
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId, ref: 'payment-method',
    required:[true, 'Advertisement token required.']
  },
  paymentWindow: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{2}\:\d{2}/.test(v);
      },
      message: props => `${props.value} is not a valid time window. example: (04:05)!`
    },
    required:[true, 'Advertisement paymentWindow required.']
  },
  amount: Number,
  currency: {
    type: mongoose.Schema.Types.ObjectId, ref: 'currency',
    required:[true, 'Advertisement currency required.']
  },
  limitMin: {type: Number, default: 0},
  limitMax: {type: Number, default: 100},
  enable: {type: Boolean, default: true},
  ownerBalanceEnough:{
    type: Boolean,
    default: false
  },
  openingHours: {
    type: [dayOpeningHourSchema],
    validate: {
      validator: function(v) {
        // should contain 7 days data.
        if(v.length !== 7)
          return false;
      },
      message: props => `${props.value} is not a valid opening hours data.`
    },
    required:[true, 'Advertisement openingHours required.']
  },
  terms:{type: String, default: ""}
}, {timestamps: true});

module.exports = mongoose.model('advertisement', currencySchema);