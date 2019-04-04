const randomString = require("../utils/randomString");
const { Router } = require('express');
const mongoose = require('mongoose');
const Advertisement = require('../database/mongooseModels/Advertisement');
const {forceAuthorized} = require('../middleware/Authenticate');
const Trade = require('../database/mongooseModels/Trade');
const Transaction = require('../database/mongooseModels/Transaction');
const TradeMessage = require('../database/mongooseModels/TradeMessage');
const requireParam = require('../middleware/requestParamRequire');
let router = Router();

router.post('/search', function (req, res, next) {
  let sellAdvertisements = [], buyAdvertisements = [];
  Advertisement.find({type: 'sell', ownerBalanceEnough: true})
      .limit(5)
      .populate('user')
      .populate('token')
      .populate('currency')
      .then(advs => {
        sellAdvertisements = advs;
        return Advertisement.find({type: 'buy', ownerBalanceEnough: true})
            .limit(5)
            .populate('user')
            .populate('token')
            .populate('currency')
      })
      .then(advs => {
        buyAdvertisements = advs;
        res.send({
          success: true,
          sellAdvertisements,
          buyAdvertisements
        })
      })
      .catch(error => {
        res.status(500).send({
          success: false,
          message: error.message || 'some error happens on search',
          error
        })
      })
});

router.post('/list',forceAuthorized, function (req, res, next) {
  let currentUser = req.data.user;
  Trade.find({$or: [
      {user: currentUser._id},
      {trader: currentUser._id},
  ]})
      .populate({path: 'advertisement', populate: {path: 'token'}})
      .populate('advertisementOwner')
      .then(trades => {
        res.send({
          success: true,
          trades
        })
      })
      .catch(error => {
        res.status(500).send({
          success: false,
          message: error.message || 'Server side error',
          error
        });
      })
})

router.post('/create',forceAuthorized, requireParam('advertisementId:objectId', 'count:number'), function (req, res, next) {
  let currentUser = req.data.user;
  let message = req.body.message || [];
  // message.push({sender: currentUser, type: Trade.MESSAGE_TYPE_TEXT, content: "user request to start trade"});
  let count = req.body.count;
  let advertisement = null;
  let newTrade = null;
  Advertisement.findOne({_id: req.body.advertisementId})
      .then(adv => {
        advertisement = adv;
        // TODO: commented for test the system. after test, uncomment this 2 lines
        // if(adv.user.toString() === currentUser._id.toString())
        //   throw {message: 'User cannot trade with him/her self.'};
        let tradeData = {
          user: currentUser,
          advertisementOwner: adv.user,
          advertisement: adv,
          tokenCount: count,
          status: Trade.STATUS_REQUEST
        };
        return new Trade(tradeData);
      })
      .then(trade => {
        newTrade = trade;
        return trade.save()
      })
      .then(() => {
        if(message) {
          return new TradeMessage({
            trade: newTrade._id,
            type: TradeMessage.TYPE_TEXT,
            content: message,
            sender: currentUser
          }).save();
        }
      })
      .then(() => {
        res.send({
          success: true,
          tradeId: newTrade._id
        })
      })
      .catch(error => {
        res.status(500).send({
          success: false,
          message: error.message || 'Server side error',
          error
        });
      })
})

router.post('/message', forceAuthorized, requireParam('tradeId:objectId', 'type:string', 'content:string'), function(req, res, next){
  let type = req.body.type;
  let content = req.body.content;
  let trade = null
  if(type !== 'text'){
    return res.status(500).send({
      success: false,
      message: 'At the moment, only text message supported'
    });
  }
  Trade.findOne({_id: req.body.tradeId})
      .populate('user')
      .then(trd => {
        if(!trd)
          throw ({message: "Cannot find the trade."});
        trade = trd;
        // trade.messages.push({sender: req.data.user, type, content});
        let tradeMessage = new TradeMessage({trade, sender: req.data.user, type, content});
        return tradeMessage.save();
      })
      .then(() => TradeMessage.find({trade: trade._id}))
      .then(messages => {
        res.send({
          success: true,
          messages,
        })
      })
      .catch(error => {
        res.status(500).send({
          success: false,
          message: error.message || 'server side error',
          error
        })
      })
})

