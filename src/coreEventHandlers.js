const EventBus = require('./eventBus');
const User = require('./database/mongooseModels/User')

EventBus.on('transaction-post-save', function(tx){
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