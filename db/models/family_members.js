const mongoose = require("mongoose");

const FamilyMembertSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    relation: { type: String, required: true },
    phone: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    bloodGroup: { type: String, required: true },
    gender: { type: String, default: '' },
    status: { type: Boolean, default: true },
    remark: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = {
  FamilyMember: mongoose.model("FamilyMembertSchema", FamilyMembertSchema)
};