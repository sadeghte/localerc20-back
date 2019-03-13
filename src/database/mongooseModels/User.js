const mongoose = require('mongoose');
const jsonwebtoken = require('jsonwebtoken');

let userSchema = mongoose.Schema({
  username: {type:String, default: "", trim: true, unique: true},
  firstName: {type:String, default: "", trim: true},
  lastName: {type:String, default: "", trim: true},
  avatar: {type:String, default: ''},
  brightIdPublicKey: String,
  brightIdScore: {type: Number, default: 0},
  email: {type:String, default: "", trim: true},
  mobile: String
}, {
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

userSchema.methods.createSessionToken = function () {
  const sessionToken = jsonwebtoken.sign(
      {
        id: this._id,
        timestamp: Date.now(),
      },
      process.env.JWT_AUTH_SECRET
  );
  return sessionToken;
};

const User = module.exports = mongoose.model('user', userSchema);