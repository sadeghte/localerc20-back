import { Router } from 'express';
import User from '../database/mongooseModels/User';
import requireParam from '../middleware/requestParamRequire';
let router = Router();

function checkUsernameAvailable(username){
  if(username.length < 6){
    return Promise.reject({message: "Username most be at least 6 characters."});
  }
  return User.findOne({username: new RegExp(`^${username}$`,"i")})
      .then(user => {
        if(user)
          throw {message: 'This username already taken'}
      })
}

function checkEmailAvailable(email){
  return User.findOne({email: new RegExp(`^${email}$`,"i")})
      .then(user => {
        if(user)
          throw {message: 'This email already registered'}
      })
}

router.all('/info', function (req, res, next) {
  res.json({
    success: true,
    user: req.data.user
  });
});

router.post('/check-username', requireParam('username:string'), function (req, res, next) {
  let username = req.body.username;
  checkUsernameAvailable(username)
      .then(() => {
        res.send({
          success: true,
          message: 'Username is available'
        })
      })
      .catch(error => {
        res.send({
          success: false,
          message: error.message || 'server side error',
          error: error
        })
      })
})

router.post('/update-username', requireParam('username:string'), function (req, res, next) {
  let username = req.body.username;
  checkUsernameAvailable(username)
      .then(() => {
        let user = req.data.user;
        user.username = username;
        return user.save();
      })
      .then(() => {
        res.send({
          success: true,
          message: 'Username updated successfully'
        })
      })
      .catch(error => {
        res.send({
          success: false,
          message: error.message || 'server side error',
          error: error
        })
      })
})

router.post('/check-email', requireParam('email:email'), function (req, res, next) {
  let email = req.body.email;
  checkEmailAvailable(email)
      .then(() => {
        res.send({
          success: true,
          message: 'Email is not registered'
        })
      })
      .catch(error => {
        res.send({
          success: false,
          message: error.message || 'server side error',
          error: error
        })
      })
})

router.post('/update-email', requireParam('email:email'), function (req, res, next) {
  let email = req.body.email;
  checkEmailAvailable(email)
      .then(() => {
        let user = req.data.user;
        user.email = email;
        return user.save();
      })
      .then(() => {
        res.send({
          success: true,
          message: 'Email updated successfully'
        })
      })
      .catch(error => {
        res.send({
          success: false,
          message: error.message || 'server side error',
          error: error
        })
      })
})

router.post('/update', function (req, res, next) {
  let user = req.data.user;
  let update = {};
  if(req.body.firstName !== undefined && typeof req.body.firstName === 'string')
    update.firstName = req.body.firstName;
  if(req.body.lastName !== undefined && typeof req.body.lastName === 'string')
    update.lastName = req.body.lastName;
  if(req.body.country !== undefined && typeof req.body.country === 'string')
    update.country = req.body.country;
  if(req.body.mobile !== undefined && typeof req.body.mobile === 'string') {
    update.mobile = req.body.mobile;
    update.mobileConfirmed = false;
  }
  Object.keys(update).map(key => {user[key] = update[key]});
  user.save();
  res.send({
    success: true,
    message: 'User data updated',
    updatedFields: update
  })
  // let user = req.data.user;
  // return user.save();
})


export default router;