router.post('/get-info', forceAuthorized, requireParam('id:objectId'), function (req, res, next) {
  Trade.findOne({_id: req.body.id})
      .populate('user')
      .populate('advertisement')
      .populate('messages')
      .populate({path: 'messages.sender', model: 'user'})
      .then(trade => {
        res.send({
          success: true,
          trade,
        })
      })
      .catch(error => {
        console.log(error.message);
        res.status(500).send({
          success: false,
          message: error.message || 'server side error',
          error
        })
      })
})

router.post('/start', forceAuthorized, requireParam('id:objectId'), function (req, res, next) {
  let currentUser = req.data.user;
  let trade = null;
  Trade.findOne({_id: req.body.id})
      .populate('user')
      .populate({path: 'advertisement', populate: {path: 'token'}})
      .populate('messages')
      .populate({path: 'messages.sender', model: 'user'})
      .then(trd => {
        trade = trd;
        if(trade.status !== Trade.STATUS_REQUEST)
          throw {message: "Invalid trade status. only a requested trade, can start."};
        if(currentUser._id.toString() !== trade.advertisementOwner.toString())
          throw {message: "Access denied. only advertisement owner, can start a trade"};
        trade.status = Trade.STATUS_START;
        trade.startTime = Date.now();
        return trade.save();
      })
      .then(() => {
        // advertisement owner transaction
        return new Transaction({
          type: trade.advertisement.type === 'sell' ? Transaction.TYPE_SELL : Transaction.TYPE_BUY,
          amount: trade.tokenCount,
          token: trade.advertisement.token.code,
          status: Transaction.STATUS_NEW,
          txHash: '0x' + randomString(64,'0123456789abcdef'),
          from: trade.advertisement.type === 'sell' ? currentUser.address : trade.user.address,
          to: trade.advertisement.type === 'sell' ? trade.user.address : currentUser.address,
          txTime: Date.now(),
        }).save();
      })
      .then(() => {
        // trade owner transaction
        return new Transaction({
          type: trade.advertisement.type === 'sell' ? Transaction.TYPE_BUY : Transaction.TYPE_SELL,
          amount: trade.tokenCount,
          token: trade.advertisement.token.code,
          status: Transaction.STATUS_NEW,
          txHash: '0x' + randomString(64,'0123456789abcdef'),
          from: trade.advertisement.type === 'sell' ? trade.user.address : currentUser.address,
          to: trade.advertisement.type === 'sell' ? currentUser.address : trade.user.address,
          txTime: Date.now(),
        }).save();
      })
      .then(() => {
        res.send({
          success: true,
          trade,
        })
      })
      .catch(error => {
        console.log(error.message);
        // TODO: document modification
        res.status(500).send({
          success: false,
          message: error.message || 'server side error',
          error
        })
      })
})

router.post('/set-payed', forceAuthorized, requireParam('id:objectId'), function (req, res, next) {
  let currentUser = req.data.user;
  let trade = null;
  Trade.findOne({_id: req.body.id})
      .populate('user')
      .populate('advertisement')
      .populate('messages')
      .populate({path: 'messages.sender', model: 'user'})
      .then(trd => {
        trade = trd;
        if(trade.status !== Trade.STATUS_START)
          throw {message: "Invalid trade status. only a started trade, can set to payed."};
        if(trade.advertisement.type === 'sell' && currentUser._id.toString() !== trade.user._id.toString())
          throw {message: "Access denied. only the trade owner can set the trade to payed"};
        if(trade.advertisement.type === 'buy' && currentUser._id.toString() !== trade.advertisement.user.toString())
          throw {message: "Access denied. only the advertisement owner can set the trade to payed"};
        trade.status = Trade.STATUS_PAYMENT;
        trade.paymentTime = Date.now();
        // trade.messages.push({
        //   sender: currentUser,
        //   type:Trade.MESSAGE_TYPE_TEXT,
        //   content: 'Owner accept and start the trade'
        // });
        return trade.save();
      })
      .then(() => {
        res.send({
          success: true,
          trade,
        })
      })
      .catch(error => {
        console.log(error.message);
        res.status(500).send({
          success: false,
          message: error.message || 'server side error',
          error
        })
      })
})

