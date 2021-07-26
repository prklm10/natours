const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [
        40,
        'A tour Length must be less than or equal to 40 characters',
      ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [
        true,
        'A Tour must have a duration',
      ],
    },
    maxGroupSize: {
      type: Number,
      required: [
        true,
        'A Tour must have  maxGroupSize',
      ],
    },
    difficulty: {
      type: String,
      required: [
        true,
        'A Tour must have difficulty',
      ],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty must be either: easy,medium or difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'Rating must be greter than 1 '],
      max: [5, 'Rating must be less than 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [
        true,
        'A Tour must have a price',
      ],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message:
          'Discount price {VALUE} should be lower than actual price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [
        true,
        'A Tour must have a summary',
      ],
    },
    discription: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [
        true,
        'A Tour must have a imageCover',
      ],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema
  .virtual('durationWeeks')
  .get(function () {
    return this.duration / 7;
  });
// Document middleware: works before save(),create()
// pre save hook/middleware
tourSchema.pre('save', function (next) {
  //console.log(this) // this has access to all the document before save
  this.slug = slugify(this.name, {
    lower: true,
  });
  next(); // to call next middleware
});
// Query Middleware //pre FIND or post FIND
// Before query is executed
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.startDates = Date.now();
  next();
});

// after query is executed
tourSchema.post(/^find/, function (doc, next) {
  console.log(
    `Time taken is: ${
      Date.now() - this.startDates
    } millisecond`
  );
  next();
});

// Aggregation middleware
tourSchema.pre('aggregate', function (next) {
  //console.log(this.pipeline());
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  //console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
