const express = require('express');
const { protect, restrictTo } = require('../contollers/authController');
const {
  getAllReviews,
  getUserReviews,
  createReview,
  checkedReview,
  updateReview,
  deleteReview,
} = require('../contollers/reviewController');

///////////////////////////////////////////////////////
const router = express.Router();

router.route('/').get(getAllReviews);
router.use(protect);
router.use(restrictTo('user'));
router.get('/user-reviews', getUserReviews, getAllReviews);
//根據輸入的bookId來創review
router
  .route('/:id')
  .post(checkedReview, createReview)
  .patch(updateReview)
  .delete(deleteReview);

module.exports = router;
