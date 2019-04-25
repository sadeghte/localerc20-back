const EventBus = require('./eventBus');
const User = require('./database/mongooseModels/User')
const Trade = require('./database/mongooseModels/Trade');
const Feedback = require('./database/mongooseModels/Feedback')

EventBus.on(EventBus.EVENT_TRANSACTION_POST_SAVE, function(tx){
  let tUsers;
  User.find({$or:[
    {address: tx.from},
    {address: tx.to}
  ]})
      .then(users => {
        tUsers = users;
        return tUsers[0].updateTokenAdvertisements(tx.token);
      })
      .then(() => {
        return tUsers[1] ? tUsers[1].updateTokenAdvertisements(tx.token) : true;
      })
      .then(() => {
        console.log(`Transaction(${tx._id}): users advertisement updated`);
      })
      .catch(error => {
        console.log(`Transaction(${tx._id}): error in advertisement update`, error);
      })
})

EventBus.on(EventBus.EVENT_TRADE_POST_FEEDBACK, function(feedback){
  let tUsers;
  let userID = feedback.user._id || feedback.user;
  let userScore = 0;
  Feedback.find({user: userID})
      .then(allFeedback => {
        let totalScore = 0;
        if(allFeedback.length > 0) {
          for (let i = 0; i < allFeedback.length; i++) {
            totalScore += allFeedback[i].star;
          }
          return totalScore / allFeedback.length;
        }else{
          return 0;
        }
      })
      .then(feedbackScore => {
        userScore = parseInt(feedbackScore * 10) / 10;
        return User.findOne({_id: userID})
      })
      .then(user => {
        user.score = userScore;
        return user.save();
      })
      .then(() => {
        console.log(`Feedback(${feedback._id}): users score updated`);
      })
      .catch(error => {
        console.log(`Feedback(${feedback._id}): error in user score update`, error);
      })
})

EventBus.on(EventBus.EVENT_TRADE_POST_SAVE, function(trade){
  let userId1 = trade.user._id || trade.user;
  let userId2 = trade.advertisementOwner._id || trade.advertisementOwner;
  Trade.find({$or: [
      {user: userId1},
      {advertisementOwner: userId1},
  ]})
      .then(trades => {
        return User.update({_id: userId1}, {confirmedTrades: trades.length});
      })
      .then(() => {
        console.log(`Trade:[${trade._id}]: User(${userId1})> confirmedTrades updated.`);
        return Trade.find({$or: [
          {user: userId2},
          {advertisementOwner: userId2},
        ]})
      })
      .then(trades => {
        return User.update({_id: userId2}, {confirmedTrades: trades.length});
      })
      .then(() => {
        console.log(`Trade:[${trade._id}]: User(${userId2})> confirmedTrades updated.`);
      })
      .catch(error => {
        console.log(`Trade:[${trade._id}]: Users.confirmedTrades update failed.`, error);
      })
})