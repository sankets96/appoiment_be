const { Patient } = require("../../db/models/patient.js");

const add = async (info) => {
  return await new Patient(info).save();
};

const getpatient = async (params={}) => {
  const {condition={},projection = {},options={}} = params;
  return await Patient.findOne(condition, projection, options);
};

const get = async (params = {}) => {
  const { condition = {}, projection = {}, options = {} } = params;
  return await Patient.findOne(condition, projection, options);
};

const update = async (id, updates) => {
  return await Patient.findByIdAndUpdate(id, updates, { new: true });
};

module.exports = {
  add,
  getpatient,
  get,
  update
};
