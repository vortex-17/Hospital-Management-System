const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const User = require("../model/patient");
const doc = require("../model/doctor");
const med = require("../model/med");
const hms = require("../model/hospital");

const { equal } = require("assert");

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
                password: hash,
                cart : {}
              });
  
              user
                .save()
                .then((result) => {
                  // res.status(200).json({
                  //   message: "Thank you for registering",
                  //   result: {
                  //     message: "Welcome",
                  //     name: result.name,
                  //   },
                  // });
                  return res.render("misc",{message : "Thank You for Registering!"});
                })
                .catch((err) => {
                  // res.status(403).json({
                  //   message: "Auth failed",
                  // });
                  return res.render("misc",{message : "Signup failed"})
                });
            }
          });
        }
      })
      .catch((err) => {
        // res.status(403).json({
        //   message: "Couldn't Signup. Try again later",
        //   error: err.message,
        // });
        return res.render("misc",{message : "Couldn't Signup. Try again later"})
      });
};
  
exports.login = (req, res, next) => {
    User.find({ email: req.body.email })
      .exec()
      .then((user) => {
        if (user.length < 1) {
          // res.status(403).json({
          //   message: "Auth Failed. Username doesn't exits",
          // });
          return res.render("misc",{message : "Auth Failed. Username doesn't exits"});
        } else {
          bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err) {
              // res.status(403).json({
              //   message: "Wrong password",
              // });
              return res.render("misc",{message : "Wrong Password"});
            }
            console.log(result);
            if (result) {
              const token = jwt.sign(
                {
                  _id: user[0]._id,
                  name: user[0].name,
                  email: user[0].email,
                },
                "hms",
                {
                  expiresIn: "30m",
                }
              );
  
              // return res.status(200).json({
              //   message: "Auth successful",
              //   token: token,
              // });
              console.log(token);
              res.cookie('jwt', token);
              return res.render('home', {name : user[0].name});
            }
  
            // res.status(403).json({
            //   message: "Couldn't Login. Wrong credentials",
            // });
            return res.render("misc",{message : "Couldn't Login. Wrong credentials"});
          });
        }
      })
      .catch((err) => {
        res.status(403).json({
          message: "Auth failed",
        });
    });
};

exports.show_doctors = (req,res,next) => {
  doc.find({}).exec()
  .then(result => {
      // res.status(200).json(result);
      console.log(result);
      res.render("show_doc", {result : result});
  })
    .catch(err => {
      res.status(404).json({
        error : err.message
      });
    });
}

exports.book = (req,res,next) => {

    console.log(req.body);
    // res.status(200).json({
    //   id : req.params.id,
    //   body : req.body
    // });
    // var date = req.body.date;
    // let Date = date.getFullYear()+'/' + (date.getMonth()+1) + '/'+date.getDate();
    // console.log(Date);
    hms.find({"doctorId" : req.params.id, "date" : req.body.date, "startTime" : req.body.time}).exec()
    .then(result => {
      console.log(result);
        if(result < 1){
            // we can book at that time
            console.log(result);
            const appointment = new hms({
                patientId : req.id,
                Name : req.body.name,
                doctorId : req.params.id,
                phone : req.body.phone,
                email : req.body.email,
                date : req.body.date,
                treatment : req.body.treatment,
                startTime : req.body.time,
            });

            appointment.save()
            .then(r => {
                // res.status(200).json({
                //     message : "Your appointment has been booked"
                // });
                return res.render("misc",{message : "Your appointment has been booked"});
            })
            .catch(err => {
                res.status(404).json({
                    error : err.message
                });
            });
        } else {
            // res.status(404).json({
            //     message : "The doctor would be busy during that time"
            // });
            return res.render("misc",{message : "The doctor would be busy during that time"});
        }
    })
    .catch(err => {
        res.status(404).json({
            error : err.message
        });
    });
};

