const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const { sendSuccessRes } = require('../utils/tools');
////////////////////////////////////////////////
//能限制req.body內最終被輸出的東西
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

//製作sign token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
////////////////////////////////////////////////
//Get all User data
exports.getAllUser = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find().populate('reviews'), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  //執行query
  const users = await features.query;

  const data = {
    result: users.length,
    users,
  };
  sendSuccessRes(res, 200, data);
});

//Get One User data
exports.getOneUser = catchAsync(async (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
    return next(new AppError(`Invalid ID: ${req.params.id}`, 400));
  const user = await User.findById(req.params.id).populate('reviews');
  if (!user) return next(new AppError('此使用者不存在！', 404));
  sendSuccessRes(res, 200, user);
});

//Update User(by user himself)
exports.updateUser = catchAsync(async (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
    return next(new AppError(`Invalid ID: ${req.params.id}`, 400));
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('此帳號不存在！', 404));
  if (!user._id.equals(req.user._id))
    return next(new AppError('只有帳號主人才可以更改他的資料！', 403));
  //限制只能改name, email(保險)
  const filterData = filterObj(req.body, 'name', 'email');
  const update = await User.findByIdAndUpdate(req.params.id, filterData, {
    new: true,
    runValidators: true,
  });
  const token = signToken(update._id);
  const data = {
    token: 'JWT ' + token,
    user: {
      _id: update._id,
      name: update.name,
      email: update.email,
      role: update.role,
    },
  };
  sendSuccessRes(res, 200, data);
});

//Delete User(by user himself)
exports.deleteUser = catchAsync(async (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
    return next(new AppError(`Invalid ID: ${req.params.id}`, 400));
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('此帳號不存在！', 404));
  if (!user._id.equals(req.user._id))
    return next(new AppError('只有帳號主人才可以刪除他的資料！', 403));
  await User.findByIdAndDelete(req.params.id);
  sendSuccessRes(res, 204, null);
});
