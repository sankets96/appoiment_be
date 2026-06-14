const mongoose = require("mongoose");

const DoctorRequestSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    name: String,
    email: String,
    phone: String,
    licenseNumber: String,
    experience: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    remark: { type: String, default: '' },
    requestedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = {
  DoctorRequest: mongoose.model("DoctorRequest", DoctorRequestSchema)
};