const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    name: String,
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);
module.exports = {
  Role: mongoose.model("Role", RoleSchema)
};
