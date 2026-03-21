const UserService = require("../services/user.js");
const PatientService = require("../../patient/services/patient.js");
const DoctorService = require("../../doctor/services/doctor.js");
const adminService = require("../../superadmin/services/admin.js");
const OtpService = require("../../services/otp.js");
const bcrypt = require("bcryptjs");
const msg = require("../../utils/message.js");

const { signAccess, signRefresh } = require("../../auth/jwt.services.js");
const { saveRefreshToken, isRefreshTokenValid, revokeRefreshTokenByHash } = require("../../auth/token.service.js");

const REFRESH_TTL_SECONDS = 7 * 24 * 3600;


//regiter with otp
const sendRegistrationOtp = async (req, res) => {
  try {
    const { email, role, password,name,blood,dob, } = req.body;
    const existing = await UserService.getuser({ condition: { email } });
    if (existing) return res.status(400).json({ message: msg.EMAIL_ALREADY_EXISTS });

    const hashed = await bcrypt.hash(password, 12);
    await OtpService.createOtp(email,name, { password: hashed, role });
    res.status(200).json({ message: "OTP sent to email" });
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

    const { password: hashedPassword, role,name,blood,dob } = result.payload;
    

    let roleobj, role_model;
    if (role === "patient") {
      role_model = "Patient";
      roleobj = await PatientService.add({ role,email,name });
    } else if (role === "doctor") {
      role_model = "Doctor";
      roleobj = await DoctorService.add({ role,email,name });
    } else if (role === "admin") {
      role_model = "Admin";
      roleobj = await adminService.add({ role,email ,name});
    }

    const user = await UserService.add({
      email,
      password: hashedPassword,
      role,
      role_id: roleobj?._id,
      role_model,
      name:name
    });

    res.status(201).json({ message: msg.USER_REGISTERED_SUCCESS });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async(req, res) => {
  try {
    const { email, password } = req.body;
    let condition = { email };
    let params = { condition };
    const user = await UserService.getuser(params);
    if (!user) return res.status(401).json({ message: msg.USER_INVALID_CREDENTIALS });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: msg.USER_INVALID_CREDENTIALS });

    const accessToken = signAccess({ sub: user._id, email: user.email, role: user.role });
    const refreshToken = signRefresh({ sub: user._id,email: user.email, role: user.role });

    await saveRefreshToken(user._id,user.email, refreshToken, REFRESH_TTL_SECONDS, {
      ip: req.ip, userAgent: req.get("User-Agent")
    });

    return res.cookie("token", accessToken, {
      httpOnly: true,
      secure: false,          // MUST be false for localhost
      sameSite: "lax",        // IMPORTANT
      maxAge: 24 * 60 * 60 * 1000
    })
    .send({
      data:user,
      status:true

    })
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


const logout = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (token) {
    await revokeRefreshTokenByHash(require("crypto").createHash("sha256").update(token).digest("hex"));
  }
  res.clearCookie("refreshToken");
  res.status(204).send();
}

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

const getUsers = async (req, res) => {
  const users = await UserService.getuser();
  res.json({
    success: true,
    data: users
  });
};

module.exports = {
  createUser,
  getUsers,
  logout,
  refresh,
  login,
  sendRegistrationOtp,
  verifyRegistrationOtp
};
