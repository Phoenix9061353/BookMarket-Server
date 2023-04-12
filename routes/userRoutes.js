const express = require('express');

const { protect, updatePassword } = require('../contollers/authController');
const {
  getAllUser,
  getOneUser,
  updateUser,
  deleteUser,
} = require('../contollers/userController');
//////////////////////////////////////////
const router = express.Router();

//在實際應該也要位於protect下
router.route('/').get(getAllUser);
router.use(protect);
router.patch('/updateMyPass', updatePassword);
router.route('/:id').get(getOneUser).patch(updateUser).delete(deleteUser);
//////////////////////////////////////////
module.exports = router;
