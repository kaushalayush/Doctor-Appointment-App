var express=require("express");
var router=express.Router({mergeParams: true});
var campground=require("../models/campground");
var middleware = require("../middleware/index");
var mongoose=require("mongoose");
const { all } = require(".");

router.get("/campgrounds",function(req,res){
    campground.find({},function(err,allcampgrounds){
        if(err){
            req.flash("error", err);
        } else{
            allcampgrounds.forEach(function(got){
                if(got.btxn_id==""){
                    console.log(got.name);
                    campground.findByIdAndRemove(got._id,function(err){
                        if(err){
                            req.flash("error", err);
                        }
                        else{
                            console.log("item deleted");
                        }
                    })    
                }
            })

            res.render("campgrounds/index",{campgrounds:allcampgrounds, currentuser: req.user});
        }
    })
})

// ==================================================new route
router.get("/campgrounds/new", middleware.isloggedin ,function(req,res){
    res.render("campgrounds/new");
})


router.post("/campgrounds", middleware.isloggedin ,function(req,res){
    
    var myauthor={
        id: req.user.id,
        username: req.user.username
    };

    campground.create(req.body.campground , function(err,camp){
        if(err){
            req.flash("error", err);
        } else{
            camp.author=myauthor;
            camp.btxn_id="";
            camp.save();
            console.log(camp);

            campground.find({},function(err,allcampgrounds){
                if(err){
                    req.flash("error", err);
                } else{
                    res.render("campgrounds/slot",{camp: camp, allcamps: allcampgrounds});
                }
            })
        }
    })
})

router.post("/campgrounds/:id/slot", middleware.isloggedin ,function(req,res){
    campground.findById(req.params.id, function(err, foundcampground){
        if(err){
            req.flash("error", err);
            res.redirect("/campgrounds");
        }
        else{
            foundcampground.slot=req.body.slot;
            foundcampground.save();
            console.log(foundcampground);
            if(foundcampground.btxn_id == ""){
            res.redirect("/campgrounds/" + req.params.id +"/payment");
            } else {
                res.redirect("/campgrounds/" + foundcampground._id);
            }
        }
    })
    
    req.flash("success", "Your appointment request has been sent successfully. Thank you!");
    
})

// ===========================================show

router.get("/campgrounds/:id",function(req,res){
    campground.findById(req.params.id).populate("comments").exec(function(err, foundcampground){
        if(err){
            req.flash("error", err);
        }
        else{
            res.render("campgrounds/show",{campground: foundcampground} );
        }
    })
})

// ==============================================edit
router.get("/campgrounds/:id/edit", middleware.checkcampownership ,function(req,res){
    campground.findById(req.params.id, function(err, foundcampground){
        if(err){
            req.flash("error", err);
            res.redirect("/campgrounds");
        }
        else{
            res.render("campgrounds/edit",{campground: foundcampground} );
        }
    })
})

router.put("/campgrounds/:id", middleware.checkcampownership ,function(req,res){
    campground.findByIdAndUpdate(req.params.id,req.body.campground ,function(err, updatedcampground){
        if(err){
            req.flash("error", err);
            res.redirect("/campgrounds");
        }
        else{
            updatedcampground.save();
            updatedcampground.slot="";
            campground.find({},function(err,allcampgrounds){
                if(err){
                    req.flash("error", err);
                } else{
            res.render("campgrounds/slot",{camp: updatedcampground, allcamps: allcampgrounds});
                }
            })
        }
    })
})


// ========================================delete
router.delete("/campgrounds/:id", middleware.checkcampownership ,function(req,res){
    campground.findByIdAndRemove(req.params.id ,function(err){
        if(err){
            req.flash("error", err);
            res.redirect("/campgrounds");
        }
        else{
            req.flash("success", "Successfully campground is deleted");
            res.redirect("/campgrounds");
        }
    })
})

module.exports = router;