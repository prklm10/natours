const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

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
// Update made by user
exports.updateMe = catchAsync(
  async (req, res, next) => {
    // Create error if user tries to update password
    if (
      req.body.password ||
      req.body.passwordConfirm
    ) {
      return next(
        new AppError(
          'This route is not for password update. Please use /updateMyPassword',
          401
        )
      );
    }
    //Update the document
    // We can't user user.save() beacuse we don't have confirm password
    // We don't want to pass req.body into update beacuse a user can change his role which is insecure
    const filterBody = filterObj(
      req.body,
      'name',
      'email'
    );
    const updatedUser =
      await User.findByIdAndUpdate(
        req.user.id,
        filterBody,
        { new: true, runValidators: true }
      );
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  }
);
// Update made by admin
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route have not been made yet',
  });
};

// Delete Current user

exports.deleteMe = catchAsync(
  async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
      active: false,
    });
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route have not been made yet',
  });
};
