const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PersonSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    username:{
        type:String,
    },
    profilepic:{
        type:String,
        default:"https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png"
    },
    // male:{
    //     type:String,
    //     required:true,
    //     default:
    // },
    date:{
        type:Date,
        default:Date.now
    }
});

module.exports = Person = mongoose.model("myperson",PersonSchema);