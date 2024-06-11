import React, { useEffect } from 'react'
import './style.css'
import { ListItem, ListItemAvatar, ListItemText, Divider, Avatar } from '@mui/material'
import { useDispatch,useSelector } from 'react-redux'
import { getMessage } from '../store/slices/MessageSlice'
import { setAlert } from '../store/slices/AlertSlice'
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import { clearGroupChat } from '../store/slices/GroupSlice'

//this is for the green dot on online users
const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));


const Users = (props) => {

    const dispatch = useDispatch();

    const onlineUser = useSelector((state)=> {return state.onlineUser});
    const checkOnline = onlineUser.users.includes(props.id);

    const handelMessageClick = async () => {
        const id = props.id;
        try {
            dispatch(clearGroupChat());
            const response = await dispatch(getMessage(id));
            if (!response.payload.success) {
                const alertMessage = {
                    message: response.payload.message,
                    type: error
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
             
            <ListItem alignItems='flex-start' sx={{ alignItems: "center" }} onClick={handelMessageClick} className='group-list'>
                <ListItemAvatar>
                    
                    {checkOnline ? ( <StyledBadge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                    >
                        <Avatar alt={props.name} src={`https://talkease-fy2k.onrender.com/uploads/${props.image}`} sx={{ bgcolor: "#698562" }}/>
                    </StyledBadge>):(<Avatar alt={props.name} src={`https://talkease-fy2k.onrender.com/uploads/${props.image}`} sx={{ bgcolor: "#698562" }}/>)}
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
