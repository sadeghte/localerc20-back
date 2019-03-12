import { Router } from 'express';
import Token from '../database/mongooseModels/Token'
import Currency from '../database/mongooseModels/Currency'
import requireParam from '../middleware/requestParamRequire';
let router = Router();

router.all('/tokens', function (req, res, next) {
  Token.find({})
      .then(tokens => {
        res.json({
          success: true,
          tokens
        });
      })
      .catch(error => {
        res.status(500).send({
          success: false,
          message: 'Server side error',
          error
        });
      })
});

router.all('/currencies', function (req, res, next) {
  Currency.find({})
      .then(currencies => {
        res.json({
          success: true,
          currencies
        });
      })
      .catch(error => {
        res.status(500).send({
          success: false,
          message: 'Server side error',
          error
        });
      })
});

export default router;