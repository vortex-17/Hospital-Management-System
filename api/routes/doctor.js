const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { route } = require("../../app");

const withAuthUserId = [
    cookieParser(),
    (req, res, next) => {
      const claims = jwt.verify(req.cookies['jwt'], "hms")
      req['authUserId'] = claims['sub'];
      req["expiry"] = claims["exp"];
      console.log(claims);
      req.id = claims["_id"];
      console.log(req.id);
    //   console.log(req['authUserId']);
    //   console.log(claims['sub']);
      next()
    }
]

const doctorController = require("../controllers/doctor");

router.post("/signup",doctorController.signUp);

router.post("/login", doctorController.login);

router.get("/my_appointments", ...withAuthUserId, doctorController.my_appointments);

router.get("/check-history=:id", ...withAuthUserId, doctorController.check_history);

router.post("/add_med", doctorController.add_med);

module.exports = router;