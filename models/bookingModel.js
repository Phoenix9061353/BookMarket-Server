const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: [true, '一項交易的成立要有一本書'],
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, '一項交易的成立要有一位user'],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//middleware
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({ path: 'book', select: '-__v' });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
