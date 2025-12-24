const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model("User", UserSchema)
};
