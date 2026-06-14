const UserService = require("../services/user.js");
const PatientService = require("../../patient/services/patient.js");
const DoctorService = require("../../doctor/services/doctor.js");
const adminService = require("../../superadmin/services/admin.js");
const OtpService = require("../../services/otp.js");
const DoctorRequestService = require("../../services/doctorRequest.js");
const bcrypt = require("bcryptjs");
const msg = require("../../utils/message.js");
const { Role } = require("../../db/models/role.js");

const { signAccess, signRefresh } = require("../../auth/jwt.services.js");
const { saveRefreshToken, isRefreshTokenValid, revokeRefreshTokenByHash } = require("../../auth/token.service.js");

const REFRESH_TTL_SECONDS = 7 * 24 * 3600;

//regiter with otp
const sendRegistrationOtp = async (req, res) => {
  try {
    const { email, role, password, name, phone, dateOfBirth, bloodGroup, gender, licenseNumber, experience } = req.body;
    const existing = await UserService.getuser({ condition: { email } });
    if (existing) return res.status(400).json({ message: msg.EMAIL_ALREADY_EXISTS });

    const hashed = await bcrypt.hash(password, 12);
    const otp = await OtpService.createOtp(email, name, {
      password: hashed,
      role,
      name,
      phone: phone || '',
      dateOfBirth: dateOfBirth || '',
      bloodGroup: bloodGroup || '',
      gender: gender || '',
      licenseNumber: licenseNumber || '',
      experience: experience || ''
    });
    res.status(200).json({ message: msg.OTP_SENT_TO_EMAIL});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//verify otp and register user
const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    const result = await OtpService.verifyOtp(email, code);
    if (!result.valid) return res.status(400).json({ message: result.message });

    const {
      password: hashedPassword,
      role,
      name,
      phone,
      dateOfBirth,
      bloodGroup,
      gender,
      licenseNumber,
      experience
    } = result.payload;
    const roleName = role; 
    const roleData = await Role.findOne({ name: roleName });
    if (!roleData) return res.status(400).json({ message: "Role not found" });

  
    const roleLower = roleName.toLowerCase();
    const role_model = roleName;
    const user = await UserService.add({
      email,
      password: hashedPassword,
      name,
      phone: phone || '',
      dateOfBirth: dateOfBirth || '',
      bloodGroup: bloodGroup || '',
      gender: gender || '',
      role: roleLower, 
      role_id: roleData._id, 
      role_model 
    });

    let doctorRecord = null;
    if (roleLower === "patient") {
      await PatientService.add({
        user_id: user._id, 
        name,
        email,
        phone: phone || '',
        dateOfBirth: dateOfBirth || '',
        bloodGroup: bloodGroup || '',
        gender: gender || ''
      });

      const token = signAccess({ userId: user._id, email: user.email, role: user.role, role_id: user.role_id });
      const refreshToken = signRefresh({ userId: user._id, email: user.email, role: user.role, role_id: user.role_id });
      await saveRefreshToken(user._id, user.email, refreshToken, REFRESH_TTL_SECONDS);

      res.status(201).json({
        message: msg.USER_REGISTERED_SUCCESS,
        token,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          role_id: user.role_id
        }
      });
    } else if (roleLower === "doctor") {
      doctorRecord = await DoctorService.add({
        user_id: user._id, // References User collection
        name,
        email,
        phone: phone || '',
        licenseNumber: licenseNumber || '',
        experience: experience || '',
        verified: false
      });

      // Create doctor approval request
      await DoctorRequestService.add({
        user_id: user._id,
        doctor_id: doctorRecord._id,
        name,
        email,
        phone: phone || '',
        licenseNumber: licenseNumber || '',
        experience: experience || '',
        status: "pending"
      });

      // DO NOT generate tokens - doctor cannot login until approved
      res.status(201).json({
        message: "Your registration request has been sent to admin for approval. You will be able to login after verification.",
        pendingApproval: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } else if (roleLower === "admin") {
      await adminService.add({
        user_id: user._id, // References User collection
        name,
        email,
        phone: phone || ''
      });

      // Generate tokens for admin (can login immediately)
      const token = signAccess({ userId: user._id, email: user.email, role: user.role, role_id: user.role_id });
      const refreshToken = signRefresh({ userId: user._id, email: user.email, role: user.role, role_id: user.role_id });
      await saveRefreshToken(user._id, user.email, refreshToken, REFRESH_TTL_SECONDS);

      res.status(201).json({
        message: msg.USER_REGISTERED_SUCCESS,
        token,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          role_id: user.role_id
        }
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//login
const login = async(req, res) => {
  try {
    const { email, password } = req.body;
    let condition = { email };
    let params = { condition };
    const user = await UserService.getuser(params);
    if (!user) return res.status(401).json({ message: msg.USER_INVALID_CREDENTIALS });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: msg.USER_INVALID_CREDENTIALS });

    // Check if doctor is verified
    if (user.role === "doctor") {
      const doctor = await DoctorService.get({ condition: { user_id: user._id } });
      if (!doctor || !doctor.verified) {
        return res.status(403).json({ message: "Your account is pending admin verification. Please wait for approval." });
      }
    }

    const accessToken = signAccess({ sub: user._id, email: user.email, role: user.role, role_id: user.role_id });
    const refreshToken = signRefresh({ sub: user._id,email: user.email, role: user.role, role_id: user.role_id });
    await saveRefreshToken(user._id,user.email, refreshToken, REFRESH_TTL_SECONDS, {
      ip: req.ip, userAgent: req.get("User-Agent")
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TTL_SECONDS * 1000
    });

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        role_id: user.role_id
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}


const refresh = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const valid = await isRefreshTokenValid(token);
  if (!valid) return res.status(401).json({ message: msg.USER_INVALID_REFRESH_TOKEN });

  // rotate
  const newAccess = signAccess({ sub: valid.payload.sub });
  const newRefresh = signRefresh({ sub: valid.payload.sub });
  await revokeRefreshTokenByHash(require("crypto").createHash("sha256").update(token).digest("hex"), newRefresh);
  await saveRefreshToken(valid.payload.sub, newRefresh, REFRESH_TTL_SECONDS, {
    ip: req.ip, userAgent: req.get("User-Agent")
  });

  res.cookie("refreshToken", newRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TTL_SECONDS * 1000
  });
  res.json({ accessToken: newAccess });
}

//logout
const logout = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (token) {
    await revokeRefreshTokenByHash(require("crypto").createHash("sha256").update(token).digest("hex"));
  }
  res.clearCookie("refreshToken");
  res.status(204).send();
}

//create user
const createUser = async (req, res) => {
  try {
    let {name,email}=req.body
    const user = await UserService.add({name,email});
    res.status(201).json({
      success: true,
      data: msg.USER_ADD_SucessFULLY
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

//get user
const getUsers = async (req, res) => {
  const users = await UserService.getuser();
  res.json({
    success: true,
    data: users
  });
};

// Get user profile by ID
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserService.getuser({ condition: { _id: id } });
    if (!user) {
      return res.status(404).json({ message: msg.USER_NOT_FOUND });
    }

    // Get role-specific data by searching with user_id in Patient/Doctor/Admin collections
    let roleData = null;
    if (user.role === 'patient') {
      const PatientService = require('../../patient/services/patient.js');
      roleData = await PatientService.get({ condition: { user_id: id } });
    } else if (user.role === 'doctor') {
      const DoctorService = require('../../doctor/services/doctor.js');
      roleData = await DoctorService.get({ condition: { user_id: id } });
    } else if (user.role === 'admin') {
      const adminService = require('../../superadmin/services/admin.js');
      roleData = await adminService.get({ condition: { user_id: id } });
    }

    // Convert Mongoose doc to plain object
    const roleDataPlain = roleData ? (roleData.toObject ? roleData.toObject() : roleData) : null;

    // Build response with explicit field mapping
    const userProfile = {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      bloodGroup: user.bloodGroup || '',
      gender: user.gender || '',
      address: user.address || '',
      role: user.role,
      role_id: user.role_id,
      role_model: user.role_model,
    };

    // Merge doctor/patient specific fields
    if (roleDataPlain) {
      Object.assign(userProfile, {
        specialty: roleDataPlain.specialty || '',
        experience: roleDataPlain.experience || '',
        licenseNumber: roleDataPlain.licenseNumber || '',
        bio: roleDataPlain.bio || '',
        fee: roleDataPlain.fee || 500,
        verified: roleDataPlain.verified || false,
        status: roleDataPlain.status !== undefined ? roleDataPlain.status : true,
        createdAt: roleDataPlain.createdAt,
        updatedAt: roleDataPlain.updatedAt,
      });
    }

    res.json({
      success: true,
      user: userProfile
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, dateOfBirth, bloodGroup, gender, address, bio, fee, specialty, experience, licenseNumber } = req.body;

    // Update user model with personal info
    const user = await UserService.update(id, {
      name,
      phone,
      dateOfBirth,
      bloodGroup,
      gender,
      address
    });

    if (!user) {
      return res.status(404).json({ message:msg.USER_NOT_FOUND });
    }

    // Update role-specific data
    if (user.role === 'patient') {
      const PatientService = require('../../patient/services/patient.js');
      const patient = await PatientService.get({ condition: { user_id: user._id } });
      if (patient) {
        await PatientService.update(patient._id, {
          phone,
          dateOfBirth,
          bloodGroup,
          gender,
          address
        });
      }
    } else if (user.role === 'doctor') {
      const DoctorService = require('../../doctor/services/doctor.js');
      const feeValue = typeof fee === 'string' ? parseInt(fee) : (fee || 500);

      const doctorData = {
        phone: phone || '',
        bio: bio || '',
        fee: feeValue,
        specialty: specialty || '',
        experience: experience || '',
        licenseNumber: licenseNumber || ''
      };

      let doctor = await DoctorService.get({ condition: { user_id: user._id } });
      if (doctor) {
        await DoctorService.update(doctor._id, doctorData);
      } else {
        await DoctorService.add({
          user_id: user._id,
          name: user.name,
          email: user.email,
          ...doctorData,
          verified: true,
          status: true
        });
      }
    }

    res.json({
      success: true,
      message: msg.DATA_UPDATE_SUCESSFULLY,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        role_id: user.role_id
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: err.message });
  }
};

// Forgot password - send OTP
const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserService.getuser({ condition: { email } });
    if (!user) return res.status(404).json({ message: msg.USER_NOT_FOUND });

    const otp = await OtpService.createOtp(email, user.name, { type: 'forgot_password' });
    res.status(200).json({ message: msg.OTP_SENT_TO_EMAIL });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify forgot password OTP
const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    const result = await OtpService.verifyOtp(email, code);
    if (!result.valid) return res.status(400).json({ message: result.message });

    // Verify it's a forgot_password OTP
    if (result.payload?.type !== 'forgot_password') {
      return res.status(400).json({ message: msg.INVALID_OTP });
    }

    // Generate a temporary token for password reset
    const resetToken = signAccess({
      sub: email,
      type: 'password_reset',
      email
    }, { expiresIn: '15m' });

    res.status(200).json({
      message: 'OTP verified successfully',
      token: resetToken
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const user = await UserService.getuser({ condition: { email } });
    if (!user) return res.status(404).json({ message: msg.USER_NOT_FOUND });

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password
    await UserService.update(user._id, { password: hashedPassword });

    res.status(200).json({ message: msg.PASSWORD_RESET_SUCCESS });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all doctor requests
const getDoctorRequests = async (req, res) => {
  try {
    const requests = await DoctorRequestService.getAll({
      condition: { status: "pending" }
    });
    res.json({
      success: true,
      requests
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve doctor request
const approveDoctorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    // Update request status
    await DoctorRequestService.update(id, {
      status: "approved",
      remark: remark || ''
    });

    // Update doctor verified status
    const request = await DoctorRequestService.get({ condition: { _id: id } });
    if (request && request.doctor_id) {
      await DoctorService.update(request.doctor_id, { verified: true });
    }

    res.json({
      success: true,
      message: "Doctor approved successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject doctor request
const rejectDoctorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    await DoctorRequestService.update(id, {
      status: "rejected",
      remark: remark || ''
    });

    res.json({
      success: true,
      message: "Doctor rejected"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all doctors
//   Query params (all optional):
//     status   = 'approved' | 'pending' | 'all'   (default 'approved')
//     specialty= 'Cardiology' (case-insensitive exact match)
//     q        = substring of name OR email (case-insensitive)
//     minFee   = inclusive lower bound (number)
//     maxFee   = inclusive upper bound (number)
const getAllDoctors = async (req, res) => {
  try {
    const { status, specialty, q, minFee, maxFee } = req.query;
    const statusFilter = (status || 'approved').toLowerCase();
    let condition = { isDeleted: false };

    if (statusFilter === 'approved') {
      condition = { ...condition, verified: true, status: true };
    } else if (statusFilter === 'pending') {
      condition = { ...condition, verified: false, status: true };
    } else if (statusFilter !== 'all') {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use 'approved', 'pending', or 'all'."
      });
    }

    if (specialty && specialty.trim() && specialty.toLowerCase() !== 'all') {
      // Case-insensitive exact match on specialty
      condition.specialty = new RegExp(`^${escapeRegex(specialty.trim())}$`, 'i');
    }

    if (q && q.trim()) {
      const safe = escapeRegex(q.trim());
      condition.$or = [
        { name: new RegExp(safe, 'i') },
        { email: new RegExp(safe, 'i') }
      ];
    }

    if (minFee !== undefined || maxFee !== undefined) {
      condition.fee = {};
      if (minFee !== undefined && minFee !== '' && !Number.isNaN(Number(minFee))) {
        condition.fee.$gte = Number(minFee);
      }
      if (maxFee !== undefined && maxFee !== '' && !Number.isNaN(Number(maxFee))) {
        condition.fee.$lte = Number(maxFee);
      }
      if (Object.keys(condition.fee).length === 0) delete condition.fee;
    }

    const doctors = await DoctorService.getAll({
      condition,
      options: { sort: { name: 1 } }
    });

    res.json({
      success: true,
      count: doctors.length,
      status: statusFilter,
      doctors
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Escape user input for safe use inside a RegExp
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Get a single doctor's weekly availability
const getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await DoctorService.getdoctor({ condition: { _id: id, isDeleted: false } });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.json({
      success: true,
      doctorId: doctor._id,
      availability: doctor.available || {}
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Patient books a slot with a doctor.
//   Body: { doctorId, day, time, date, reason }
//   Side effects: removes the slot from doctor.available[day] and pushes
//                 a record into doctor.bookedSlots. Returns the new
//                 appointment object.
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, day, time, date, reason } = req.body || {};

    if (!doctorId || !day || !time || !date) {
      return res.status(400).json({
        success: false,
        message: "doctorId, day, time, and date are all required"
      });
    }

    const doctor = await DoctorService.getdoctor({ condition: { _id: doctorId, isDeleted: false } });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const daySlots = (doctor.available && doctor.available[day]) || [];
    if (!daySlots.includes(time)) {
      return res.status(409).json({
        success: false,
        message: `Slot ${day} ${time} is not available for this doctor`
      });
    }

    // Idempotency: don't allow the same patient to double-book the same slot.
    const alreadyBooked = (doctor.bookedSlots || []).some(
      (s) => s.day === day && s.time === time && s.date === date
    );
    if (alreadyBooked) {
      return res.status(409).json({
        success: false,
        message: "This slot is already booked"
      });
    }

    // Remove the slot from the weekly schedule and append the booking.
    const updatedAvailable = { ...(doctor.available || {}) };
    updatedAvailable[day] = updatedAvailable[day].filter((s) => s !== time);

    const patient = req.user || {};
    const appointment = {
      id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      patientId: patient._id || patient.id,
      patientName: patient.name,
      doctorId: doctor._id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      day,
      time,
      date,
      reason: reason || '',
      status: 'confirmed',
      createdAt: new Date()
    };

    const updatedBookedSlots = [...(doctor.bookedSlots || []), appointment];

    await DoctorService.update(doctor._id, {
      available: updatedAvailable,
      bookedSlots: updatedBookedSlots
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked",
      appointment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Update user with profile photo path
    const photoPath = `/uploads/${req.file.filename}`;
    await UserService.update(id, { profilePhoto: photoPath });

    res.json({
      success: true,
      message: msg.PROFILE_PHOTO_UPLOADED_SUCESSFULLY,
      photoPath
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete profile photo
const deleteProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserService.getuser({ condition: { _id: id } });
    if (!user) {
      return res.status(404).json({ message: msg.USER_NOT_FOUND });
    }

    await UserService.update(id, { profilePhoto: '' });

    res.json({
      success: true,
      message: msg.PROFILE_PHOTO_DELETE_SUCESSFULLY
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserProfile,
  updateUserProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  logout,
  refresh,
  login,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
  getDoctorRequests,
  approveDoctorRequest,
  rejectDoctorRequest,
  getAllDoctors,
  getDoctorAvailability,
  bookAppointment
};
