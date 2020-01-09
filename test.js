//jshint esversion:6
//jshint esversion:6
/////////////////////////////////required declarations////////////////////////////////////////////////////////////////////////////////
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");

///////////////////////////////// declarations////////////////////////////////////////////////////////////////////////////////
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("trust proxy", 1);
app.use(
	session({
		secret: "My day is just bad.",
		resave: false,
		saveUninitialized: true,
		cookie: { secure: true }
	})
);
app.use(passport.initialize());
app.use(passport.session());
//////////////////////////////////DBConnection///////////////////////////////////////////////////////////////////////////////

mongoose
	.connect("mongodb://localhost:27017/SercetDB", {
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false
	})
	.then(() => console.log("DB Connected!"))
	.catch(err => {
		console.log(err);
	});

const userSchema = new mongoose.Schema({
	email: String,
	password: String
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/", function(req, res) {
	res.render("home");
});
app.get("/login", function(req, res) {
	res.render("login");
});
app.post("/login", function(req, res) {});
app.get("/register", function(req, res) {
	res.render("register");
});
app.post("/register", function(req, res) {});

app.get("/submit", function(req, res) {
	res.render("submit");
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(process.env.PORT || 3000, function() {
	console.log("Server started on port 3000 or " + process.env.PORT);
});
