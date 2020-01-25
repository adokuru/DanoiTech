require("dotenv").config();
const compression = require("compression");
const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const feed = require("feed-read");
const redirectToHTTPS = require("express-http-to-https").redirectToHTTPS;

const app = express();
app.use(compression());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.use(bodyParser.json());
app.use(
	bodyParser.json({
		type: "application/vnd.api+json"
	})
);

app.use(
	session({
		secret: "Our little secret.",
		resave: false,
		saveUninitialized: false
	})
);

app.use(passport.initialize());
app.use(passport.session());
mongoose
	.connect(process.env.DB, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false
	})
	.then(() => console.log("DB Connected!"))
	.catch(err => {
		console.log(err);
	});
app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/], 301));
const userSchema = new mongoose.Schema({
	email: String,
	password: String,
	googleId: String,
	secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: "/auth/google/secrets",
			userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
		},
		function(accessToken, refreshToken, profile, cb) {
			console.log(profile);

			User.findOrCreate({ googleId: profile.id }, function(err, user) {
				return cb(err, user);
			});
		}
	)
);
const img = [
	{ img: "blog-1.jpg" },
	{ img: "blog-2.jpg" },
	{ img: "blog-3.jpg" },
	{ img: "blog-4.jpg" },
	{ img: "blog-6.jpg" },
	{ img: "blog-7.jpg" }
];

let transporter = nodemailer.createTransport({
	host: "smtpout.secureserver.net",
	port: 465,
	secure: true,
	auth: {
		user: process.env.email,
		pass: process.env.password
	}
});
