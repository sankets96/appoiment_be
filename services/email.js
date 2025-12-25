const nodemailer = require("nodemailer");
const env = require("../config/prod.json")

const transporter = nodemailer.createTransport({
  host: env.SMTP.Host,
  port: Number(env.SMTP.PORT || 587),
  secure: env.SMTP.Secure === "true",
  auth: {
    user: env.SMTP.auth.user,
    pass: env.SMTP.auth.Password
  }
});

async function sendMail({ to, subject, text, html }) {
  try{
    return transporter.sendMail({ from: env.SMTP.FromEmail, to, subject, text, html });
  }catch(err){
    console.error("Error sending email:", err);
  }
}

async function sendOtpEmail(to, code) {
  try{
  const subject = "Your Registration OTP";
  const text = `Your OTP is ${code}. It expires in ${process.env.OTP_TTL_SECONDS || 600} seconds.`;
  return sendMail({ to, subject, text });
  }catch(err){
    console.error("Error sending OTP email:", err);
  }
}

module.exports = { sendMail, sendOtpEmail };