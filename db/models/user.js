const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    gender: { type: String, default: '' },
    address: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    role: { type: String, default: "patient", enum: ["patient", "doctor", "admin"] },
    role_model: { type: String, enum: ["Patient", "Doctor", "Admin"] },
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model("User", UserSchema)
};
