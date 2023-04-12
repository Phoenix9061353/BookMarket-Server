const express = require('express');

const {
  signup,
  login,
  protect,
  updatePassword,
} = require('../contollers/authController');
//////////////////////////////////////

//////////////////////////////////////
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

module.exports = router;
