const EventBus = require('./eventBus');
const User = require('./database/mongooseModels/User')
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