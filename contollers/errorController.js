const AppError = require('../utils/appError');
////////////////////////////////////////////////////////////
//Funtion handle with different kinds of errors
//因為此處已經用passport來檢驗jwt，所以就不作相關的error handler
const handleDuplicateFieldsDB = (err) => {
  const message = `此${Object.keys(err.keyValue)[0]}目前已有人使用！`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `${errors.join(' ')}`;
  return new AppError(message, 400);
};

////////////////////////////////////////////////////////////
const sendErrorProd = (err, req, res) => {
  //A) API error
  if (req.originalUrl.startsWith('/bookapi')) {
    //Operational, trusted Error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //Programming or other unknown error: don't leak error details
    //1) Log the error
    console.error('Error!💥', err.name, err.message);
    //2) Send the general message to client
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // //render error page
  // if (err.isOperational) {
  //   //Send trust error msg to client and render the wedsite
  //   return res.status(err.statusCode).render('error', {
  //     title: 'Something went wrong!',
  //     msg: err.message,
  //   });
  // }
  // //Programming or other unknown error: don't leak error details
  // //1) Log the error
  // console.error('Error!💥', err.name, err.message);
  // //以下這塊為default
  // return res.status(err.statusCode).json({
  //   status: 'error',
  //   message: 'Something went very wrong!',
  // });
  //2) Send the general message to client
  // //Render the website
  // return res.status(err.statusCode).render('error', {
  //   title: 'Something went wrong!',
  //   msg: 'Please try again later',
  // });
};
////////////////////////////////////////////////////////////
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = Object.assign(err);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

  sendErrorProd(error, req, res);
};
