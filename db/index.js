const mongoose = require("mongoose");
const config = require("../config/prod.json");

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    await mongoose.connect(config.Database.URL);
    console.log(" MongoDB connected");
  } catch (err) {
    console.error(" MongoDB connection failed", err);
    process.exit(1);
  }
};

module.exports = connectDB;
