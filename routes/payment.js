var express=require("express");
var passport=require("passport");
var campground=require("../models/campground");
var middleware = require("../middleware/index");
var router=express.Router({mergeParams: true});


const checksum_lib=require("../paytm/checksum/checksum");


router.get("/campgrounds/:id/payment",middleware.isloggedin,function(req,res){
    let params={}
    // params['MID']='PafhkC08108295167919',
    params['MID']='wErUkK40798264521525',
    params['WEBSITE']='DEFAULT',
    params['CHANNEL_ID']='WEB',
    params['INDUSTRY_TYPE_ID']='Retail',
    params['ORDER_ID']="Merchant"+Math.random().toString(36).substring(2,15),
    params['CUST_ID']=String(req.user.username)+Math.random().toString(36).substring(2,15),
    params['TXN_AMOUNT']='1',
     //params['CALLBACK_URL']='http://localhost:3001/campgrounds/' + req.params.id +'/status/' + params['ORDER_ID'],
    params['CALLBACK_URL']='https://avinashjindal2510.herokuapp.com/campgrounds/' + req.params.id +'/status/' + params['ORDER_ID'],
    params['EMAIL']='ajindal_be18@thapar.edu',
    params['MOBILE_NO']='9050995986'

    // checksum_lib.genchecksum(params,'_IFq1ytY9gWQ&8jZ',function(err,checksum){
        checksum_lib.genchecksum(params,'RyS29!4Q65GYcgN_',function(err,checksum){
        // let txn_url="https://securegw.paytm.in/order/process"
        let txn_url="https://securegw-stage.paytm.in/order/process"
        let form_fields=""

        for(x in params)
        {
            form_fields += "<input type='hidden' name='"+x+"' value='"+params[x]+"'/>"
        }

        form_fields += "<input type='hidden' name='CHECKSUMHASH' value='"+checksum+"'/>"

        var html='<html><body><center><h1>Please wait! Do not refresh the page</h1></center><form method="post" action="'+txn_url+'" name="f1">'+form_fields +'</form><script type="text/javascript">document.f1.submit()</script></body></html>'
        res.writeHead(200,{'Content-Type': 'text/html'})
        res.write(html)

    })
});

//////////////////////////////////////////////payment

router.post("/campgrounds/:id/status/:id1", middleware.isloggedin ,function(req,res){
    campground.findById(req.params.id, function(err, foundcampground){
        if(err){
            req.flash("error", err);
            res.redirect("/campgrounds");
        }
        else{
            foundcampground.txn_id=req.body.TXNID;
            foundcampground.btxn_id=req.body.BANKTXNID;
            foundcampground.save();
            console.log(foundcampground);
            res.render("campgrounds/payment",{campground: foundcampground,details: req.body});
        }
    })
    
    req.flash("success", "Your appointment request has been sent successfully. Thank you!");
    
})

module.exports = router;