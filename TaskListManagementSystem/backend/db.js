/**
 * MongoDB Database Connection
 * Connects to MongoDB Atlas using Mongoose
 */

const mongoose = require("mongoose");

/**
 * Connect to MongoDB Atlas
 * @returns {Promise} Connection promise
 */
const connectDB = async () => {
  try {
    // Modern Mongoose doesn't need useNewUrlParser or useUnifiedTopology
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
