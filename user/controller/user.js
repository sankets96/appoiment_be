const UserService = require("../services/user.js");
const bcrypt = require("bcryptjs");
const msg = require("../../utils/message.js");

const { signAccess, signRefresh } = require("../../auth/jwt.services.js");
const { saveRefreshToken, isRefreshTokenValid, revokeRefreshTokenByHash } = require("../../auth/token.service.js");

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 3600;


const register = async(req, res)=> {
  const { email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const user = await UserService.add({ email, password: hash, role });
  res.status(201).json({ id: user._id });
}


const login = async(req, res) => {
  try {
    const { email, password } = req.body;
    let condition = { email };
    let params = { condition };
    const user = await UserService.getuser(params);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccess({ sub: user._1d, role: user.role });
    const refreshToken = signRefresh({ sub: user._id });

    await saveRefreshToken(user._id, refreshToken, REFRESH_TTL_SECONDS, {
      ip: req.ip, userAgent: req.get("User-Agent")
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TTL_SECONDS * 1000
    });

    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}


const refresh = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const valid = await isRefreshTokenValid(token);
  if (!valid) return res.status(401).json({ message: "Invalid refresh token" });

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
  register
};
