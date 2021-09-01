const user = require("../controllers/user");
const router = require("express").Router();
const db = require("../models");
const UserModel = db.users;
const { body, check } = require("express-validator")
const passport = require('passport');


// Login Page
router.get("/", (req, res) => {
    res.redirect("/login");
});
// Login Page
router.get("/login", (req, res) => {
    res.render("user/login", {
        layout: "layouts",
        title: "Login Page"
    });
});
// Login action
router.post("/login", [
    check("email", "Email must contain a valid email address").isEmail(),
    check("password", "Password must be at least 6 characters long").isLength({ min: 6 })
], (req, res, next) => {
    user.login(req, res, next);
}, (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/order',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next)
});
// Register Page
router.get("/register", (req, res) => {
    res.render("user/register", {
        layout: "layouts",
        title: "Register Page"
    });
});
// Register action
router.post("/register", [
    check("name", "Name is required").notEmpty(),
    check("email", "Email must contain a valid email address").isEmail(),
    check("password", "Password must be at least 6 characters long").isLength({ min: 6 }),
    check("email").custom(async (value) => {
        const email = await UserModel.findOne({ where: { email: value } });
        if (email) {
            throw new Error('E-mail already in use');
        }
        return true;
    })
], (req, res) => {
    user.register(req, res);
});
// Logout action
router.get("/logout", (req, res) => {
    req.logout();
    req.flash('success_msg', 'Now logged out');
    res.redirect('/user/login');
});


module.exports = router;