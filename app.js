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
		} else {
			res.render("home", {
				title: "Home",
				posts: posts,
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
		} else {
			res.render("home", {
				title: "Home",
				posts: posts,
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
			res.send("error occured try again later");
		} else {
			if (response.statusCode === 200) {
				console.log(response.statusCode);
				res.send("Email subscribed");
			} else {
				res.send("Not subscribed try again later");
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
			res.send("Quote Failed try again later");
		} else {
			res.send("Quote Sent successfully");
		}
	});
});

/////////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(process.env.PORT || 3000, function() {
	console.log("Server started on port 3000 or " + process.env.PORT);
});
