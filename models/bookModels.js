const mongoose = require('mongoose');

/////////////////////////////////////////
const bookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minLength: [3, '書名需至少三個字元以上'],
      required: [true, '請輸入書名'],
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, '一本書必須有作者'],
    },
    type: {
      type: String,
      enum: {
        values: ['懸疑', '科幻', '戀愛', '恐怖', '日常', '其他'],
        message:
          "種類須為['懸疑', '科幻', '戀愛', '恐怖', '日常', '其他']的其中之一",
      },
      default: '日常',
      required: [true, '請輸入此書的種類'],
    },
    summary: {
      type: String,
      trim: true,
      maxLength: [30, '簡介限制不可超過30字'],
      required: [true, '請簡單介紹一下此書的內容'],
    },
    description: {
      type: String,
      maxLength: 150,
    },
    price: {
      type: Number,
      min: [0, '價錢不可為負數！'],
      max: [9999, '價錢不接受10000以上的定價'],
      required: [true, '請為此書訂價格'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, '評價必須為1.0以上的值'],
      max: [5, '評價必須為5.0以下的值'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
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

/////////////////////////////////////////
//hooks
bookSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'author',
    select: '-__v -passwordChangeAt -role -email',
  });
  next();
});

//Virtual populate
bookSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'book',
  localField: '_id',
});
/////////////////////////////////////////
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
