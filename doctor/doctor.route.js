const router = require("express").Router();
const DoctorController = require("../doctor/controller/user");
const { requireAuth, requireRole } = require("../middlewares/auth");
const limiter = require("../middlewares/ratelimiter");
const upload = require("../middlewares/upload");


// Update user profile (POST)
router.post("/:id", UserController.updateUserProfile);

// Update user profile (PUT)
router.put("/:id", UserController.updateUserProfile);

// Upload profile photo
router.post("/:id/photo", upload.single('photo'), UserController.uploadProfilePhoto);

// Delete profile photo
router.delete("/:id/photo", UserController.deleteProfilePhoto);

module.exports = router;