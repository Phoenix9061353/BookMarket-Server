const Book = require('../models/bookModels');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const { sendSuccessRes } = require('../utils/tools');

////////////////////////////////////////////////
//Middleware
//讓作家取得他上架過的書籍們
exports.getAuthorBooks = (req, res, next) => {
  req.query.author = req.user.id;
  next();
};

//用書籍種類或名字來找書
exports.getBooksByTypeOrName = (req, res, next) => {
  const typeArr = ['懸疑', '科幻', '戀愛', '恐怖', '日常', '其他'];
  if (!req.params.input) return next(new AppError('請輸入查詢內容！', 400));
  if (!typeArr.find((el) => el === req.params.input))
    req.query.name = req.params.input;
  else req.query.type = req.params.input;
  next();
};

// //用作者名字找書
// exports.getBooksByAuthorName = (req, res, next) => {
//   if (!req.params.input) return next(new AppError('請輸入查詢內容！', 400));

// }
////////////////////////////////////////////////
//Get All Book
exports.getAllBook = catchAsync(async (req, res, next) => {
  //設置query
  const features = new APIFeatures(Book.find().populate('reviews'), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  //執行query
  const books = await features.query;
  const data = {
    result: books.length,
    books,
  };
  sendSuccessRes(res, 200, data);
});

//Get One book
exports.getOneBook = catchAsync(async (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
    return next(new AppError(`Invalid ID: ${req.params.id}`, 400));
  const book = await Book.findById(req.params.id);
  if (!book) return next(new AppError('此書已不存在！', 404));
  sendSuccessRes(res, 200, book);
});

//create one book
exports.createBook = catchAsync(async (req, res, next) => {
  const newBook = await Book.create({
    name: req.body.name,
    type: req.body.type,
    summary: req.body.summary,
    description: req.body.description ? req.body.description : '',
    price: req.body.price,
    author: req.user._id,
  });
  sendSuccessRes(res, 201, newBook);
});

//update one book(by its author)
exports.updateBook = catchAsync(async (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
    return next(new AppError(`Invalid ID: ${req.params.id}`, 400));

  const book = await Book.findById(req.params.id);
  if (!book) return next(new AppError('這本書不存在！', 404));
  if (!book.author.equals(req.user._id))
    return next(new AppError('只有此書的作者可編輯此書', 403));
  const newBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  sendSuccessRes(res, 200, newBook);
});

//delete one book(by its author)
exports.deleteOneBook = catchAsync(async (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
    return next(new AppError(`Invalid ID: ${req.params.id}`, 400));
  const book = await Book.findById(req.params.id);
  if (!book) return next(new AppError('此書不存在！', 404));
  if (!book.author.equals(req.user._id))
    return next(new AppError('只有此書的作者可刪除此書', 403));
  await Book.findByIdAndDelete(req.params.id);
  sendSuccessRes(res, 204, null);
});
