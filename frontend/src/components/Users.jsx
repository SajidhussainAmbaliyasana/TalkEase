import React from 'react'
import './style.css'
import { ListItem, ListItemAvatar,ListItemText,Divider,Avatar } from '@mui/material'
import {useDispatch} from 'react-redux'
import { getMessage } from '../store/slices/MessageSlice'
import { setAlert } from '../store/slices/AlertSlice'


const Users = (props) => {

    const dispatch = useDispatch();
    
    const handelMessageClick = async()=>{
        const id = props.id;
        try {
            const response = await dispatch(getMessage(id));
            if(!response.payload.success){
                const alertMessage = {
                    message:response.payload.message,
                    type:error
                }
                dispatch(setAlert(alertMessage));
                return
            }
        } catch (error) {
            console.error(error)
        }
        

    }

    

    return (
        <>
            <ListItem alignItems='flex-start' sx={{alignItems:"center"}} onClick={handelMessageClick}>
                <ListItemAvatar>
                    <Avatar alt={props.name} src='/ss' />
                </ListItemAvatar>
                <ListItemText className='friend'>
                    <p>{props.name}</p>

                </ListItemText>
            </ListItem>
            <Divider />
        </>
    )
}

export default Users
