const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(
      req.params.id
    );
    // Tour.findOne({_id: req.params.id}) => Tour.findById(req.params.id)

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = '-ratingsAverage price';
  req.query.limit = '5';
  req.query.fields =
    'name difficulty price ratingsAverage ';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
exports.createTour = async (req, res) => {
  // console.log(req.body);
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Aggregation
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          $count: 'Total Ratings',
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
///