router.post('/release', forceAuthorized, requireParam('id:objectId'), function (req, res, next) {
  let currentUser = req.data.user;
  let trade = null;
  Trade.findOne({_id: req.body.id})
      .populate('user')
      .populate('advertisement')
      .populate('messages')
      .populate({path: 'messages.sender', model: 'user'})
      .then(trd => {
        trade = trd;
        if(trade.status !== Trade.STATUS_PAYMENT)
          throw {message: "Invalid trade status. only a payed trade, can release."};
        if(trade.advertisement.type === 'sell' && currentUser._id.toString() !== trade.advertisement.user.toString())
          throw {message: "Access denied. only the advertisement owner can release the tokens"};
        if(trade.advertisement.type === 'buy' && currentUser._id.toString() !== trade.user._id.toString())
          throw {message: "Access denied. only the trade creator can release tokens"};
        trade.status = Trade.STATUS_RELEASE;
        // trade.messages.push({
        //   sender: currentUser,
        //   type:Trade.MESSAGE_TYPE_TEXT,
        //   content: 'Owner accept and start the trade'
        // });
        return trade.save();
      })
      .then(() => {
        res.send({
          success: true,
          trade,
        })
      })
      .catch(error => {
        console.log(error.message);
        res.status(500).send({
          success: false,
          message: error.message || 'server side error',
          error
        })
      })
})

router.post('/cancel', forceAuthorized, requireParam('id:objectId'), function (req, res, next) {
  let currentUser = req.data.user;
  let trade = null;
  Trade.findOne({_id: req.body.id})
      .populate('user')
      .populate('advertisement')
      .populate('messages')
      .populate({path: 'messages.sender', model: 'user'})
      .then(trd => {
        trade = trd;
        if(trade.status !== Trade.STATUS_START && trade.status !== Trade.STATUS_PAYMENT)
          throw {message: "Invalid trade status. only a started/payed trades, can be canceled."};
        if(trade.advertisement.type === 'sell' && currentUser._id.toString() !== trade.user._id.toString())
          throw {message: "Access denied. only the trade creator can cancel the trade"};
        if(trade.advertisement.type === 'buy' && currentUser._id.toString() !== trade.advertisement.user.toString())
          throw {message: "Access denied. only the advertisement owner can cancel the trade"};
        trade.status = Trade.STATUS_CANCEL;
        // trade.messages.push({
        //   sender: currentUser,
        //   type:Trade.MESSAGE_TYPE_TEXT,
        //   content: 'Owner accept and start the trade'
        // });
        return trade.save();
      })
      .then(() => {
        res.send({
          success: true,
          trade,
        })
      })
      .catch(error => {
        console.log(error.message);
        res.status(500).send({
          success: false,
          message: error.message || 'server side error',
          error
        })
      })
})

router.post('/dispute', forceAuthorized, requireParam('id:objectId'), function (req, res, next) {
  let currentUser = req.data.user;
  let trade = null;
  Trade.findOne({_id: req.body.id})
      .populate('user')
      .populate('advertisement')
      .populate('messages')
      .populate({path: 'messages.sender', model: 'user'})
      .then(trd => {
        trade = trd;
        if(trade.status !== Trade.STATUS_PAYMENT)
          throw {message: "Invalid trade status. only a payed trade, can be disputed."};
        if(trade.advertisement.type === 'sell' && currentUser._id.toString() !== trade.user._id.toString())
          throw {message: "Access denied. only the trade creator can dispute"};
        if(trade.advertisement.type === 'buy' && currentUser._id.toString() !== trade.advertisement.user.toString())
          throw {message: "Access denied. only the advertisement owner can dispute"};
        trade.status = Trade.STATUS_DISPUTE;
        // trade.messages.push({
        //   sender: currentUser,
        //   type:Trade.MESSAGE_TYPE_TEXT,
        //   content: 'Owner accept and start the trade'
        // });
        return trade.save();
      })
      .then(() => {
        res.send({
          success: true,
          trade,
        })
      })
      .catch(error => {
        console.log(error.message);
        res.status(500).send({
          success: false,
          message: error.message || 'server side error',
          error
        })
      })
})

module.exports = router;