const mongoose = require("mongoose");

const hospitalSchema = mongoose.Schema({
    patientId : {type : String, required : true},
    Name : {type : String, required : true},
    doctorId : {type  : String, required : true},
    treatment : {type : String, required : true},
    email : {type : String, required : true},
    phone : {type : Number, required : true},
    date : {type : String, required : true},
    startTime : {type : Number, required : true},
    endTime : {type : Number},
    ward : {type : String}
});

module.exports = mongoose.model("hms", hospitalSchema);