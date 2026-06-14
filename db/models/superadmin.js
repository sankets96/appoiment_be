const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    email: { type: String },
    phone: { type: String, default: '' },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = {
  Admin: mongoose.model("Admin", AdminSchema)
};
