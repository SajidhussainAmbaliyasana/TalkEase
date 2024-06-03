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


//this is to send Message in group
export const sendGroupMessage = createAsyncThunk('sendGroupMessage',async(inputData,{rejectWithValue})=>{
    try {
        
        const requestOptions = {
            method: "POST",
            url: `http://localhost:8070/api/group/send/${inputData.id}`,
            headers: {
                "Content-Type": "application/json",
                "authToken": localStorage.getItem("authToken")
            },
            data:{message:inputData.message}
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

//this is to delete group
export const deleteGroup = createAsyncThunk('deleteGroup',async(id,{rejectWithValue})=>{
    try {
        
        const requestOptions = {
            method: "DELETE",
            url: `http://localhost:8070/api/group/delete/${id}`,
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

export const removeMembers = createAsyncThunk('removeMembers',async(inputData,{rejectWithValue})=>{
    try {
        
        const requestOptions = {
            method: "PATCH",
            url: `http://localhost:8070/api/group/remove/${inputData.id}`,
            headers: {
                "Content-Type": "application/json",
                "authToken": localStorage.getItem("authToken")
            },
            data:{members:inputData.members}
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

export const leaveGroup = createAsyncThunk('leaveGroup',async(id,{rejectWithValue})=>{
    try {
        
        const requestOptions = {
            method: "PATCH",
            url: `http://localhost:8070/api/group/leave/${id}`,
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



const GroupSlice = createSlice({
    name: "group",
    initialState: {
        isLoading: false,
        isError: false,
        errorMessage: "",
        createLoading: false,
        chatLoading:false,
        sendLoading:false,
        data: [],
        users: [],
        groups:[],
        userId:""
    },reducers:{

        clearGroupChat:(state,action)=>{
            state.data = [];
        },

        addGroupMessage:(state,action)=>{
            state.data.messages.push(action.payload);
        },

        removeUser:(state,action)=>{
            const newMembers = state.data.members.filter((user)=>{
                return user._id !== action.payload
            })

            state.data.members = newMembers
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
            state.userId=""
        })

        builder.addCase(fetchGroupChats.fulfilled,(state,action)=>{
            state.chatLoading = false;
            state.data = action.payload.data;
            state.isError = false;
            state.errorMessage = ""
            state.userId = action.payload.userId;
        })

        builder.addCase(fetchGroupChats.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.data = [];
            state.chatLoading = false;
            state.userId = "";
        })

        //this is to send Message
        builder.addCase(sendGroupMessage.pending,(state,action)=>{
            state.sendLoading = true;
            state.isError = false;
            state.errorMessage = ""
        })

        builder.addCase(sendGroupMessage.fulfilled,(state,action)=>{
            state.sendLoading = false;
            state.data.messages.push(action.payload.data);
            state.isError = false;
            state.errorMessage = ""
        })

        builder.addCase(sendGroupMessage.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.sendLoading = false;
        })


        //delete group
        builder.addCase(deleteGroup.pending,(state,action)=>{
            state.isLoading = true;
            state.isError = false;
            state.errorMessage = ""
        })

        builder.addCase(deleteGroup.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isError = false;
            state.errorMessage = "";
            let newGroups = state.groups.filter((group)=>{
                return group._id !== action.payload.groupId
            }) 
            state.groups = newGroups
        })

        builder.addCase(deleteGroup.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.isLoading = false;
        })

        //remove memebers done by admin
        builder.addCase(removeMembers.pending,(state,action)=>{
            state.isLoading = true;
            state.isError = false;
            state.errorMessage = "";
        })

        builder.addCase(removeMembers.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isError = false;
            state.errorMessage = "";
            const removeIds = action.payload.data;
            let newMembers = state.data.members.filter((user)=>{
                return !removeIds.includes(user._id);
            })
            state.data.members = newMembers
        })

        builder.addCase(removeMembers.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.isLoading = false;
        })

        //leave group
        builder.addCase(leaveGroup.pending,(state,action)=>{
            state.isLoading = true;
            state.isError = false;
            state.errorMessage = ""
        })

        builder.addCase(leaveGroup.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isError = false;
            state.errorMessage = "";
            const newMembers = state.data.members.filter((user)=>{
                return user !== action.payload.data
            })
            state.data.members = newMembers
            let newGroups = state.groups.filter((group)=>{
                return group._id !== action.payload.groupId
            }) 
            state.groups = newGroups
        })

        builder.addCase(leaveGroup.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.isLoading = false;
        })
    }
})


export default GroupSlice.reducer;
export const {clearGroupChat,addGroupMessage,removeUser} = GroupSlice.actions;