const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String},
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = {
  Admin: mongoose.model("Admin", AdminSchema)
};
