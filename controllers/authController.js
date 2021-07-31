const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsync(
  async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt:
        req.body.passwordChangedAt, // temp
    });
    const token = signToken(newUser._id);
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  }
);

exports.login = catchAsync(
  async (req, res, next) => {
    const { email, password } = req.body;

    // check if email and password actually exist
    if (!email || !password) {
      return next(
        new AppError(
          'Please provide email and password!',
          400
        )
      );
    }
    // 2 check if user exit
    const user = await User.findOne({
      email,
    }).select('+password'); // We need + sign to selct those field whose select is false
    console.log(user);

    if (
      !user ||
      !(await user.correctPassword(
        password,
        user.password
      ))
    ) {
      return next(
        new AppError(
          'Email or password Incorrect',
          401
        )
      );
    }

    // 3 If everything is okay then sends token to the client
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  }
);

exports.protect = catchAsync(
  async (req, res, next) => {
    // 1) Get Token and check if it is present
    let token = '';
    if (
      (req.headers.authorization,
      req.headers.authorization.startsWith(
        'Bearer'
      ))
    ) {
      token =
        req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next(
        new AppError(
          'You are not logged in! Please Login.',
          401
        )
      );
    }
    // 2) Validate Token
    //console.log(token);
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    // console.log(decoded);
    // 3) Check if user still exits
    const freshUser = await User.findById(
      decoded.id
    );
    if (!freshUser) {
      return next(
        new AppError(`User does't exit`, 401)
      );
    }
    // 4) check if user Changed password after the token was issued
    if (
      freshUser.changePasswordAfter(decoded.iat)
    ) {
      return next(
        new AppError(
          'User recently changed password! Please login again',
          401
        )
      );
    }
    next();
  }
);
