var express=require("express")
var app=express();
app.set("view engine","ejs");
app.use(express.static("public"));

var passport=require("passport");
var localstrategy=require("passport-local");
var passportlocalmongoose=require("passport-local-mongoose");
var expresssession=require("express-session");
var User=require("./models/user");

var methodoverride=require("method-override");
app.use(methodoverride("_method"));

var bodyparser=require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));

var mongoose=require("mongoose");
mongoose.connect("mongodb+srv://Avinash2609:urlencoded@cluster0.qa8fk.mongodb.net/Medilab?retryWrites=true&w=majority", {useNewUrlParser: true});

var flash = require("connect-flash");
app.use(flash());

var campground=require("./models/campground");
var Comment=require("./models/comments");



var indexroutes=require("./routes/index");
var campgroundroutes=require("./routes/campgrounds");
var commentroutes=require("./routes/comments");
var paymentroutes=require("./routes/payment");
// ////////////////////////////////////
// payment gateway////////////////////
/////////////////////////////////////




///////////////////////////////////////
////////////////configuration/////////
app.use(expresssession({
    secret: "can be anything",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentuser=req.user; //req.user contains the info of currently logged in user
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    next();
})


app.use(indexroutes); 
app.use(campgroundroutes);
app.use(commentroutes);
app.use(paymentroutes);




let port = process.env.PORT;
if (port == null || port == "") {
  port = 3001;
}



//////////////////////////////
app.listen(port,function(){
    console.log("server has been started"+ port);
})
