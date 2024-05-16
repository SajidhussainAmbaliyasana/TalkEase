const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const checkUser = async(req,res,next)=>{
    try {
        
        const token = req.header('authToken');

        if(!token){
            return res.status(400).json({"message":"Authenticate Using Valid token","success":false});
        }

        const data = jwt.verify(token,JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        console.error(error);
    }
}

module.exports = checkUser;