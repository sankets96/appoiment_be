const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String},
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = {
  Doctor: mongoose.model("Doctor", DoctorSchema)
};
