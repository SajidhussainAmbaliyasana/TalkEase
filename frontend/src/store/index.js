import {configureStore} from '@reduxjs/toolkit'
import AlertSlice from './slices/AlertSlice';
import UserSlice from './slices/UserSlice';
import GetUsers from './slices/GetUsers';
import MessageSlice from './slices/MessageSlice';
import OnlineUser from './slices/OnlineUser';

const Store = configureStore({
    reducer:{
        alert:AlertSlice,
        user:UserSlice,
        friends:GetUsers,
        message:MessageSlice,
        onlineUser:OnlineUser,
    }
})

export default Store;