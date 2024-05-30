import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios';


//to fetch all user beside the loggedin User
export const fetchAllUsers = createAsyncThunk('fetchAllUsers', async (_, { rejectWithValue }) => {
    try {

        const requestOptions = {
            method: "POST",
            url: `http://localhost:8070/api/group/user`,
            headers: {
                "Content-Type": "application/json",
                "authToken": localStorage.getItem("authToken")
            },

        }

        const response = await axios(requestOptions);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw rejectWithValue({ message: error.response.data.message ? error.response.data.message : "Error Occured" });
        } else {
            throw rejectWithValue({ message: error.message ? error.message : "Error Occured" })
        }
    }
})


//to create a group
export const createGroup = createAsyncThunk('createGroup', async (inputData, { rejectWithValue }) => {
    try {

        const requestOptions = {
            method: "POST",
            url: `http://localhost:8070/api/group/create`,
            headers: {
                "Content-Type": "application/json",
                "authToken": localStorage.getItem("authToken")
            },
            data:{groupName:inputData.groupName,members:inputData.members}

        }

        const response = await axios(requestOptions);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw rejectWithValue({ message: error.response.data.message ? error.response.data.message : "Error Occured" });
        } else {
            throw rejectWithValue({ message: error.message ? error.message : "Error Occured" })
        }
    }
})

//this is to fetch all the groups
export const fetchGroups = createAsyncThunk('fetchGroups',async()=>{
    try {
        
        const requestOptions = {
            method: "POST",
            url: `http://localhost:8070/api/group/find`,
            headers: {
                "Content-Type": "application/json",
                "authToken": localStorage.getItem("authToken")
            }
        }

        const response = await axios(requestOptions);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw rejectWithValue({ message: error.response.data.message ? error.response.data.message : "Error Occured" });
        } else {
            throw rejectWithValue({ message: error.message ? error.message : "Error Occured" })
        }
    }
})


//this is to fetch the chats of a group;
export const fetchGroupChats = createAsyncThunk('fetchGroupChats',async(id,{rejectWithValue})=>{
    try {
        
        const requestOptions = {
            method: "POST",
            url: `http://localhost:8070/api/group/chats/${id}`,
            headers: {
                "Content-Type": "application/json",
                "authToken": localStorage.getItem("authToken")
            }
        }

        const response = await axios(requestOptions);
        return response.data;

    } catch (error) {
        if (error.response) {
            throw rejectWithValue({ message: error.response.data.message ? error.response.data.message : "Error Occured" });
        } else {
            throw rejectWithValue({ message: error.message ? error.message : "Error Occured" })
        }
    }
})






const GroupSlice = createSlice({
    name: "group",
    initialState: {
        isLoading: false,
        isError: false,
        errorMessage: "",
        createLoading: false,
        chatLoading:false,
        data: [],
        users: [],
       // members:[],
        groups:[],
    },reducers:{

        clearGroupChat:(state,action)=>{
            state.data = [];
        }
    }, extraReducers: (builder) => {

        //to fetch user
        builder.addCase(fetchAllUsers.pending, (state, action) => {
            state.isLoading = true;
            state.isError = false;
            state.users = [];
            state.errorMessage = '';
        })

        builder.addCase(fetchAllUsers.fulfilled, (state, action) => {
            state.isLoading = false;
            state.users = action.payload.data;
            state.isError = false;
            state.errorMessage = action.payload.message;
        })

        builder.addCase(fetchAllUsers.rejected, (state, action) => {
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.isLoading = false;
            state.users = [];
        })

        //to create a group
        builder.addCase(createGroup.pending,(state,action)=>{
            state.createLoading = true;
            state.isError = false;
            state.errorMessage = ""
        })

        builder.addCase(createGroup.fulfilled,(state,action)=>{
            state.createLoading = false;
            state.isError = false;
            state.errorMessage = ""
        })

        builder.addCase(createGroup.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.createLoading = false;
        })

        //this is to fetch all the groups
        builder.addCase(fetchGroups.pending,(state,action)=>{
            state.isLoading = true;
            state.isError = false;
            state.errorMessage = '';
            state.groups = [];
        })

        builder.addCase(fetchGroups.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.groups = action.payload.data;
            state.isError = false;
            state.errorMessage = "";
        })

        builder.addCase(fetchGroups.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.isLoading = false;
            state.groups = [];
        })

        //this is to fetch the group chats
        builder.addCase(fetchGroupChats.pending,(state,action)=>{
            state.chatLoading = true;
            state.isError = false;
            state.errorMessage = "";
            state.data = [];
        })

        builder.addCase(fetchGroupChats.fulfilled,(state,action)=>{
            state.chatLoading = false;
            state.data = action.payload.data;
            state.isError = false;
            state.errorMessage = ""
        })

        builder.addCase(fetchGroupChats.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.data = [];
            state.chatLoading = false;
        })

    }
})


export default GroupSlice.reducer;
export const {clearGroupChat} = GroupSlice.actions;