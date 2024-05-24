import React, { useState } from 'react'
import './style.css'
import { Avatar, TextField, IconButton } from '@mui/material'
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useSelector } from 'react-redux'
import Message from './Message';
import {useDispatch} from 'react-redux'
import { sendMessage } from '../store/slices/MessageSlice';
import { setAlert } from '../store/slices/AlertSlice';


const ChatBox = () => {

  const [chat,setChat] = useState('');
  const user = useSelector((state) => { return state.user })
  const message = useSelector((state) =>{return state.message});
  const [sendBtn,setSendBtn] = useState(false);

  const dispatch = useDispatch();


  const handelChatChange =  (event)=>{
    setChat(event.target.value)
  }

  const handelMessageSend = async()=>{
    try {
      setSendBtn(true);
      const id = message.user._id
      if(!id){
        console.log("id Not Found")
        setSendBtn(false);
        setChat('');
        return;
      }
      const enterData={
        id:id,
        message:chat
      }
      const response = await dispatch(sendMessage(enterData));
      if(!response.payload.success){
        const alertMessage = {
          message:response.payload.message,
          type:"error"
        }
        dispatch(setAlert(alertMessage));
        setSendBtn(false);
        setChat('');
        return;
      }
    } catch (error) {
      setSendBtn(false);
      setChat('');
      console.error(error);
    }
    setSendBtn(false);
    setChat('');
  }

  return (
    <div className="chat-box">
      <div className="chat-box-head">
        <Avatar alt={message.user.name ?message.user.name:"user"} src="/stg" className='chat-box-profile' />
        <p>{message.user.name ? message.user.name:"user" }</p>
      </div>
      <div className="chat-box-messages-outer">
        <div className="message">
         
          {message && message.data && message.data.map((message)=>{
            return <Message key={message._id} message={message.message} userId={user.data._id} senderId={message.senderId} 
            receiverId={message.receiverId}/>
          })} 
          
        </div>

        <div className="chat-box-message-bottom">
          <TextField name='message' placeholder='Type Message..' className='chat-input' color='success' value={chat} 
          onChange={handelChatChange}/>
          <IconButton  disabled={sendBtn} onClick={handelMessageSend}><SendRoundedIcon /></IconButton>

        </div>
      </div>
    </div>
  )
}

export default ChatBox
