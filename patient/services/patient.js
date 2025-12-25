const { Patient } = require("../../db/models/patient.js");

const add = async (info) => {
  return await new Patient(info).save();
};

const getpatient = async (params={}) => {
  const {condition={},projection = {},options={}} = params;
  return await Patient.findOne(condition, projection, options);
};

module.exports = {
  add,
  getpatient
};
