import {configureStore} from '@reduxjs/toolkit'
import AlertSlice from './slices/AlertSlice';
import UserSlice from './slices/UserSlice';

const Store = configureStore({
    reducer:{
        alert:AlertSlice,
        user:UserSlice,
    }
})

export default Store;