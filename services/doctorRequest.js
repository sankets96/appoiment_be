const { DoctorRequest } = require("../db/models/doctorRequest.js");

const add = async (info) => {
  return await new DoctorRequest(info).save();
};

const get = async (params = {}) => {
  const { condition = {}, projection = {}, options = {} } = params;
  return await DoctorRequest.findOne(condition, projection, options);
};

const getAll = async (params = {}) => {
  const { condition = {}, projection = {}, options = {} } = params;
  return await DoctorRequest.find(condition, projection, options);
};

const update = async (id, updates) => {
  return await DoctorRequest.findByIdAndUpdate(id, updates, { new: true });
};

module.exports = {
  add,
  get,
  getAll,
  update
};