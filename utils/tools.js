exports.sendSuccessRes = (res, statusCode, data) => {
  return res.status(statusCode).json({
    status: 'success',
    data,
  });
};
