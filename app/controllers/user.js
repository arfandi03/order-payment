const db = require("../models");
const User = db.users;
const { validationResult } = require("express-validator");
const bcrypt = require('bcrypt');

// Create and save a new user
exports.register = (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render("user/register", {
            layout: "layouts",
            title: "Register Page",
            errors: errors.array()
        });
    } else {
        try {
            //hash password
            bcrypt.genSalt(10,
                (err, salt) => bcrypt.hash(req.body.password, salt,
                    async (err, hash) => {
                        if (err) throw err;
                        //save pass to hash
                        req.body.password = hash;
                        await User.create(req.body);
                        req.flash("success_msg", "User added successfully");
                        res.redirect('/login');
                    }
                )
            );
        } catch (err) {
            req.flash("error_msg", "Ups! Something went wrong!");
            res.redirect('/register');
        }
    }
};

exports.login = (req, res, next) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render("user/login", {
            layout: "layouts",
            title: "Login Page",
            errors: errors.array()
        });
    }else{
        next();
    }

};