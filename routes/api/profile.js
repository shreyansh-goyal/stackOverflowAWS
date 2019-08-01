const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Person model
const Person = require("../../models/Person");

//Load Profile model
const Profile  = require("../../models/Profile")

//@type     GET
//@route    /api/profile/
//@desc     route for personal user profile
//@access   PRIVATE
router.get('/', passport.authenticate('jwt',{session:false}) , (req,res)=>{
    console.log("entered into the route");
    //we need to check profile for this user exist or not -bcoz user can leave without giving info after authentication
    Profile.findOne({user: req.user.id}).then(
        profile =>{
            console.log(profile);
            if(!profile){
                return res.status(404).json({profilenotfound:"no profile found"})
            }
            res.json(profile);  //it will return json ie entire obj profile containing all profileinfo
        }
    ).catch(err => console.log("Profile error"+err))
})


//@type     POST
//@route    /api/profile/
//@desc     route for updating & saving personal user profile
//@access   PRIVATE
router.post("/" ,  passport.authenticate("jwt",{session:false}) , (req,res)=>{
    const profilevalues= {};
    profilevalues.user = req.user.id;
    if(req.body.username) profilevalues.username = req.body.username;
    if(req.body.website) profilevalues.website = req.body.website;
    if(req.body.country) profilevalues.country = req.body.country;
    if(req.body.portfolio) profilevalues.portfolio = req.body.portfolio;
    if(typeof req.body.languages!== undefined){
        profilevalues.languages = req.body.languages.split(',');
    }
    //get social links
    profilevalues.social={};
    if(req.body.youtube) profilevalues.social.youtube = req.body.youtube;
    if(req.body.facebook) profilevalues.social.facebook = req.body.facebook;
    if(req.body.instagram) profilevalues.social.instagram = req.body.instagram;

    //Do database stuff
    Profile.findOne({user:req.user.id}).then(
        profile=>{
            if(profile){
                Profile.findOneAndUpdate(
                    {user:req.user.id},     //this will find the record
                    {$set:profilevalues},   //this will update the record
                    {new:true}              //whether data is new data or not
                ).then(profile=>res.json(profile))
                .catch(err=>console.log("Problem in update "+err))
            }else{
                Profile.findOne({username:profilevalues.username})
                .then( profile=>{
                    //Username already exists
                    if(profile){
                        res.status(400).json({username:"username already exists"})
                    }
                    //save user bcoz unique username
                    new Profile(profilevalues).save().
                    then(profile => res.json(profile))
                    .catch(err => console.log(err))
                }
                    
                )
                .catch(err=>console.log(err));
            }
        }
    ).catch(err=>console.log("Problem in fetching profile"+err))
})


//@type     GET
//@route    /api/profile/:username
//@desc     route for getting userprofile based on USERNAME
//@access   PUBLIC
router.get("/:username" , (req,res)=>{
    Profile.findOne({username: req.params.username}).populate("user",["name","profilepic"])
    .then(
        profile=>{
            if(!profile){
                res.status(404).json({usernotfound:"usernot found"})
            }
            res.json(profile);
        }
    ).catch(err => console.log("err in fetching username",err))
})

//@type     GET
//@route    /api/profile/:username
//@desc     route for getting userprofile based on id
//@access   PUBLIC
router.get("/id/:user" , (req,res)=>{
    Profile.findOne({id: req.params.user.id}).populate("user",["name","profilepic"])
    .then(
        profile=>{
            if(!profile){
                res.status(404).json({usernotfound:"usernot found"})
            }
            res.json(profile);
        }
    ).catch(err => console.log("err in fetching id",err))
})

//@type     GET
//@route    /api/profile/find/everyone
//@desc     route for getting userprofile of erveryone
//@access   PUBLIC
router.get("/find/everyone" , (req,res)=>{
    Profile.find().populate("user",["name","profilepic"])
    .then(
        profiles=>{
            if(!profiles){
                res.status(404).json({usernotfound:"No profile found"})
            }
            res.json(profiles);
        }
    ).catch(err => console.log("err in fetching username",err))
})


//@type     DELETE
//@route    /api/profile/
//@desc     route for deleting user based on id
//@access   PRIVATE
router.delete("/" , passport.authenticate("jwt",{session:false}) , (req,res)=>{
    Profile.findOne({user:req.user.id})
    Profile.findOneAndRemove({user:req.user.id}).then(
        ()=>{
            Person.findOneAndRemove({_id:req.user.id}).then(
                ()=>res.json({success:"delete was success"})
            ).catch(err=>console.log(err))
        }
    ).catch(err => console.log(err))
})

//@type     POST
//@route    /api/profile/workrole
//@desc     route for adding work profile of a person
//@access   PRIVATE
router.post("/workrole" , passport.authenticate("jwt",{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id}).then(
        profile=>{
            //assignment-- give res.json
            const newWork ={
                role: req.body.role,
                company: req.body.company,
                country: req.body.country,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                details: req.body.details
            };
            //pushing object into workrole array
            profile.workrole.push(newWork);
            profile.save().then(
                profile => res.json({profile})
            ).catch(err => console.log(err))
        }
    ).catch(err => console.log(err))
})

//@type     DELETE
//@route    /api/profile/workrole/:w_id
//@desc     route for deleting work role 
//@access   PRIVATE
router.delete("/workrole/:w_id", passport.authenticate("jwt",{session:false}),(req,res)=>{ 
    Profile.findOne({user:req.user.id}).then(
        profile=>{
            //assignment to check if we got a profile
            const removethis = profile.workrole.map(item=>item.id)  //item is an obj containing all workrole
            .indexOf(req.params.w_id); 
            profile.workrole.splice(removethis,1);
            profile.save().then(
                profile=>res.json(profile)
            ).catch(err =>console.log(err))
        }
    ).catch(err =>console.log(err))
})



module.exports=router;