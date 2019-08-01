const express = require('express');
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");
const cors = require("cors");

//bring all routes
const auth  = require("./routes/api/auth");
const profile = require("./routes/api/profile")
const questions = require("./routes/api/questions")

const app = express();
app.use(cors());

//Middleware for bodyparser
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

//mongoDB configuration
const db = require("./setup/url").mongoURL;

//Attempt to connect to database
mongoose.connect(db).then((req,res)=>{
    console.log("DB connection successfull")
}).catch(err => console.log(err));

//Passport Middleware
app.use(passport.initialize());

//Config for JWT strategy
require("./strategies/jsonwtStrategy")(passport)

var port = process.env.PORT || 3000;

//route ->just for testing
app.get('/',(req,res)=>{
    res.send("hello world");
});

//actual route
app.use("/api/auth",auth);
app.use("/api/profile",profile);
app.use("/api/questions",questions);

app.listen(port,(req,res)=>{
    console.log(`listening to ${port}`);
});