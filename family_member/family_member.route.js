const router = require("express").Router();
const FamilyMemberController = require("./controller/family_member");
const { requireAuth, requireRole } = require("../middlewares/auth");

// All family member routes require authentication and patient role
router.use(requireAuth, requireRole("patient"));

// @route   POST /family-members
// @desc    Add a family member
router.post("/", FamilyMemberController.addFamilyMember);

// @route   GET /family-members
// @desc    Get all family members for the logged-in patient
router.get("/", FamilyMemberController.getFamilyMembers);

// @route   GET /family-members/:id
// @desc    Get a single family member by ID
router.get("/:id", FamilyMemberController.getFamilyMemberById);

// @route   PUT /family-members/:id
// @desc    Update a family member
router.put("/:id", FamilyMemberController.updateFamilyMember);

// @route   POST /family-members/delete
// @desc    Delete a family member (body: { userId, recordId })
router.post("/delete", FamilyMemberController.deleteFamilyMember);

module.exports = router;