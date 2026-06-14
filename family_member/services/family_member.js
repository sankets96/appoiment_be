const { FamilyMember } = require("../../db/models/family_members.js");
const mongoose = require("mongoose");

const add = async (info) => {
  return await new FamilyMember(info).save();
};

const get = async (params = {}) => {
  const { condition = {}, projection = {}, options = {} } = params;
  return await FamilyMember.findOne(condition, projection, options);
};

const getAll = async (params = {}) => {
  const { condition = {}, projection = {}, options = {} } = params;
  return await FamilyMember.find(condition, projection, options);
};

const update = async (id, updates) => {
  return await FamilyMember.findByIdAndUpdate(id, updates, { new: true });
};

const removeByUserAndId = async (userId, recordId) => {
  return await FamilyMember.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(recordId),
    user_id: new mongoose.Types.ObjectId(userId),
  });
};

module.exports = {
  add,
  get,
  getAll,
  update,
  removeByUserAndId,
};