const express = require('express');
const { protect, restrictTo } = require('../contollers/authController');
const {
  getAllBookings,
  getBooking,
  getUserBookings,
  createOneBooking,
  checkBooked,
} = require('../contollers/bookingController');

const router = express.Router();

router.route('/').get(getAllBookings);

router.get(
  '/user-books',
  protect,
  restrictTo('user'),
  getUserBookings,
  getAllBookings
);

router.route('/check/:id').get(protect, restrictTo('user'), checkBooked);

router
  .route('/:id')
  .get(getBooking)
  .post(protect, restrictTo('user'), createOneBooking);

module.exports = router;
