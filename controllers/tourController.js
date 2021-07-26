const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getTour = catchAsync(
  async (req, res, next) => {
    const tour = await Tour.findById(
      req.params.id
    );
    if (!tour) {
      return next(
        new AppError('No Tour found', 404)
      );
    }

    // Tour.findOne({_id: req.params.id}) => Tour.findById(req.params.id)

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  }
);

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = '-ratingsAverage price';
  req.query.limit = '5';
  req.query.fields =
    'name difficulty price ratingsAverage ';
  next();
};

exports.getAllTours = catchAsync(
  async (req, res, next) => {
    console.log(req.query);

    // Return a query

    const features = new APIFeatures(
      Tour.find(),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    // Send Response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        // Before es6 tours: tours  can be written to
        //tours: tours
        //after es6
        tours,
      },
    });
  }
);
exports.createTour = catchAsync(
  async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  }
);

exports.updateTour = catchAsync(
  async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!tour) {
      return next(
        new AppError('No Tour found', 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  }
);
exports.deleteTour = catchAsync(
  async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(
      req.params.id
    );
    if (!tour) {
      return next(
        new AppError('No Tour found', 404)
      );
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

// Aggregation
exports.getTourStats = catchAsync(
  async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          avgRating: { $avg: '$ratingsAverage' },
          numRatings: {
            $sum: '$ratingsQuantity',
          },
          totalTours: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: {
          avgPrice: 1,
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  }
);

// get monthly tours
exports.getMonthlyPlan = catchAsync(
  async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          push: { $push: '$name' },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numTourStarts: -1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  }
);
///
