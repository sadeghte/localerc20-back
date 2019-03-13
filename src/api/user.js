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


export default router;