const db = require("../models");
const UserModel = db.users;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            //match user
            const user = await UserModel.findOne({ where: { email: email } });
            if (!user) {
                return done(null, false, { message: 'Email not registered' });
            }
            //math passwords
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            })
        })
    )
    passport.serializeUser((user, done) => {
        done(null, user.id);
    })
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await UserModel.findByPk(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    })
}