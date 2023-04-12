const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendSuccessRes } = require('../utils/tools');

///////////////////////////////////////////////////////
//Middleware
exports.checkedReview = catchAsync(async (req, res, next) => {
  const review = await Review.find({ book: req.params.id, user: req.user._id });
  if (review.length !== 0) return sendSuccessRes(res, 200, { message: 'Yes' });
  next();
});

exports.getUserReviews = (req, res, next) => {
  req.query.user = req.user.id;
  next();
};
///////////////////////////////////////////////////////
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Review.find(), req.query)
    .sort()
    .filter()
    .limitFields()
    .paginate();
  const reviews = await features.query;

  sendSuccessRes(res, 200, { results: reviews.length, reviews });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
    return next(new AppError(`Invalid ID: ${req.params.id}`, 400));
  const booking = await Booking.findOne({
    book: req.params.id,
    user: req.user._id,
  });
  if (!booking) return next(new AppError('未購買此書，無法對其做評論！', 401));
  if (!req.body.book) req.body.book = req.params.id;
  if (!req.body.user) req.body.user = req.user._id;
  const newReview = await Review.create(req.body);

  sendSuccessRes(res, 201, { review: newReview });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
    return next(new AppError(`Invalid ID: ${req.params.id}`, 400));

  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('此評論不存在！', 404));
  if (!review.user.equals(req.user._id))
    return next(new AppError('只有撰寫此評論的讀者可編輯此評論！', 403));

  const update = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  sendSuccessRes(res, 200, { review: update });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
    return next(new AppError(`Invalid ID: ${req.params.id}`, 400));

  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('此評論不存在！', 404));
  if (!review.user.equals(req.user._id))
    return next(new AppError('只有撰寫此評論的讀者可刪除此評論！', 403));
  await Review.findByIdAndDelete(req.params.id);
  sendSuccessRes(res, 204, null);
});
