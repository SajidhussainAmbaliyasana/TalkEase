import React from 'react'
import './style.css'
import { Avatar,  Divider, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import {useDispatch} from 'react-redux'
import { fetchGroupChats } from '../store/slices/GroupSlice'
import { setAlert } from '../store/slices/AlertSlice'
import { clearMessage } from '../store/slices/MessageSlice'

const Groups = (props) => {


  const dispatch = useDispatch();

  const handelGroupClick = async()=>{
    try {
      const groupId = props.id;
      dispatch(clearMessage());
      const response = await dispatch(fetchGroupChats(groupId));
      if(!response.payload.success){
        const alertMessage = {
          message:response.payload.message,
          type:"error"
        }
        dispatch(setAlert(alertMessage));
        return
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
    <ListItem alignItems='flex-start' sx={{ alignItems: "center" }} onClick={handelGroupClick} className='group-list'>
        <ListItemAvatar>
            <Avatar alt={props.name} src='/ss'sx={{ bgcolor: "#698562" }}/>
        </ListItemAvatar>
        <ListItemText className='friend'>
            <p>{props.name}</p>
        </ListItemText>
    </ListItem>
    <Divider/>
    </>
  )
}

export default Groups
