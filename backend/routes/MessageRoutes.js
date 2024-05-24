const express = require('express');
const router = express.Router();
const Message = require('../model/MessageModel');
const Chat = require('../model/ChatModel')
const checkUser = require('../middleware/CheckUser');
const User = require('../model/UserModel')

//this route is to send a message
router.post('/send/:id',checkUser,async(req,res)=>{
    try {
        
        //here we are taking the sender id the reciver id and the message
        const senderId = req.user.id;
        const receiverID = req.params.id;
        const message = req.body.message


        //here we are checking that is they have any chat befor
        let chat = await Chat.findOne({
            users:{"$all" :[senderId,receiverID]}
        })

        //if they are chatting for the first time then create a chat for them first
        if(!chat){
           chat = await Chat.create({
                users:[senderId,receiverID],
           })
        }

        if(!chat){
            return res.status(500).json({"message":"Chat Not Created","success":false});
        }

        //now when the chat is created we will create a message of both of them
        const messageData = {
            senderId:senderId,
            receiverId:receiverID,
            message:message
        }

        
        const newMessage = new Message(messageData)

        if(newMessage){
            chat.messages.push(newMessage._id);
            //console.log(newMessage)
        }

        
        //after creating all the message and chat we will save them
        // await chat.save();
        // await newMessage.save();
        //rather than doing this we will the below thing done which will run both the process together

        await Promise.all([chat.save(), newMessage.save()])

        return res.status(200).json({"data":newMessage,"success":true})

        
    } catch (error) {
        console.error(`From /send ${error}`);
        return res.status(500).json({"message":"Internal Server Error","success":false})
    }
})


//this will get all the messages
router.get('/:id',checkUser,async(req,res)=>{
    try {
        
        const userId = req.user.id;
        const anotherId = req.params.id;

        const conversation = await Chat.findOne({
            users:{"$all":[userId,anotherId]}
        }).populate("messages") // so by using the populate we will get the whole object not only the id

        if(!conversation){
            return res.status(200).json({"data":[],"success":true})
        }

        const messages = conversation.messages
       
        //also give the data of the another user
        const getUser = await User.findById(anotherId).select('-password');


        if(!getUser){
           
            return res.status(500).json({"message":"User Not Found","success":false});
        }

       
        return res.status(200).json({"data":messages,"user":getUser,"success":true})

    } catch (error) {
        console.error(`From / ${error}`);
        return res.status(500).json({"message":"Internal Server Error","success":false})
    }
})

module.exports = router;