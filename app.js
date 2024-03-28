require('dotenv').config();
const express = require("express");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');
const app = express();
const authRoutes = require("./routes/auth");
const tasksRoutes = require("./routes/tasksRouters");
const categorieRoutes = require("./routes/categoryRoutes");
const mongoose = require('mongoose');
const logger = require('./logger');

// Enable CORS
app.use(cors());

// Enable compression
app.use(compression());

// Use Helmet for setting various HTTP headers
app.use(helmet());

// Use winston for logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());
app.use("/users", authRoutes);
app.use("/tasks", tasksRoutes);
app.use("/categories", categorieRoutes);

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 3000;

//Listening to the server on port 3000
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info('Attempting to connect to database...');

  // Connect to the database
  mongoose.connect(process.env.DB_URI).then(function(){
    logger.info('DB Connection Success...');
  }, function(err) {
    logger.error(err);
  });
  
});

module.exports = app;