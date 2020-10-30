const mongoose = require("mongoose");

const medicineSchema = mongoose.Schema({
    _id : {type : String, required : true, unique : true},
    name : {type : String, required : true},
    quantity : {type : Number, required : true},
    price : {type : Number, required : true},
    for : {type : String, required : true},
});

module.exports = mongoose.model("med", medicineSchema);