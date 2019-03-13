import { Router } from 'express';
import Token from '../../database/mongooseModels/Token'
import Currency from '../../database/mongooseModels/Currency'
import Country from '../../database/mongooseModels/Country'
import requireParam from '../../middleware/requestParamRequire';
let router = Router();

import initTokens from './init-tokens.json';
import initCurrencies from './init-currency.json';
import initCountries from './init-countries.json';

router.all('/', function (req, res, next) {
  // initTokens.map(token => {new Token(token).save();});
  initCountries.map(country => {new Country(country).save();});
  // initCurrencies.map(c => {
  //   if(!c.title)
  //     c.title = c.code;
  //   new Currency(c).save();
  // });
  res.send({
    success: true,
    message: 'feed successfully done.'
  })
});

export default router;