import React, { useState } from 'react';
import './style.css';
import logo from '../assets/fullLogo.png';
import { IconButton, Tooltip, Avatar } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAlert } from '../store/slices/AlertSlice';
import { removeUser } from '../store/slices/UserSlice';

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  const handelLogout = () => {
    navigate('/');
    dispatch(removeUser());
    localStorage.removeItem('authToken');
    const alertMessage = {
      message: 'Successfully Logged Out',
      type: 'success',
    };
    dispatch(setAlert(alertMessage));
  };

  return (
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
          <IconButton>
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
          <Avatar alt={user.data.name} src="/stg" />
        </Tooltip>
      </div>
    </div>
  );
};

export default Navbar;
