const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String},
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = {
  Patient: mongoose.model("Patient", PatientSchema)
};
