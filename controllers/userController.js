const User = require('../models/userModel');
//const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllUser = catchAsync(
  async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  }
);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route have not been made yet',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route have not been made yet',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route have not been made yet',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route have not been made yet',
  });
};
