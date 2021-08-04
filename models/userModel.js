const crypto = require('crypto');
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
  role: {
    type: String,
    enum: [
      'user',
      'guide',
      'lead-guide',
      'admin',
    ],
    default: 'user',
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
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// PRE document middleware

// password changed at

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew)
    return next();

  this.passwordChangedAt = Date.now() - 1000; // sometimes jwt is issued before we changed our password as it is
  next();
});

userSchema.pre('save', async function (next) {
  console.log('asdasd');
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

userSchema.methods.createPasswordResetToken =
  function () {
    const resetToken = crypto
      .randomBytes(32)
      .toString('hex');
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    console.log(
      { resetToken },
      this.passwordResetToken
    );
    this.passwordResetExpires =
      Date.now() + 10 * 60 * 1000;

    return resetToken;
  };

const User = mongoose.model('Users', userSchema);
module.exports = User;
