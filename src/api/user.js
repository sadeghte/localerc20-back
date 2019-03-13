import { Router } from 'express';
import User from '../database/mongooseModels/User';
import requireParam from '../middleware/requestParamRequire';
let router = Router();

router.all('/info', function (req, res, next) {
  res.json({
    success: true,
    user: req.data.user
  });
});

router.post('/check-username', requireParam('username:string'), function (req, res, next) {
  let username = req.body.username;
  if(username.length < 6){
    return res.json({
      success: false,
      message: "Username most be at least 6 characters."
    });
  }
  User.findOne({username: new RegExp(`^${username}$`,"i")})
      .then(user => {
        if(user){
          res.send({
            success: false,
            message: 'This username already taken'
          })
        }else{
          res.send({
            success: true,
            message: 'Username is available'
          })
        }
      })
      .catch(error => {
        res.status(500).send({
          success: false,
          message: 'server side error',
          error: error
        })
      })
})

export default router;