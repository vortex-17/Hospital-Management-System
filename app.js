const express = require("express");
const app = express();
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const cookieparser = require("cookie-parser");
const upload = multer();

//Import Routes
const patientRoutes = require("./api/routes/patient");
const doctorRotues = require("./api/routes/doctor");

//connecting the MongoDB database
//the name of the database is 'brightweb'
mongoose.connect("mongodb://127.0.0.1:27017/hms", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//logging
let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan("combined", { stream : accessLogStream}));
app.use(morgan('dev')); // for personal use. Needs to be deleted


// app.use('/upload',express.static('upload'));
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
// app.use(cookieparser);
// app.use(passport.initialize());

app.use('/public', express.static('public'));



app.use(
  session({
    secret: "secret key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },

  })
);

//handling CORS error
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (res.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "POST,PUT,GET,DELETE,PATCH");
    res.status(200).json({});
  }

  next();
});

//apply the routing under this line
app.use("/patients", patientRoutes);
app.use("/doctor", doctorRotues);

app.get("/login", (req,res,next) => {
  res.render("login");
})

app.get("/", (req,res,next) => {
  // res.status(200).json({
  //   message : "This is the home page. Currently under development"
  // });
  res.render("main");
});

app.post("/", (req,res,next) => {
  // res.status(200).json({
  //   message : "This is the home page. Currently under development"
  // });
  res.render("main");
});

//Error pages
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
