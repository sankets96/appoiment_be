const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    role_model: { type: String, enum: ["Admin", "Patient","Doctor"], required: false }, 
    role_id: { type: mongoose.Schema.Types.ObjectId, refPath: "role_model" }, 
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);
module.exports = {
  User: mongoose.model("User", UserSchema)
};
