const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken");
const { route } = require("../../app");

const patient = require("../model/patient");
const patientController  = require("../controllers/patient");
const med = require("../model/med");

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

router.post("/signup", patientController.signUp);

router.post("/login", patientController.login);

router.post("/book=:id", ...withAuthUserId, patientController.book);

router.get("/history", ...withAuthUserId, patientController.history);

router.get("/show_medicines" ,...withAuthUserId, patientController.show_med);

router.post("/buy_med=:id", ...withAuthUserId,patientController.buy_med);

router.get("/show_doctors", ...withAuthUserId, patientController.show_doctors);

router.get("/cart", ...withAuthUserId, patientController.cart);

router.get("/booking_form/:id",...withAuthUserId, (req,res,next) => {
    res.render("book_app", {docid : req.params.id});
});

router.get("/buy_form/:id", ...withAuthUserId, (req,res,next) => {
  med.find({_id : req.params.id}).exec()
  .then(result => {
    if(result < 1){
      res.status(403).json({
        message :  "No Medicine with this ID"
      });
    } else {
      const info = result[0];
      res.render("buy_med", {medid : req.params.id, info : info});
    }
  })
  .catch(err => {
    res.status(400).json({
      error : err.message
    });
  });
});


router.get("/logout", (req,res,next) => {
    // console.log(req.headers.cookie);
    console.log(req.cookies);
    Cookies.set('jwt', {expires: Date.now()});
    // req.headers.cookie = '';
    // req["expiry"] = 0;
    // res.render("home",{});
});

module.exports = router;