//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const feed = require("feed-read");

const app = express();

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

app.get("/", function(req, res) {
	let medium = "https://medium.com/feed/@njaustevedomino";
	feed(medium, function(err, posts) {
		if (err) {
			res.send(err);
			//res.render("home", { posts: posts, images: img });
		} else {
			res.render("home", { posts: posts, images: img });
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

app.get("/about", function(req, res) {
	res.render("about");
});
app.get("/login", function(req, res) {
	res.render("login");
});

app.get("/register", function(req, res) {
	res.render("register");
});

app.get("/secrets", function(req, res) {
	User.find({ secret: { $ne: null } }, function(err, foundUsers) {
		if (err) {
			console.log(err);
		} else {
			if (foundUsers) {
				res.render("secrets", { usersWithSecrets: foundUsers });
			}
		}
	});
});

app.get("/submit", function(req, res) {
	if (req.isAuthenticated()) {
		res.render("submit");
	} else {
		res.redirect("/login");
	}
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
app.get("/medium", function(req, res) {});

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
app.post("/", function(req, res) {
	let email = req.body.EmailName;
	let options = {
		url = "https://us20.api.mailchimp.com/3.0/lists/" + process.env.MCLIST,
		method: "POST",
	}
	request(options, function(error, response, body){
		if (error) {
			console.log(error);
		}else{
			res.json(response.statusCode);
		}
	});
});

app.listen(process.env.PORT || 3000, function() {
	console.log("Server started on port 3000 or " + process.env.PORT);
});
