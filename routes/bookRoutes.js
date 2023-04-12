const express = require('express');

const { protect, restrictTo } = require('../contollers/authController');
const {
  getAllBook,
  getOneBook,
  getBooksByTypeOrName,
  getAuthorBooks,
  createBook,
  updateBook,
  deleteOneBook,
} = require('../contollers/bookController');
///////////////////////////////////////////
const router = express.Router();
router
  .route('/')
  .get(getAllBook)
  .post(protect, restrictTo('author'), createBook);

router.get(
  '/author-books',
  protect,
  restrictTo('author'),
  getAuthorBooks,
  getAllBook
);

router.get('/filterFind/:input', getBooksByTypeOrName, getAllBook);

router
  .route('/:id')
  .get(getOneBook)
  .patch(protect, restrictTo('author'), updateBook)
  .delete(protect, restrictTo('author'), deleteOneBook);

///////////////////////////////////////////
module.exports = router;
