const express = require("express");
const router = express.Router();
const pool = require("../DatabaseConnection");
// const phash = require("../PasswordHashing");

let fname;
let lname;
let compName;
let panno;
let address;
let emailid;
let genOtp;
let emailer = require("../EmailOtp");
let otp = require("../OTPGenerator");
let myVar = { data: "" };

router.post("/reg1", async (req, res) => {
  fname = req.body.fname;
  console.log(`First Name received: ${fname}`);
  lname = req.body.lname;
  console.log(`Last Name received: ${lname}`);
  compName = req.body.companyname;
  console.log(`Company Name received: ${compName}`);
  panno = req.body.panno;
  console.log(`Pan No received: ${panno}`);
  address = req.body.address;
  console.log(`Address received: ${address}`);
  emailid = req.body.emailid;
  console.log(`Email ID received: ${emailid}`);
  genOtp = otp.generateOTP();
  console.log(`OTP generated: ${genOtp}`);

  try {
    const result = await pool.query(
      `SELECT public.otp_save(
        '${emailid}', 
        '${genOtp}', 
        '127.0.0.1'
      )`
    );

    const otpSaveResult = result.rows[0].otp_save;
    console.log(otpSaveResult);

    res.json(otpSaveResult);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }

  emailer.sendOTPMail(emailid, genOtp);
});

router.post("/reg2", async (req, res) => {
  let otpcode = req.body.otpcode;
  console.log(`OTP received: ${otpcode}`);
  let password = req.body.password;
  console.log(`Password received: ${password}`);

  try {
    const otpResult = await pool.query(
      `SELECT public.otp_validate(
        '${emailid}', 
        '${otpcode}'
      )`
    );

    const validateMessage = otpResult.rows[0].otp_validate;
    console.log(otpResult);

    const loginResult = await pool.query(
      `SELECT public.login_save(
        '${fname}', 
        '${lname}', 
        '${emailid}', 
        '${password}', 
        '${panno}', 
        '${compName}', 
        '${address}', 
        '127.0.0.1'
      )`
    );

    const loginMessage = loginResult.rows[0].login_save;
    console.log(loginResult);

    res.json({ validateMessage, loginMessage });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});

router.post("/login", async (req, res) => {
  let loginEmail = req.body.loginEmail;
  console.log(`ID received: ${loginEmail}`);
  let loginPass = req.body.loginPass;
  console.log(`password received: ${loginPass}`);

  try {
    const loginResult = await pool.query(
      `SELECT public.login_validate(
        '${loginEmail}', 
        '${loginPass}'
      )`
    );

    const loginMessage = loginResult.rows[0].login_validate;
    console.log(loginResult);

    res.json({ loginMessage });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});

module.exports = router;
