const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const User = require("../model/doctor");
const hms = require("../model/hospital");
const { equal } = require("assert");
const med = require("../model/med");

exports.signUp = (req, res, next) => {
    User.find({ email: req.body.email })
      .exec()
      .then((user) => {
        if (user.length >= 1) {
          res.status(403).json({
            message: "email and username already taken",
          });
        } else {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              res.status(403).json({
                message: "Error with the hashing",
              });
            } else {
              const user = new User({
                _id: new mongoose.Types.ObjectId().toString(),
                name: req.body.name,
                email: req.body.email,
                phone : req.body.phone,
                type : req.body.type,
                password: hash,
              });
  
              user
                .save()
                .then((result) => {
                  res.status(200).json({
                    message: "Thank you for registering",
                    result: {
                      message: "Welcome",
                      name: result.name,
                    },
                  });
                })
                .catch((err) => {
                  res.status(403).json({
                    message: "Auth failed",
                  });
                });
            }
          });
        }
      })
      .catch((err) => {
        res.status(403).json({
          message: "Couldn't Signup. Try again later",
          error: err.message,
        });
      });
};
  
exports.login = (req, res, next) => {
    User.find({ username: req.body.username })
      .exec()
      .then((user) => {
        if (user.length < 1) {
          res.status(403).json({
            message: "Auth Failed. Username doesn't exits",
          });
        } else {
          bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err) {
              res.status(403).json({
                message: "Wrong password",
              });
            }
            console.log(result);
            if (result) {
              const token = jwt.sign(
                {
                  _id: user[0]._id,
                  name: user[0].name,
                  username: user[0].username,
                  email: user[0].email,
                },
                "hms",
                {
                  expiresIn: "1h",
                }
              );
  
              // return res.status(200).json({
              //   message: "Auth successful",
              //   token: token,
              // });
              res.cookie('jwt', token);
              return res.render('doc_dashboard', {name : user[0].name});
            }
  
            res.status(403).json({
              message: "Couldn't Login. Wrong credentials",
            });
          });
        }
      })
      .catch((err) => {
        res.status(403).json({
          message: "Auth failed",
        });
    });
};

exports.my_appointments = (req,res,next) => {
  let date = new Date();
  let d = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDay();
  d = date.getDay() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
  console.log(d);
  d = "15/10/2020";
  hms.find({date : d, doctorId : req.id}).exec()
  .then(result => {
    console.log(result);
    if(result < 1){
      // res.status(200).json({
      //   Message : "You got no appointments"
      // });
      res.render("doc_app",{
        result : result,
      });
    } else {
      res.render("doc_app",{
        result : result,
      });
    }
  })
  .catch(err => {
    res.status(404).json({
      error : err.message
    });
  });

};

exports.check_history = (req,res,next) => {
    hms.find({patientId : req.params.id}).exec()
    .then(result => {
        if(result < 1){
            // res.status(200).json({
            //     message : "The patient has no history"
            // });
            res.render("doc_check_his", {result : result});
        } else {
            // res.status(200).json(result);
            res.render("doc_check_his", {result : result});
        }
    })
    .catch(err => {
        res.status(404).json({
            error : err.message
        });
    });
};

//For Admin to add the medicine directly into the database
exports.add_med = (req,res,next) => {
  med.find({name : req.body.name}).exec()
  .then(result => {
    console.log(result);
    if(result.length >= 1){ //medicine present
      console.log("Medicine Present")

      const modifiedParameters = {}
      for(var key in req.body){
        if((req.body[key] !== '' && key !== "name")){ // && (result[0].hasOwnProperty(key))
          let item = req.body[key];
          modifiedParameters[key] = item;
        }
      }

      const newValues = {$set : modifiedParameters};
      med.updateOne({name : req.body.name}, newValues, (err,done) => {
        if(err){
          res.status(404).json({
            message : err.message
          });
        }

        if(done){
          res.status(200).json({
            message : "Changes has been made"
          });
        }
      })

    } else { //new medicine
      const Med = new med({
        _id: new mongoose.Types.ObjectId().toString(),
        name: req.body.name,
        price : req.body.price,
        for : req.body.for,
        quantity : req.body.quantity,
      });

      Med.save()
      .then(r => {
        res.status(200).json({
          message : "Medicine has been added"
        });
      })
      .catch(err => {
        res.status(400).json({
          message : err.message
        });
      });
    }
  })
  .catch(err => {
    res.status(404).json({
      error : err.message
    });
  });
  
};

