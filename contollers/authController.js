const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
//////////////////////////////////////////////
//使用passport
require('../config/passport')(passport);

//製作sign token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
//////////////////////////////////////////////
//Middleware
//protect
exports.protect = passport.authenticate('jwt', { session: false });

//restrict
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
//////////////////////////////////////////////
//Signup
exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role ? req.body.role : 'user',
    passwordChangeAt: undefined,
  });
  const token = signToken(user._id);
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  res.status(201).json({
    status: 'success',
    message: '帳號創立成功',
    data: {
      token: 'JWT ' + token,
      user: userData,
    },
  });
});

//Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('請輸入你的email和密碼!', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Email或密碼錯誤!', 401));
  }
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    message: '登入成功！',
    data: {
      token: 'JWT ' + token,
      user: userData,
    },
  });
});

//改密碼（使用者登入的情況下）
exports.updatePassword = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user._id).select('+password');
  const { oldPass, newPass } = req.body;
  //check pass confirm
  if (!(await currentUser.comparePassword(oldPass, currentUser.password)))
    return next(new AppError('舊密碼不同！請再試一次！', 401));
  //通過，更改密碼（還是會跑passconfirm validation）
  currentUser.password = newPass;
  currentUser.passwordConfirm = req.body.newPassConfirm;
  await currentUser.save();

  const token = signToken(currentUser._id);
  const userData = {
    _id: currentUser._id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
  };

  res.status(200).json({
    status: 'success',
    message: '密碼更改成功',
    data: {
      token: 'JWT ' + token,
      user: userData,
    },
  });
});
