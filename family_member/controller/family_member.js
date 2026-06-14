const FamilyMemberService = require("../services/family_member.js");
const msg = require("../../utils/message.js");
const mongoose = require("mongoose");

// JWT payload may use 'userId' (registration) or 'sub' (login)
const getLoggedInUserId = (req) => req.user.userId || req.user.sub;

// @desc    Add a family member for the logged-in patient
// @route   POST /family-members
// @access  Patient only
const addFamilyMember = async (req, res) => {
  try {
    const { name, relation, bloodGroup, dateOfBirth, gender, phone, remark } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!relation) {
      return res.status(400).json({ success: false, message: "Relation is required" });
    }
    if (!bloodGroup) {
      return res.status(400).json({ success: false, message: "Blood group is required" });
    }
    if (!dateOfBirth) {
      return res.status(400).json({ success: false, message: "Date of birth is required" });
    }
    if (!gender) {
      return res.status(400).json({ success: false, message: "Gender is required" });
    }

    // Check for duplicate: same user + same name + same relation
    const userId = getLoggedInUserId(req);
    const existing = await FamilyMemberService.get({
      condition: { user_id: userId, name: name.trim(), relation },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: msg.FAMILY_MEMBER_DUPLICATE });
    }

    // Validate DOB is not in the future
    const today = new Date();
    const dobDate = new Date(dateOfBirth);
    if (dobDate > today) {
      return res.status(400).json({ success: false, message: msg.FAMILY_MEMBER_DOB_FUTURE });
    }

    const familyMember = await FamilyMemberService.add({
      user_id: userId,
      name: name.trim(),
      relation,
      bloodGroup,
      dateOfBirth,
      gender,
      phone: phone || "",
      remark: remark || "",
      status: true, // Always active when created
    });

    res.status(201).json({ success: true, data: familyMember, message: msg.FAMILY_MEMBER_ADDED });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all family members for the logged-in patient
// @route   GET /family-members
// @access  Patient only
const getFamilyMembers = async (req, res) => {
  try {
    const familyMembers = await FamilyMemberService.getAll({
      condition: { user_id: getLoggedInUserId(req) },
      options: { sort: { createdAt: -1 } },
    });

    res.json({ success: true, data: familyMembers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get a single family member by ID
// @route   GET /family-members/:id
// @access  Patient only
const getFamilyMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const familyMember = await FamilyMemberService.get({
      condition: { _id: id, user_id: getLoggedInUserId(req) },
    });

    if (!familyMember) {
      return res.status(404).json({ success: false, message: msg.FAMILY_MEMBER_NOT_FOUND });
    }

    res.json({ success: true, data: familyMember });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update a family member
// @route   PUT /family-members/:id
// @access  Patient only
const updateFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, relation, bloodGroup, dateOfBirth, gender, phone, remark, status } = req.body;

    // Check that the family member exists and belongs to this user
    const existing = await FamilyMemberService.get({
      condition: { _id: id, user_id: getLoggedInUserId(req) },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: msg.FAMILY_MEMBER_NOT_FOUND });
    }

    // Block deactivation — status must remain active
    if (status === false) {
      return res.status(400).json({ success: false, message: msg.FAMILY_MEMBER_STATUS_DEACTIVATE });
    }

    // Validate DOB is not in the future (if provided)
    if (dateOfBirth) {
      const today = new Date();
      const dobDate = new Date(dateOfBirth);
      if (dobDate > today) {
        return res.status(400).json({ success: false, message: msg.FAMILY_MEMBER_DOB_FUTURE });
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (relation !== undefined) updates.relation = relation;
    if (bloodGroup !== undefined) updates.bloodGroup = bloodGroup;
    if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updates.gender = gender;
    if (phone !== undefined) updates.phone = phone;
    if (remark !== undefined) updates.remark = remark;

    const updated = await FamilyMemberService.update(id, updates);

    res.json({ success: true, data: updated, message: msg.FAMILY_MEMBER_UPDATED });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a family member
// @route   POST /family-members/delete
// @access  Patient only
// @body    { userId, recordId }
const deleteFamilyMember = async (req, res) => {
  try {
    const { userId, recordId } = req.body;

    if (!userId || !recordId) {
      return res.status(400).json({ success: false, message: "userId and recordId are required" });
    }

    const deleted = await FamilyMemberService.removeByUserAndId(userId, recordId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: msg.FAMILY_MEMBER_NOT_FOUND });
    }

    res.json({ success: true, message: msg.FAMILY_MEMBER_DELETED });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addFamilyMember,
  getFamilyMembers,
  getFamilyMemberById,
  updateFamilyMember,
  deleteFamilyMember,
};