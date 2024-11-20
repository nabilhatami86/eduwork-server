const { getToken, policyFor } = require('../../utils/getToken'); 
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../user/model');

function decodeToken() {
    return async function (req, res, next) {
        try {
            let token = getToken(req);
            console.log("Token:", token); // Log token

            if (!token) return next(); // Jika tidak ada token, lanjutkan

            req.user = jwt.verify(token, config.secretKey);
            console.log("Decoded user:", req.user); // Log user yang terdecode

            let user = await User.findOne({ token: { $in: [token] } });
            console.log("User from DB:", user);

            if (!user) {
                return res.status(401).json({
                    error: 1,
                    message: 'Token Expired'
                });
            }
            next();
        } catch (err) {
            console.error("Decode Token Error:", err); // Log error decoding
            if (err && err.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    error: 1,
                    message: err.message
                });
            }
            next(err);
        }
    };
}


//middleware untuk cek  hak akses
function police_check(action, subject) {
    return function (req, res, next) {
        console.log("User in police_check:", req.user); // Log user
        let policy = policyFor(req.user);
        console.log("Policy:", policy); // Log kebijakan akses

        if (!policy.can(action, subject)) {
            console.error(`Access denied for ${action} on ${subject}`);
            return res.status(403).json({
                error: 1,
                message: `You are not allowed to ${action} ${subject}`
            });
        }
        next();
    };
}



module.exports = { 
    decodeToken,
    police_check 
};
