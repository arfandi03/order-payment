const express = require("express");
const cors = require("cors");
const expressLayout = require("express-ejs-layouts");
const db = require("./app/models");
const routes = require("./app/routes");
const { ensureAuthenticated } = require("./app/middleware/auth.js")


const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const passport = require("passport");
//passport config:
require('./app/config/passport')(passport)

const app = express();
const corsOptions = {
    origin: "http://localhost:3001"
};

db.sequelize.sync();
db.sequelize.sync({ force: false }).then(() => {
    console.log("Drop and re-sync db.");
});

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.set("views", "./app/views")
app.set("view engine", "ejs");
app.use(expressLayout);

// app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: 1000*60*60 }, // one hour
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

app.use("/", routes.user);
app.use("/order", ensureAuthenticated, routes.order);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});