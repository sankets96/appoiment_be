const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    email: { type: String },
    phone: { type: String, default: '' },
    licenseNumber: { type: String, default: '' },
    experience: { type: String, default: '' },
    specialty: { type: String, default: '' },
    bio: { type: String, default: '' },
    fee: { type: Number, default: 500 },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    // Weekly availability: { Mon: ['09:00','10:00'], Tue: [...], ... }
    available: { type: Object, default: {} },
    // Confirmed appointment slots (denormalized for fast slot lookups).
    // Shape: [{ patientId, patientName, day, time, date, reason, createdAt }]
    bookedSlots: { type: Array, default: [] }
  },
  { timestamps: true }
);

module.exports = {
  Doctor: mongoose.model("Doctor", DoctorSchema)
};
