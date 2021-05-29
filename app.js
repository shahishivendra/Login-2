//jshint esversion:6
require('dotenv').config();
const express =  require("express");
const bodyParser = require("body-parser");
const https = require("https");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")
var path = require('path')
const app=express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/views/partials")));
app.use(express.static(path.join(__dirname, "/views")));
app.set('view engine','ejs');
app.use(bodyParser.json());
////*   Connecting to database!!   *//////
const uri  = "mongodb://localhost:27017/UserDetails";
mongoose.connect(uri,{useNewUrlParser: true, useUnifiedTopology: true})
// const uri =  "mongodb://localhost:27017/UserDetails";
// mongoose.connect(uri,{useNewUrlParser: true})
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String

});

userSchema.plugin(encrypt,{secret: process.env.SECRET, encryptedFields: ["password"] });
const User = mongoose.model("User",userSchema);
//////// Mongod code ending... /////////

//////// Creating register route /////////
app.route("/register")
.get(function(req,res){
  console.log("register page");
  res.render("register");
})
.post(function(req,res){
  var email=req.body.email;
  var password=req.body.password;
  var name = req.body.name;

  const user_name = new User({
    name: name,
    email: email,
    password: password
  });

  User.findOne({email: email},function(err,result){
    if(err){
      console.log(err);
      res.send(err);
    }
    if(result) res.render("messages",{title : "Cant Register", message: "Id Already Exists! Click to login"});
    else{
      user_name.save(function(err){
        if(err) res.send(err);
        res.render("messages",{title : "Registered", message: "Proceed to Login!!"});
      });
    }
  });
});

///////// ending the register route!!!! ////////

///////// creating login route....... ////////
app.route("/login")
.get(function(req,res){
  res.render("login");
})
.post(function(req,res){
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({email:email},function(err,result){
    if(err) res.send(err);
    if(result) {
      if(result.password === password){
        res.render("secrets");
      }
    }
    res.render("messages",{title: "Cant Login", message: "Wrong email or password!!"});
  });

})
app.get("/",function(req,res){
  console.log("HOME PAGE");
  res.render("home");
});


app.listen(1337,function(){
  console.log("server runnning at 1337")
});
