import React, { useEffect, useState } from 'react'
import './style.css'
import { useSelector, useDispatch } from 'react-redux'
import { Avatar, AvatarGroup, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, ListItem, ListItemAvatar, ListItemText, TextField, Typography, CircularProgress,Skeleton } from '@mui/material'
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { sendGroupMessage, removeMembers, leaveGroup,fetchMembers,addMembers } from '../store/slices/GroupSlice';
import { setAlert } from '../store/slices/AlertSlice';
import GroupMessage from './GroupMessage';
import { addGroupMessage } from '../store/slices/GroupSlice';
import CloseIcon from '@mui/icons-material/Close';
import { deleteGroup } from '../store/slices/GroupSlice';
import { clearGroupChat } from '../store/slices/GroupSlice';

const GroupChatBox = ({ socket }) => {

  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const [sendBtn, setSendBtn] = useState(false);
  const [infoModel, setInfoModel] = useState(false);
  const [userList, setUserList] = useState([]);
  const [deleteModal, setDeleteMoal] = useState(false);
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [removeModal, setRemoveModel] = useState(false);
  const [removeBtn, setRemoveBtn] = useState(false);
  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveBtn, setLeaveBtn] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [members,setMembers] = useState([]);
  const [addBtn,setAddBtn] = useState(false);

  const group = useSelector((state) => { return state.group });
  const user = useSelector((state) => { return state.user });

  //send message
  const handelMessageChange = (event) => {
    setMessage(event.target.value);
  }

  const scrollToBottom = () => {
    const chatContainer = document.querySelector('.message');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

  }

  const handelMessageSend = async () => {
    try {
      if (message === "") {
        const alertMessage = {
          message: "Cannot Send Empty Message",
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        return;
      }

      setSendBtn(true);

      const enterData = {
        id: group.data._id,
        message: message
      }

      const response = await dispatch(sendGroupMessage(enterData));
      if (!response.payload.success) {
        const alertMessage = {
          message: response.payload.message,
          type: "error"
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
    scrollToBottom();
  }


  const handelEnterKey = (event) => {
    if (event.key === "Enter") {
      handelMessageSend();
    }
  }

  //info model
  const handelInfoOpen = () => {
    setInfoModel(true)
  }

  const handelInfoClose = () => {
    setInfoModel(false);
    setUserList([]);
  }

  //remove

  const handelRemoveClose = () => {
    setRemoveModel(false);
  }

  const handelCheckBoxChange = (id) => {
    if (userList.includes(id)) {
      const newMembers = userList.filter((userId) => userId !== id);
      setUserList(newMembers);

    } else {
      let newMembers = userList;
      newMembers.push(id);
      setUserList(newMembers);

    }
  }

  const handelRemoveBtn = () => {
    if (userList.length === 0) {
      const alertMessage = {
        message: "Select Members To Remove",
        type: "error"
      }
      dispatch(setAlert(alertMessage));
      return;
    }

    let groupMembers = group.data.members;
    console.log(groupMembers);

    const updatedMembers = groupMembers.filter((user) => {
      return !userList.includes(user._id)
    })

    console.log(updatedMembers);
    if (updatedMembers.length > 3 ) {
      setRemoveModel(true);
    } else {
      const alertMessage = {
        message: "A group cannot have less than 3 members",
        type: "error"
      }
      dispatch(setAlert(alertMessage));
      return;
    }
  }

  const handelRemoveClick = async () => {
    try {
      setRemoveBtn(true);
      const enterData = {
        id: group.data._id,
        members: userList
      }
      const response = await dispatch(removeMembers(enterData));
      if (!response.payload.success) {
        const alertMessage = {
          message: response.payload.message,
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        setRemoveBtn(false);
        setRemoveModel(false);
        return;
      }
    } catch (error) {
      console.error(error);
      setRemoveBtn(false);
      setRemoveModel(false);
    }
    setRemoveBtn(false);
    setRemoveModel(false);
  }

  //delete group

  const deleteModelOpen = () => {
    setDeleteMoal(true);
  }

  const deleteModelClose = () => {
    setDeleteMoal(false);
  }

  const handelGroupDelete = async () => {
    try {
      setDeleteBtn(true);
      const groupId = group.data._id;
      const response = await dispatch(deleteGroup(groupId));
      if (!response.payload.success) {
        const alertMessage = {
          message: response.payload.message,
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        setDeleteBtn(false);
        return;
      }
    } catch (error) {
      console.error(error);
      setDeleteBtn(false);
    }
    dispatch(clearGroupChat());
    setDeleteBtn(false);
    setDeleteMoal(false);
    setInfoModel(false);
  }

  //leave group

  const handelLeaveClick = () => {
    setLeaveModal(true)
  }

  const leaveClose = () => {
    setLeaveModal(false);
  }

  const handelLeaveSubmit = async () => {
    try {
      setLeaveBtn(true);
      const groupId = group.data._id;
      const response = await dispatch(leaveGroup(groupId));
      if (!response.payload.success) {
        const alertMessage = {
          message: response.payload.message,
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        setLeaveBtn(false);
        return;
      }
    } catch (error) {
      console.error(error);
      setLeaveBtn(false);
    }
    setLeaveBtn(false);
    dispatch(clearGroupChat());
  }


  // add members
  const addOpen = async() => {
    try {
      setAddModal(true)
      const groupId = group.data._id;
      const response = await dispatch(fetchMembers(groupId));
      if (!response.payload.success) {
        const alertMessage = {
          message: response.payload.message,
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }

  const addClose = () => {
    setAddModal(false);
  }

  const handelAddChange = (id) => {
    if (members.includes(id)) {
      const newMembers = members.filter((userId) => userId !== id);
      setMembers(newMembers);

    } else {
      let newMembers = members;
      newMembers.push(id);
      setMembers(newMembers);

    }
  }


  const handelAddSubmit = async()=>{
    try {
      if(members.length === 0){
        const alertMessage = {
          message: "Select Members To Add",
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        return;
      }
      setAddBtn(true);
      const enterData = {
        id:group.data._id,
        members:members
      }
      const response = await dispatch(addMembers(enterData));
      if (!response.payload.success) {
        const alertMessage = {
          message: response.payload.message,
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        setAddBtn(false)
        return;
      }
    } catch (error) { 
      console.error(error)
      setAddBtn(false);
    }
    setAddModal(false);
    setAddBtn(false);
  }

  //socket useeffect
  useEffect(() => {

    scrollToBottom();
    if (socket) {
      socket.on('groupMessage', (message) => {
        //console.log(message);
        dispatch(addGroupMessage(message))
        scrollToBottom();
        //  console.log('this is called');
      })



      return () => {
        socket.off("groupMessage")
      }
    }
  }, [socket])


  //to scroll bottom
  useEffect(() => {
    scrollToBottom();
  }, [group.data.messages])




  return (
    <>

      <Dialog
        open={infoModel}
        onClose={handelInfoClose}
        fullWidth
      >

        <DialogTitle display="flex" className='dialog-title' sx={{ fontSize: "1.7rem" }}>
          <Avatar alt={group.data.groupName} src='/aa' sx={{ marginRight: "1rem" }} />{group.data.groupName}
          <IconButton sx={{ marginLeft: "auto" }} onClick={handelInfoClose}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent dividers className='add-friend-dialog'>
          <Typography className='dialog-title' fontSize="1.5rem">Group Members</Typography>

          {group.data && group.data.members && group.data.members.map((member) => {
            return <ListItem key={member._id} alignItems='flex-start' className='friend-list'>
              <ListItemAvatar>
                <Avatar alt={member.name} src="/ss" sx={{ bgcolor: "#698562" }} />
              </ListItemAvatar>
              <ListItemText className='friend-name'>
                {member.name} <p style={{ marginLeft: "3rem", color: "#536c4d" }}>{group.data.groupAdmin === member._id ? "Group Admin" : undefined}</p>
                {user.data._id === group.data.groupAdmin && group.data.groupAdmin !== member._id ? (
                  <Checkbox color='success' sx={{ marginLeft: "auto" }} onChange={() => handelCheckBoxChange(user._id)} />
                ) : undefined}
              </ListItemText>
            </ListItem>
          })}
        </DialogContent>
        <DialogActions>

          {user.data._id === group.data.groupAdmin ? (
            <>
              <Button color='success' variant='outlined' onClick={handelRemoveBtn}>Remove Members</Button>
              <Button color='success' variant='outlined' onClick={addOpen}>Add Members</Button>
              <Button color='success' variant='outlined' onClick={deleteModelOpen}>Delete Group</Button>
            </>) : (
            <Button color='success' variant='outlined' onClick={handelLeaveClick}>Leave Group</Button>
          )}
          {/* <Button color='success' variant='outlined'>Delete Group</Button> */}
        </DialogActions>

      </Dialog>

      <Dialog
        open={deleteModal}
        onClose={deleteModelClose}
        fullWidth
      >
        <DialogTitle display="flex" className='dialog-title'>
          Are You Sure You Want To Delete
          <IconButton sx={{ marginLeft: "auto" }} onClick={deleteModelClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Button color='error' variant='outlined' sx={{ width: "80%" }} onClick={handelGroupDelete} disabled={deleteBtn}>
            {deleteBtn ? (<CircularProgress color="error" />) : "Delete"}
          </Button>
        </DialogContent>

      </Dialog>

      <Dialog
        open={removeModal}
        onClose={handelRemoveClose}
        fullWidth
      >
        <DialogTitle display="flex" className='dialog-title'>
          Are You Sure You Want To Remove Selected Members
          <IconButton sx={{ marginLeft: "auto" }} onClick={handelRemoveClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Button color='error' variant='outlined' sx={{ width: "80%" }} onClick={handelRemoveClick} disabled={removeBtn}>
            {removeBtn ? (<CircularProgress color="error" />) : "Remove"}
          </Button>
        </DialogContent>

      </Dialog>

      <Dialog
        open={leaveModal}
        onClose={leaveClose}
        fullWidth
      >
        <DialogTitle display="flex" className='dialog-title'>
          Are You Sure You Want To Leave Group
          <IconButton sx={{ marginLeft: "auto" }} onClick={leaveClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Button color='error' variant='outlined' sx={{ width: "80%" }} disabled={leaveBtn} onClick={handelLeaveSubmit}>
            {leaveBtn ? (<CircularProgress color="error" />) : "Leave"}
          </Button>
        </DialogContent>

      </Dialog>

      <Dialog
        open={addModal}
        onClose={addClose}
        fullWidth
      >

        <DialogTitle className='dialog-title' fontSize="1.5rem"> Add Group Members</DialogTitle>
        <IconButton sx={{
          position: 'absolute',
          right: 0,
          marginRight: "1rem",
          marginTop: "1rem",
        }}
          onClick={addClose}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent dividers className='add-friend-dialog'>
          {group.isLoading && (
            <>
            <Skeleton width="100%" height="5rem" />
            <Skeleton width="100%" height="5rem" />
            <Skeleton width="100%" height="5rem" />
            <Skeleton width="100%" height="5rem" />
            <Skeleton width="100%" height="5rem" />
          </>
          )}
          {group.members && group.members.map((user)=>{
            return <ListItem key={user._id} alignItems='flex-start' className='friend-list'>
              <ListItemAvatar>
                <Avatar alt={user.name} src="/ss" sx={{ bgcolor: "#698562" }} />
              </ListItemAvatar>
              <ListItemText className='friend-name'>
                {user.name}
                <Checkbox color='success' sx={{marginLeft:"auto"}} onChange={() => handelAddChange(user._id)}/>
              </ListItemText>
            </ListItem>
          })}
        </DialogContent>

        <DialogActions>
          <Button color='success' variant='outlined' onClick={handelAddSubmit} disabled={addBtn}>
            {addBtn ? (<CircularProgress color='success'/>):"Add Members"}
            
            </Button>
        </DialogActions>

      </Dialog>


      <div className='chat-box'>
        <div className="chat-box-head">
          <AvatarGroup max={4} total={group.data.members.length ? group.data.members.length : 3} className='chat-box-profile' >
            {group.data && group.data.members && group.data.members.map((user) => {
              return <Avatar key={user._id} alt={user.name} src='/aa' sx={{ bgcolor: "#698562" }} />
            })}
          </AvatarGroup>
          <p>{group.data.groupName ? group.data.groupName : "Group"}</p>
          <Button sx={{ marginLeft: "auto", marginRight: "1rem" }} variant='outlined' color='success' onClick={handelInfoOpen}>Group Info</Button>
        </div>
        <div className="chat-box-messages-outer">
          <div className="message">
            {group.data && group.data.messages && group.data.messages.map((message) => {
              return <GroupMessage key={message._id} message={message.message} senderId={message.senderId} userId={group.userId} />
            })}
            {/* <GroupMessage/> */}
          </div>

          <div className="chat-box-message-bottom">
            <TextField name='message' placeholder='Type Message..' className='chat-input' color='success' value={message} onChange={handelMessageChange} autoComplete="off" onKeyDown={handelEnterKey} />
            <IconButton onClick={handelMessageSend} disabled={sendBtn}><SendRoundedIcon /></IconButton>

          </div>
        </div>
      </div>
    </>
  )
}

export default GroupChatBox