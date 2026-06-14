const { Doctor } = require("../../db/models/doctor.js");

const add = async (info) => {
  return await new Doctor(info).save();
};

const getdoctor = async (params={}) => {
  const {condition={},projection = {},options={}} = params;
  return await Doctor.findOne(condition, projection, options);
};

const get = async (params = {}) => {
  const { condition = {}, projection = {}, options = {} } = params;
  return await Doctor.findOne(condition, projection, options);
};

const getAll = async (params = {}) => {
  const { condition = {}, projection = {}, options = {} } = params;
  return await Doctor.find(condition, projection, options);
};

const update = async (id, updates) => {
  return await Doctor.findByIdAndUpdate(id, updates, { new: true });
};

module.exports = {
  add,
  getdoctor,
  get,
  getAll,
  update
};
