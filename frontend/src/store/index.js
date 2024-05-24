import {configureStore} from '@reduxjs/toolkit'
import AlertSlice from './slices/AlertSlice';
import UserSlice from './slices/UserSlice';
import GetUsers from './slices/GetUsers';
import MessageSlice from './slices/MessageSlice';

const Store = configureStore({
    reducer:{
        alert:AlertSlice,
        user:UserSlice,
        friends:GetUsers,
        message:MessageSlice,
    }
})

export default Store;