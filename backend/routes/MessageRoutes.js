const express = require('express');
const router = express.Router();
const Message = require('../model/MessageModel');
const Chat = require('../model/ChatModel');
const checkUser = require('../middleware/CheckUser');
const User = require('../model/UserModel');
const { getUserSocketId, getIo } = require('../socket');
const logger = require('../log/logger');


// This route is to send a message
router.post('/send/:id', checkUser, async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverID = req.params.id;
    const message = req.body.message;

    if(!senderId || !receiverID){
      logger.error(`${req.url} the userid or the groupid is not fetched`);
      return res.status(404).json({"message":"Id are not found","success":false});
  }

    let isNewChat = false;

    // Check if they have any chat before
    let chat = await Chat.findOne({
      users: { "$all": [senderId, receiverID] }
    });


    // If they are chatting for the first time then create a chat for them first
    if (!chat) {
      chat = await Chat.create({
        users: [senderId, receiverID],
      });
    }


    //if they are writting first message
    if (chat.messages.length === 0) {
      isNewChat = true
    }

    if (!chat) {
      logger.error(`${req.url} chat not created`)
      return res.status(500).json({ "message": "Chat Not Created", "success": false });
    }

    // Create a message
    const messageData = {
      senderId: senderId,
      receiverId: receiverID,
      message: message
    };

    const newMessage = new Message(messageData);

    if (newMessage) {
      chat.messages.push(newMessage._id);
      // console.log(newMessage)
    }

    // Save the chat and message
    await Promise.all([chat.save(), newMessage.save()]);

    // Socket part

    //get the socket id of the receiver
    const socketId = getUserSocketId(receiverID);
    const io = getIo();

    //if the receiver is online send socket
    if (socketId) {
      io.to(socketId).emit("newMessage", newMessage)

      if (isNewChat) {
        io.to(socketId).emit("newChat");
      }

    }



    return res.status(200).json({ "data": newMessage, "success": true });
  } catch (error) {
    logger.error(`${req.url} ERROR:${error}`)
    return res.status(500).json({ "message": "Internal Server Error", "success": false });
  }
});

// This will get all the messages
router.get('/:id', checkUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const anotherId = req.params.id;

    if(!anotherId || !userId){
      logger.error(`${req.url} the userid or the groupid is not fetched`);
      return res.status(404).json({"message":"Id are not found","success":false});
  }

    const conversation = await Chat.findOne({
      users: { "$all": [userId, anotherId] }
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json({ "data": [], "success": true });
    }

    const messages = conversation.messages;

    // Also give the data of the another user
    const getUser = await User.findById(anotherId).select('-password');

    if (!getUser) {
      logger.error(`${req.url} User Not Found`)
      return res.status(500).json({ "message": "User Not Found", "success": false });
    }

    return res.status(200).json({ "data": messages, "user": getUser, "success": true });
  } catch (error) {
    logger.error(`${req.url} ERROR:${error}`);
    return res.status(500).json({ "message": "Internal Server Error", "success": false });
  }
});


//this route is to create an empty chat
router.post('/create/:id', checkUser, async (req, res) => {
  try {

    const senderId = req.user.id;
    const receiverId = req.params.id;

    if(!senderId || !receiverId){
      logger.error(`${req.url} the userid or the groupid is not fetched`);
      return res.status(404).json({"message":"Id are not found","success":false});
  }

    //fetch the user first
    const fetchUser = await User.findById(receiverId);
    if (!fetchUser) {
      logger.error(`${req.url} User not found`)
      return res.status(404).json({ "message": "User Not Found", "success": false });
    }

    //check if chat is already present
    const checkExistance = await Chat.findOne({
      users: { "$all": [senderId, receiverId] }
    })

    if (checkExistance) {
      logger.error(`${req.url} chat already present`);
      return res.status(500).json({ "message": "Chat Already Present", "success": false });
    }

    
    let createChat = await Chat.create({
      users: [senderId, receiverId],
    });

    createChat.save();

    if (!createChat) {
      logger.error(`${req.url} chat not created`)
      return res.status(500).json({ "message": "Chat Not Created", "success": false });
    }

    return res.status(200).json({ "data": createChat, "user": fetchUser, "success": true });


  } catch (error) {
    logger.error(`${req.url} ERROR:${error}`);
    return res.status(500).json({ "message": "Internal Server Error", "success": false });
  }
})





module.exports = router;
