//jshint esversion:6
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

/////////////////////////////////////////////////////////////////////////////////////////

app.get("/*", function(req, res, next) {
	if (req.url.indexOf("/assets/") === 0) {
		res.setHeader("Cache-Control", "public, max-age=2592000");
		res.setHeader(
			"Expires",
			new Date(Date.now() + 2592000000).toUTCString()
		);
	}
	next();
});

app.get("/", function(req, res) {
	let medium = "https://medium.com/feed/@danoitech";
	feed(medium, function(err, posts) {
		if (err) {
			res.render("home", { title: "Home", posts: 0, isadded: false });
			//res.render("home", { posts: posts, images: img });
		} else {
			res.render("home", {
				title: "Home",
				posts: posts,
				images: img,
				isadded: false
			});
		}
	});
});

app.get("/index.html", function(req, res) {
	let medium = "https://medium.com/feed/@danoitech";
	feed(medium, function(err, posts) {
		if (err) {
			res.render("home", { title: "Home", posts: 0, isadded: false });
			//res.render("home", { posts: posts, images: img });
		} else {
			res.render("home", {
				title: "Home",
				posts: posts,
				images: img,
				isadded: false
			});
		}
	});
});
app.get("/about", function(req, res) {
	res.render("about", { title: "About Us" });
});
app.get("/contact", function(req, res) {
	res.render("contact", { title: "Contact Us" });
});
app.get("/offline.html", function(req, res) {
	res.render("offline");
});
app.get("/offline", function(req, res) {
	res.render("offline");
});
app.get("/404", function(req, res) {
	res.render("404");
});
app.get("/404.html", function(req, res) {
	res.render("404");
});
app.get("/services", function(req, res) {
	res.render("services", { title: "Services" });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/submit", function(req, res) {
	if (req.isAuthenticated()) {
		res.render("submit");
	} else {
		res.redirect("/login");
	}
});
app.get("/login", function(req, res) {
	res.render("login");
});

app.get("/register", function(req, res) {
	res.render("register");
});

app.post("/submit", function(req, res) {
	const submittedSecret = req.body.secret;

	//Once the user is authenticated and their session gets saved, their user details are saved to req.user.
	// console.log(req.user.id);

	User.findById(req.user.id, function(err, foundUser) {
		if (err) {
			console.log(err);
		} else {
			if (foundUser) {
				foundUser.secret = submittedSecret;
				foundUser.save(function() {
					res.redirect("/secrets");
				});
			}
		}
	});
});

app.get("/logout", function(req, res) {
	req.logout();
	res.redirect("/");
});
app.post("/register", function(req, res) {
	User.register({ username: req.body.username }, req.body.password, function(
		err,
		user
	) {
		if (err) {
			console.log(err);
			res.redirect("/register");
		} else {
			passport.authenticate("local")(req, res, function() {
				res.redirect("/secrets");
			});
		}
	});
});

app.post("/login", function(req, res) {
	const user = new User({
		username: req.body.username,
		password: req.body.password
	});

	req.login(user, function(err) {
		if (err) {
			console.log(err);
		} else {
			passport.authenticate("local")(req, res, function() {
				res.redirect("/secrets");
			});
		}
	});
});
app.post("/subscribed", function(req, res) {
	let nsemail = req.body.EmailName;

	let data = {
		members: [
			{
				email_address: nsemail,
				status: "subscribed"
			}
		]
	};
	let jsonData = JSON.stringify(data);
	let options = {
		url: process.env.MCLIST,
		method: "POST",
		headers: {
			Authorization: "danoitech " + process.env.MCAPI
		},
		body: jsonData
	};
	request(options, function(error, response, body) {
		console.log(options);
		if (error) {
			console.log(error);
		} else {
			if (response.statusCode === 200) {
				console.log(response.statusCode);
				res.render("subscribed");
			} else {
				res.send("<a>Home</a>");
			}
		}
	});
});

app.post("/quote", function(req, res) {
	let fromemail = req.body.femail;

	let fromname = req.body.fname;

	let subject = req.body.subject;

	let bodymail = req.body.message;

	let mailOptions = {
		from: fromemail,
		to: "info@danoitech.com",
		subject: subject,
		text: fromname + "              " + bodymail
	};
	transporter.sendMail(mailOptions, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			res.render("quote");
		}
	});
});
app.get(
	"/auth/google",
	passport.authenticate("google", { scope: ["profile"] })
);

app.get(
	"/auth/google/secrets",
	passport.authenticate("google", { failureRedirect: "/login" }),
	function(req, res) {
		// Successful authentication, redirect to secrets.
		res.redirect("/secrets");
	}
);
/////////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(process.env.PORT || 3000, function() {
	console.log("Server started on port 3000 or " + process.env.PORT);
});
