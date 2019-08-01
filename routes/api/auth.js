const express = require('express');
const bcrypt = require("bcryptjs");
const jsonwt = require("jsonwebtoken");
const passport = require("passport");
const key = require("../../setup/url");
const router = express.Router();
const cors  =  require("cors");  

//@type     GET
//@route    /api/auth
//@desc     testing purpose
//@access   PUBLIC
router.get("/",(req,res)=>{
    res.json({test:"auth is being tested"});
})

//Import Schema for person to register
const Person = require("../../models/Person");

//@type     POST
//@route    /api/auth/register
//@desc     route for registeration
//@access   PUBLIC
router.post("/register",(req,res)=>{

Person.findOne({email: req.body.email})
.then(person => {    //if there is email in db then it will return an object of person
        if(person){
            return res.status(400).json({emailerror:"Email already registered"})
        }else{
            const newPerson = new Person({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                gender: req.body.gender
            });
            console.log(newPerson);
            //Encrypt password using bcrypt
            bcrypt.genSalt(10, (err, salt) =>{
             bcrypt.hash(newPerson.password, salt, (err, hash) =>{
                // Store hash in your password DB.
                if(err) throw err;      //if err then it will throw err in our console
                newPerson.password = hash;       //our encrypted pwd will be in hash
                newPerson.save().then(person => res.json(person))
                .catch(err => console.log(err))
                });
            });
        }
    }
    ).catch(err => console.log(err))
})

//@type     POST
//@route    /api/auth/login
//@desc     route for login
//@access   PUBLIC
router.post("/login",cors(),(req,res)=>{
    console.log("reached");
    const email = req.body.email;
    const password = req.body.password;
    console.log(email);
    Person.findOne({email}).then(
        person =>{
            console.log(person);
            if(!person){
                return res.status(404).json({emailerror:"User not found with this email"})
            }
            bcrypt.compare(password , person.password).then(
                isCorrect => {              //isCorrect is jst the boolean variable which canbe true or false
                    
                    if(isCorrect){
                        //res.json({success:"User login successfully"})
                        //use payload and create token for user
                        const payload = {
                            id: person.id,
                            name: person.name,
                            email: person.email
                        };
                        jsonwt.sign(
                            payload,
                            key.secret,
                            {expiresIn:3600},
                            (err,token)=>{
                                res.json({
                                    success :true,
                                    token: "Bearer "+ token
                                })
                            }
                        )
                    }else{
                        res.status(400).json({passworderror:"Password is incorrect"});
                    }
                }
            ).catch(err => console.log(err))
        }
    )
    .catch(err => console.log(err));
});

//@type     GET
//@route    /api/auth/profile
//@desc     route for profile
//@access   PRIVATE - by passing type of authenticate
router.get("/profile", passport.authenticate('jwt',{session:false}), (req,res)=>{
    //console.log(req);
    // yeh wo profile h jo register krte time dala hai
    console.log("hello")
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        profilepic: req.user.profilepic 
    })
})

module.exports = router;