exports.history = (req,res,next) => {
    hms.find({patientId : req.id}).exec()
    .then(result => {
        if(result < 1){
            // res.status(200).json({
            //     message : "You are brand new :)"
            // });
            res.render("history", {message : "You are brand new", result : []});
        } else {
            // res.status(200).json(result);
            res.render("history", {message : "Showing Results",result : result});
        }


    })
    .catch(err => {
        res.status(200).json({
            Message : "Some error occurred. Oops!"
        });
    });

};

exports.show_med = (req,res,next) => {
  med.find({}).exec()
  .then(result => {
    if(result < 1){
      // res.status(403).json({
      //   message : "No Medicines Found. The Shelves look empty. Sorry"
      // });
      return res.render("misc",{message : "No Medicines Found. The Shelves look empty. Sorry"});
    } else {
      // res.status(200).json(result);
      res.render("show_med", {result : result});
    }
  })
  .catch(err => {
    res.status(404).json({
      error : err.message
    });
  });
};

exports.buy_med = (req,res,next) => {
    med.find({_id : req.params.id}).exec()
    .then(result => {
        if(result < 1){
            res.status(404).json({
                message : "No medicine found "
            });
        } else {
            if(result[0].quantity !== 0){
                let valid = false;
                User.find({_id : req.id}).exec()
                .then(r => {
                    if(r < 1){
                        // res.status(404).json({
                        //     message : "User cart not found"
                        // });
                        return res.render("misc",{message : "User cart not found"});
                    } else {
                        let cart = {
                            name : result[0].name,
                            price : result[0].price,
                            quantity : req.body.quantity,
                            totalPrice : result[0].price * req.body.quantity
                        }

                        let temp = {};
                        temp[result[0].name] = cart;
                        let newObj = {...r[0].cart, ...temp};
                        const newValues = {$set : {cart : newObj}};
                        User.updateOne({_id : req.id}, newValues, (err,done) => {
                            if(err){
                                res.status(400).json({
                                    message : "Cannot add"
                                });
                            }

                            if(done){
                                console.log("Medicine Added to your cart\n");
                                valid = true;
                                const newQ = result[0].quantity - req.body.quantity;
                                console.log(newQ);
                                console.log(valid);
                                const newVal = {$set : {quantity : newQ}};
                                if(valid){
                                    med.updateOne({_id : req.params.id}, newVal, (err,done) => {
                                      console.log("Updating the Med Market");
                                        if(err){
                                            console.log("Could not delete the quantity");
                                            res.status(404).json({
                                              message : err.message
                                            });
                                        }
                                        if(done){
                                            // res.status(200).json({
                                            //   message : "Succesfully added the meds"
                                            // });
                                            return res.render("misc",{message : "Succesfully added the meds"});
                                        } else {
                                            // res.status(400).json({
                                            //   message : "Could not add the meds"
                                            // });
                                            console.log("Could not edit");
                                            return res.render("misc",{message : "Could not add the meds"});
                                            
                                        }
                                    });
                                }
                            } else {
                                res.status(404).json({
                                    message : "Could not add the meds to cart"
                                });
                                valid = false;

                            }
                      });

                    }
                })
                .catch(err => {
                    res.status(404).json({
                        error : err.message
                    });
                });
                
            } else {
                // res.status(200).json({
                //     message : "The Medicine is not available right now"
                // });
                return res.render("misc",{message : "The Medicine is not available right now"});
            }
        }
    })
    .catch(err => {
        res.status(404).json({
            message : "Something Wrong",
            error : err.message
        })
    })

};

exports.cart = (req,res,next) => {
    User.find({_id : req.id}).exec()
    .then(result => {
        if(result < 1){
            // res.status(200).json({
            //     message : "Looks like your cart is empty"
            // });
            return res.render("misc",{message : "Looks like your cart is empty"});
        } else {
            // res.status(200).json(result[0].cart);
            r = []
            // console.log(result[0].cart);
            for(var i in result[0].cart){
              r.push(result[0].cart[i])
            }
            console.log(r)
            res.render("show_cart", {result : r});
        }
    })
    .catch(err => {
        res.status(404).json({
            Message : "Something went wrong with your cart.",
            Error : err.message
        });
        
    })
};