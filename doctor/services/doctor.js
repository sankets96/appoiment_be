const { Doctor } = require("../../db/models/doctor.js");

const add = async (info) => {
  return await new Doctor(info).save();
};

const getdoctor = async (params={}) => {
  const {condition={},projection = {},options={}} = params;
  return await Doctor.findOne(condition, projection, options);
};

module.exports = {
  add,
  getdoctor
};
