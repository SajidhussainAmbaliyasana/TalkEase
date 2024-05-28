import React, { useState } from 'react';
import './style.css';
import logo from '../assets/fullLogo.png';
import { IconButton, Tooltip, Avatar, Skeleton, Dialog, DialogTitle, DialogContent, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAlert } from '../store/slices/AlertSlice';
import { removeUser } from '../store/slices/UserSlice';
import { clearMessage } from '../store/slices/MessageSlice';
import { fetchFriend } from '../store/slices/FriendSlice';
import { createChat } from '../store/slices/MessageSlice';
import { getUsers } from '../store/slices/GetUsers';
import { addUser } from '../store/slices/MessageSlice';


const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);
  const [friendDialog, setFriendDialog] = useState(false);



  const friend = useSelector((state) => { return state.friend })

  const handelLogout = () => {
    navigate('/');
    dispatch(removeUser());
    localStorage.removeItem('authToken');
    const alertMessage = {
      message: 'Successfully Logged Out',
      type: 'success',
    };
    dispatch(setAlert(alertMessage));
    dispatch(clearMessage());
  };


  //friend Modal

  const handelFriendModelClose = () => {
    setFriendDialog(false);
  }

  const fetchUsers = async()=>{
    try {
      const response = await dispatch(getUsers());
      if(!response.payload.success){
        const alertMessage = {
          message:response.payload.message,
          type:"error"
        }
        dispatch(setAlert(alertMessage));
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handelFriendClick = async (id,name,email,image) => {
    try {
      setFriendDialog(false);
      const response = await dispatch(createChat(id));
      if(!response.payload.success){
        const alertMessage = {
          message:response.payload.message,
          type:"error"
        }
        dispatch(setAlert(alertMessage));
        return;
      }
      
    } catch (error) {
      console.error(error)
    }
    fetchUsers();
  }

  const handelFriendModelOpen = async () => {
    try {
      setFriendDialog(true);
      const response = await dispatch(fetchFriend());
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


  return (
    <>
      <Dialog
        open={friendDialog}
        onClose={handelFriendModelClose}
        fullWidth
      >

        <DialogTitle className='dialog-title' fontSize="1.5rem"> Add Friend To Chat</DialogTitle>
        <IconButton sx={{
          position: 'absolute',
          right: 0,
          marginRight: "1rem",
          marginTop: "1rem",
        }}
          onClick={handelFriendModelClose}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent dividers className='add-friend-dialog'>
          {friend.isLoading && (
            <>
              <Skeleton width="100%" height="5rem" />
              <Skeleton width="100%" height="5rem" />
              <Skeleton width="100%" height="5rem" />
              <Skeleton width="100%" height="5rem" />
              <Skeleton width="100%" height="5rem" />
            </>
          )}

          {friend.data && friend.data.map((user) => {
            return (

              <ListItem key={user._id} alignItems='flex-start' className='friend-list' onClick={() => handelFriendClick(user._id,user.name,user.email,user.image)}>
                <ListItemAvatar>
                  <Avatar alt={user.name} src="/ss" />
                </ListItemAvatar>
                <ListItemText className='friend-name'>{user.name}</ListItemText>
              </ListItem>
            )
          })}

        </DialogContent>

      </Dialog>

      <div className={location.pathname === '/' ? 'no-nav' : 'navbar'}>
        <div className="image-box">
          <img src={logo} alt="logo" />
        </div>
        <div className="nav-btn-box">
          <Tooltip title="Create Group">
            <IconButton>
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Friend">
            <IconButton onClick={handelFriendModelOpen}>
              <PeopleOutlineRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notification">
            <IconButton>
              <NotificationsActiveRoundedIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={handelLogout}>
            <LogoutRoundedIcon />
          </IconButton>
          <Tooltip title="Profile">
            {user.isLoading ? (<Skeleton variant='circular' width={40} height={40} />) : (<Avatar alt={user.data.name} src="/stg" />)}

          </Tooltip>
        </div>
      </div>
    </>
  );
};

export default Navbar;
