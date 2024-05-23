import React from 'react'
import './style.css'
import { ListItem, ListItemAvatar,ListItemText,Divider,Avatar } from '@mui/material'

const Users = (props) => {
    return (
        <>
            <ListItem alignItems='flex-start'>
                <ListItemAvatar>
                    <Avatar alt={props.name} src='/ss' />
                </ListItemAvatar>
                <ListItemText>
                    <p>{props.name}</p>

                </ListItemText>
            </ListItem>
            <Divider />
        </>
    )
}

export default Users
