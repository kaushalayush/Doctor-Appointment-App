var express=require("express");
var passport=require("passport");

var router=express.Router({mergeParams: true});
var User=require("../models/user");

router.get("/",function(req,res){
    res.render("partials/landingpage");
})


router.get("/register", function(req,res){
    res.render("auth_files/register");
})

router.post("/register", function(req,res){
    User.register(new User({username: req.body.username, password: req.body.password }), req.body.password, function(err, registereduser){
        if(err){
            req.flash("error", err);
            return res.render("auth_files/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome!!! you are successfully Registered as " + registereduser.username);
            res.redirect("/campgrounds");
        })
    })
})

router.get("/login", function(req,res){
    res.render("auth_files/login");
})

router.post("/login", passport.authenticate("local",{
    failureRedirect: "/login"
}) ,function(req,res){
    req.flash("success", "Welcome!!! you are successfully Logged In as " + req.user.username);
    res.redirect("/campgrounds")
})

router.get("/logout",function(req,res){
    req.flash("success", "Thank you!!! you are successfully Logged Out");
    req.logOut();
    res.redirect("/campgrounds");
})

module.exports = router;