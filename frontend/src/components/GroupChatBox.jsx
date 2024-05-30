import React, { useEffect, useState } from 'react'
import './style.css'
import { useSelector ,useDispatch} from 'react-redux'
import { Avatar, AvatarGroup, IconButton, TextField } from '@mui/material'
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { sendGroupMessage } from '../store/slices/GroupSlice';
import { setAlert } from '../store/slices/AlertSlice';
import GroupMessage from './GroupMessage';
import { addGroupMessage } from '../store/slices/GroupSlice';

const GroupChatBox = ({socket}) => {

    const [message,setMessage] = useState('');
    const dispatch = useDispatch();
    const [sendBtn,setSendBtn] = useState(false);

    const group = useSelector((state)=>{return state.group})

    //send message
    const handelMessageChange = (event)=>{
        setMessage(event.target.value);
    }

    const handelMessageSend = async()=>{
      try {
        if(message === ""){
          const alertMessage = {
            message:"Cannot Send Empty Message",
            type:"error"
          }
          dispatch(setAlert(alertMessage));
          return;
        }

        setSendBtn(true);

        const enterData ={
          id:group.data._id,
          message:message
        }

        const response = await dispatch(sendGroupMessage(enterData));
        if(!response.payload.success){
          const alertMessage = {
            message:response.payload.message,
            type:"error"
          }
          dispatch(setAlert(alertMessage));
          setSendBtn(false);
          setMessage("");
          return;
        }
        setSendBtn(false);
        setMessage('');
      } catch (error) {
        setSendBtn(false);
        console.error(error)
      }

      setSendBtn(false);
    }


    //socket useeffect
    useEffect(()=>{

      if(socket){
        socket.on('groupMessage',(message)=>{
          //console.log(message);
          dispatch(addGroupMessage(message))
        })

        return  ()=>{
          socket.off("groupMessage")
        }
      }
    },[socket])

  return (
    <div className='chat-box'>
      <div className="chat-box-head">
        <AvatarGroup max={3} total={group.data.members.length?group.data.members.length:3} className='chat-box-profile' >
            <Avatar alt={group.data.members[0].name? group.data.members[0].name:"user"} src='/aa' sx={{ bgcolor: "#698562" }}/>
            <Avatar alt={group.data.members[1].name?group.data.members[1].name:"user"} src='/aa' sx={{ bgcolor: "#698562" }}/>
            <Avatar alt={group.data.members[2].name?group.data.members[2].name:"users"} src='/aa' sx={{ bgcolor: "#698562" }}/>
        </AvatarGroup>
        <p>{group.data.groupName?group.data.groupName:"Group"}</p>
      </div>
      <div className="chat-box-messages-outer">
        <div className="message">
         {group.data && group.data.messages && group.data.messages.map((message)=>{
          return <GroupMessage key={message._id}  message={message.message} senderId={message.senderId} userId={group.userId}/>
         })}
         {/* <GroupMessage/> */}
        </div>

        <div className="chat-box-message-bottom">
          <TextField name='message' placeholder='Type Message..' className='chat-input' color='success' value={message} onChange={handelMessageChange} autoComplete="off"/>
          <IconButton  onClick={handelMessageSend} disabled={sendBtn}><SendRoundedIcon /></IconButton>

        </div>
      </div>
    </div>
  )
}

export default GroupChatBox
