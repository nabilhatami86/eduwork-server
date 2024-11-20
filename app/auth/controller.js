const User = require ('../user/model');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const getToken  = require('../../utils/getToken')


const register = async (req, res, next) => {
    try {
        const payload = req.body;
        let user = new User(payload);
        await user.save();
        res.json(user);
    } catch (err) {
        console.error("Error during registration:", err);
        if (err.name === "ValidationError") {
            return res.status(400).json({
                error: 1,
                message: err.message,
                fields: err.errors,
            });
        }
        next(err);
    }
};

const localStrategy = async (email, password, done) => {
    try {
        console.log("Incoming email:", email); 
        let user = await User.findOne({ email }).select('-__v -createdAt -updatedAt -cart_items -token');
        console.log("User found:", user); 

        if (!user) return done(null, false);

        const isMatch = bcrypt.compareSync(password, user.password);
        if (isMatch) {
            const { password, ...userWithoutPassword } = user.toJSON();
            return done(null, userWithoutPassword);
        } else {
            return done(null, false);
        }
    } catch (err) {
        console.error("Error in localStrategy:", err); 
        done(err, null);
    }
};




const login = async (req, res, next) => {
    passport.authenticate('local', async function(err, user) {
        console.log("Secret Key:", config.secretKey);
    
        if (err) return next(err);
    
        if (!user) {
            return res.json({ error: 1, message: 'Email or Password Incorrect' });
        }
    
        let signed = jwt.sign(user, config.secretKey);
        
    
        await User.findByIdAndUpdate(user._id, { $push: { token: signed } });
    
        console.log("Login successful:", { user, token: signed });
        res.json({
            message: 'Login Successfully',
            user,
            token: signed
        });
    })(req, res, next);
    
};

const logout = (req, res, next) => {
    let token = getToken(req);

    let user = User.findOneAndUpdate(
        { token: { $in: [token] } },
        { $pull: { token: token } },
        { useFindAndModify: false }
    );

    if (!token || !user) {
        return res.json({
            error: 1,
            message: 'No User Found!!!'
        });
    }

    return res.json({
        error: 0,
        message: 'Logout berhasil'
    });
};


const me = (req, res, next) => {

    if (!req.user) {
        return res.json({ error: 1, message: 'You are not logged in or token expired' });
    }

    console.log("User data:", req.user);

    res.json(req.user);
};


module.exports = {
    me,
    register,
    localStrategy,
    login,
    logout
}