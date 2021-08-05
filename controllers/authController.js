const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const catchAsync = require('../utils/catchAsync');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
const createAndSendToken = (
  user,
  statusCode,
  res
) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(
  async (req, res, next) => {
    const newUser = await User.create(req.body);
    createAndSendToken(newUser, 201, res);
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
    // console.log(user);

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
    createAndSendToken(user, 200, res);
  }
);

exports.protect = catchAsync(
  async (req, res, next) => {
    // 1) Get Token and check if it is present
    let token = '';
    console.log(req.headers.authorization);
    if (
      req.headers.authorization ||
      req.headers.authorization.startsWith(
        'Bearer'
      )
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
    const currentUser = await User.findById(
      decoded.id
    );
    if (!currentUser) {
      return next(
        new AppError(`User does't exit`, 401)
      );
    }
    // 4) check if user Changed password after the token was issued
    if (
      currentUser.changePasswordAfter(decoded.iat)
    ) {
      return next(
        new AppError(
          'User recently changed password! Please login again',
          401
        )
      );
    }

    req.user = currentUser;
    // if we want to pass information middleware to middleware.  We do it in req body;

    next();
  }
);

// Restriction to perform operations
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles is an array
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          `You don't have permission to perform this action`,
          403
        )
      );
    next();
  };

// Forgot Password
exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    // Get user by email
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      return next(
        new AppError(
          'There is no user with this email! ',
          404
        )
      );
    }
    // Generate a random token
    const resetToken =
      user.createPasswordResetToken();

    await user.save({
      validateBeforeSave: false,
    });

    // Send to user

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}}`;
    const message = `Forgot your password? Submit a PATCH request 
    with your new password and confirm your password to ${resetURL}
    .If you didn't forget your password. Please ignore this email!`;
    try {
      await sendEmail({
        email: user.email,
        subject:
          'Your password reset token (valid for 10 min)',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({
        validateBeforeSave: false,
      });
      return next(
        new AppError(
          'There was no error sending the email. Try again later',
          500
        )
      );
    }
  }
);

exports.resetPassword = catchAsync(
  async (req, res, next) => {
    // 1 Get user based on token,
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2. If token has not expired, and there  is user, set new password
    if (!user) {
      return next(
        new AppError(
          'Invalid or expired Token',
          400
        )
      );
    }
    // 3 Update changed Password Property for user,
    console.log(req.body);
    user.password = req.body.password;
    user.passwordConfirm =
      req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // 4 Log the user in and send JWT.
    await user.save();
    createAndSendToken(user, 200, res);
  }
);

// update Password

exports.updatePassword = catchAsync(
  async (req, res, next) => {
    const user = await User.findById(
      req.user.id
    ).select('+password');

    if (
      !(await user.correctPassword(
        req.body.passwordCurrent,
        user.password
      ))
    ) {
      return next(
        new AppError(
          'Your Current Password is wrong.',
          401
        )
      );
    }
    user.password = req.body.password;
    user.passwordConfirm =
      req.body.passwordConfirm;
    await user.save();
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  }
);
