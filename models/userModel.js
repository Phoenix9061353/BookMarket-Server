const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

/////////////////////////////////////////////
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, '請輸入您的名字！'],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, '請提供您的email！'],
      validate: [validator.isEmail, '無效的email!'],
    },
    role: {
      type: String,
      enum: {
        values: ['author', 'user'],
        message: "身份須為['author', 'user']的其中之一",
      },
      default: 'user',
    },
    password: {
      type: String,
      minLength: [8, '密碼長度至少需八字元以上'],
      select: false,
      required: [true, '請設定您的密碼！'],
    },
    passwordConfirm: {
      type: String,
      required: [true, '請確認您的密碼！'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: '密碼確認與上列輸入的密碼不相符！',
      },
    },
    passwordChangeAt: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//////////////////////////////////////////
//hooks
//hash pasword
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

//find select
userSchema.pre(/^find/, function (next) {
  this.select('-__v');
  next();
});

//if password changed, change the passwordChangeAt date
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

//Virtual populate
userSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'user',
  localField: '_id',
});
//////////////////////////////////////////
//methods
//比對密碼
userSchema.methods.comparePassword = async (incomePass, userPass) => {
  return await bcrypt.compare(incomePass, userPass);
};
//////////////////////////////////////////
const User = mongoose.model('User', userSchema);

module.exports = User;
