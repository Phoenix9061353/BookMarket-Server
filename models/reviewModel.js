const mongoose = require('mongoose');
const Book = require('../models/bookModels');

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, '一本書一定會有書名！'],
    },
    review: {
      type: String,
      trim: true,
      maxLength: 150,
      required: [true, '心得內文不可以是空白的！'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    book: {
      type: mongoose.Schema.ObjectId,
      ref: 'Book',
      required: [true, '心得必須要與一本書有關！'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, '心得必須要由一名讀者撰寫！'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

///////////////////////////////////////////////////////
//Index
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

//Hook
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  this.select('-__v');
  next();
});

//計算rating
reviewSchema.statics.calcAverageRatings = async function (bookId) {
  const stats = await this.aggregate([
    {
      $match: { book: bookId },
    },
    {
      $group: {
        _id: '$book',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Book.findByIdAndUpdate(bookId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

//Post Hook
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.book);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.book);
  }
});

///////////////////////////////////////////////////////
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
