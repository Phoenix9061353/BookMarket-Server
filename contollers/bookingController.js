const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');
const { sendSuccessRes } = require('../utils/tools');

/////////////////////////////////////////////////////////
//Middleware
//Get All Bookings(one user)
exports.getUserBookings = (req, res, next) => {
  req.query.user = req.user.id;
  next();
};
/////////////////////////////////////////////////////////
//Get All Bookings
exports.getAllBookings = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Booking.find(), req.query)
    .sort()
    .filter()
    .limitFields()
    .paginate();

  const bookings = await features.query;
  const data = {
    result: bookings.length,
    bookings,
  };
  sendSuccessRes(res, 200, data);
});

//Get One Booking
exports.getBooking = catchAsync(async (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
    return next(new AppError(`Invalid ID: ${req.params.id}`, 400));
  const book = await Booking.findById(req.params.id);
  sendSuccessRes(res, 200, book);
});

//Create One Booking(記得restrictTo 'user')
exports.createOneBooking = catchAsync(async (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
    return next(new AppError(`Invalid ID: ${req.params.id}`, 400));
  const booking = await Booking.create({
    book: req.params.id,
    user: req.user._id,
  });
  sendSuccessRes(res, 201, booking);
});
//Delete One Booking

//Checked if Booked or Not
exports.checkBooked = catchAsync(async (req, res, next) => {
  const booking = await Booking.find({
    book: req.params.id,
    user: req.user._id,
  });
  if (booking.length !== 0) return sendSuccessRes(res, 200, { message: 'Yes' });
  sendSuccessRes(res, 200, { message: 'No' });
});
