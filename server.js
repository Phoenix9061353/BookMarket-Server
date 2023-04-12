const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });
/////////////////////////////////////////////
const app = require('./app');
/////////////////////////////////////////////
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
(async function connectDB() {
  try {
    await mongoose.connect(DB);
    console.log('DB connection successFul!');
  } catch (err) {
    console.log('UNHANDLED REJECTION!💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => process.exit(1));
  }
})();

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

/////////////////////////////////////////////
