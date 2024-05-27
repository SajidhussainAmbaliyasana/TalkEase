import {createSlice} from '@reduxjs/toolkit'


const OnlineUser = createSlice({
    name:"onlineUsers",
    initialState:{
        users:[]
    },reducers:{

       updateUsers(state,action){
        state.users = action.payload;
       }
    }
})

export default OnlineUser.reducer;
export const {updateUsers} = OnlineUser.actions; 