const express = require('express');
const router = express.Router();
const User = require('../model/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const multer = require('multer');
const fs = require('fs/promises');
const file = require('fs');
const path = require('path');
const checkUser = require('../middleware/CheckUser');
const logger = require('../log/logger');


const JWT_SECRET = 's@jidhu$$@in';

//multer
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, 'uploads/')
    },

    filename: function(req,file,cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix+ file.originalname)
    }
})


const upload = multer({storage:storage})


//sign up
router.post('/create',async(req,res)=>{
    try {
        
        //get the data
        const getData = {
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            image:""
        }


        //check the existance
        const checkExistance = await User.findOne({"email":getData.email});

        if(checkExistance){
            logger.error('${req.url} User already present')
            return res.status(400).json({"message":"User Already Present","success":false});
        }

        //password hashing
        const salt = await bcrypt.genSalt(10);
        const securedPassword = await bcrypt.hash(getData.password,salt);

        const finalData = {
            name:getData.name,
            email:getData.email,
            password:securedPassword,
            image:getData.image
        }

        const enterData = new User(finalData);
        const savedData = await enterData.save();

        if(!savedData){
            logger.error(`${req.url} not saved`)
            return res.status(400).json({"message":"Some Error Occured","success":false});
        }

        //return jwt token
        const data = {
            user:{
                id:savedData.id
            }
        }

        const authToken = jwt.sign(data,JWT_SECRET);

        return res.status(200).json({"authToken":authToken,"success":true});
        
    } catch (error) {
        logger.error(`${req.url} ERROR:${error}`)
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})


//login
router.post('/login',async(req,res)=>{
    try {
        
        //get the data
        const getData = {
            email:req.body.email,
            password:req.body.password
        }

        // find the user
        const findUser = await User.findOne({"email":getData.email});

        if(!findUser){
            logger.error(`${req.url} user not found`)
            return res.status(404).json({"message":"Authnticate Using Valid Id and Password","success":false});
        }

        //compare the password
        const comparePassowrd = await bcrypt.compare(getData.password,findUser.password);

        if(!comparePassowrd){
            logger.error(`${req.url} wrong password`)
            return res.status(404).json({"message":"Authnticate Using Valid Id and Password","success":false});
        }

        //set data to set in the request
        const data={
            user:{
                id:findUser.id
            }
        }

        //create the auth token
        const authToken = jwt.sign(data,JWT_SECRET);

        return res.status(200).json({"authToken":authToken,"success":true});
    } catch (error) {
        logger.error(`${req.url} ERROR:${error}`)
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})


router.post('/fetch',checkUser,async(req,res)=>{
    try {
        
        const id = req.user.id;
    
        //fetch the user not but the password
        const findUser = await User.findById(id).select('-password');

        if(!findUser){
            logger.error(`${req.url} User not Found`)
            return res.status(404).json({"message":"User not Found","success":false});
        }

        return res.status(200).json({"data":findUser,"success":true});
    } catch (error) {
        logger.error(`${req.url} ERROR:${error}`)
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})


//this route is to fetch the users
router.get('/find',checkUser,async(req,res)=>{
    try {
        const name = req.query.name ? req.query.name :"";
        const email = req.query.email? req.query.email:"";

        const id = req.user

        //to find the user but not the user who is logged in
        const findUSers = await User.find({"$or":[{"name":{"$regex":name}}, {"email":{"$regex":email}},], "id":{"$ne":id}}).select("-password");


        if(!findUSers){
            logger.error(`${req.url} User not found`)
            return res.status(500).json({"message":"Some Error Occured","success":false})
        }

        return res.status(200).json({"data":findUSers,"success":true})
    } catch (error) {
        logger.error(`${req.url} ERROR:${error}`)
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})


module.exports = router;