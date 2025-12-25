const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    status: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model("User", UserSchema)
};
