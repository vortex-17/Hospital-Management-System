const mongoose = require("mongoose");

const patientSchema = mongoose.Schema({
    _id : {type : String, required : true, unique : true},
    name : {type : String, required : true},
    email : {type : String, required : true, unique : true},
    phone : {type : Number, required : true},
    password : {type : String, required : true},
    cart : {type : Object}
});

module.exports = mongoose.model("patient", patientSchema);