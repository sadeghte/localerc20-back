const { Router } = require('express');
const Advertisement = require('../database/mongooseModels/Advertisement');
const {forceAuthorized} = require('../middleware/Authenticate');
const Token = require('../database/mongooseModels/Token');
const PaymentMethod = require('../database/mongooseModels/PaymentMethod');
const Currency = require('../database/mongooseModels/Currency');
const requireParam = require('../middleware/requestParamRequire');
let router = Router();
let allTokens = [];
Token.find({}).then(tokens => {allTokens = tokens;});

function validateNewAdvertisement(adv) {
  let timeWindowRegx = /^\d{2}:\d{2}$/;
  let errors = [];
  if(adv.type !== 'sell' && adv.type !== 'but')
    errors.push('Invalid advertisement type. Type most be sell or buy.');
  if(!Token.validateCode(adv.token))
    errors.push('Invalid token');
  if(!PaymentMethod.validateMethod(adv.paymentMethod))
    errors.push('Invalid payment method');
  if(!Currency.validateCode(adv.currency))
    errors.push('Invalid currency');
  if(adv.amount == "" || parseInt(adv.amount) <= 0)
    errors.push('Invalid amount');
  if(adv.limitMin == "" || parseInt(adv.limitMin) <= 0)
    errors.push('Invalid limit min');
  if(adv.limitMax == "" || parseInt(adv.limitMax) <= 0)
    errors.push('Invalid limit max');
  if(! timeWindowRegx.test(adv.paymentWindow))
    errors.push('Invalid payment window time');
  if(adv.openingHours.length != 7){
    errors.push('select opening hours for all days');
  }else{
    for(let i=0 ; i<7 ; i++){
      if(adv.openingHours[i].enable){
        if(! timeWindowRegx.test(adv.openingHours[i].start) || !timeWindowRegx.test(adv.openingHours[i].end))
          errors.push(`Incorrect opening hours for day [${i}]`);
      }
    }
  }
  if(typeof adv.terms !== 'string' || adv.terms.length <= 0)
    errors.push('Invalid terms of trade');

  return errors;
}

router.post('/new', forceAuthorized, requireParam('advertisement'), function (req, res, next) {
  let advertisement = req.body.advertisement;
  advertisement.user = req.data.user;
  let errors = validateNewAdvertisement(advertisement);
  if (errors.length > 0) {
    return res.json({success: false, errors});
  }
  advertisement.token = Token.findByCode(advertisement.token);
  advertisement.currency = Currency.findByCode(advertisement.currency);
  advertisement.openingHours = advertisement.openingHours.map(item => {
    if(item.enable)
      return item;
    else {
      return {enable: false, start: '00:00', end: '00:00'};
    }
  })
  new Advertisement(advertisement)
      .save()
      .then(() => {
        res.send({
          success: true
        });
      })
      .catch(error => {
        res.status(500).send({
          success: false,
          message: error.message || 'some error happens on document save',
          error
        })
      })
});

module.exports = router;