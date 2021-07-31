const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: ['true', 'Please enter your name'],
  },
  email: {
    type: String,
    required: ['true', 'Please enter your email'],
    unique: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [
      true,
      'Please enter your password',
    ],
    minLength: [
      8,
      'Length of password must be greater than or equal to 8 characters ',
    ],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [
      true,
      'Please confirm your password ',
    ],
    // only work on CREATE and SAVE not on UPDATE IMPORTANT
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same',
    },
  },
  photo: {
    type: String,
  },
  passwordChangedAt: Date,
});

// PRE document middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Hash this password at cost 12;
  this.password = await bcrypt.hash(
    this.password,
    12
  );
  // Delete confirm password
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword =
  async function (
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(
      candidatePassword,
      userPassword
    );
  };
userSchema.methods.changePasswordAfter =
  function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
      const changedTime = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      // console.log(changedTime, JWTTimeStamp);
      return JWTTimeStamp < changedTime;
      // False means no change
    }
    return false;
  };
const User = mongoose.model('Users', userSchema);
module.exports = User;
