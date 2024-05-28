import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchFriend = createAsyncThunk('fetchFriend', async (_, { rejectWithValue }) => {
    try {
        const requestOptions = {
            method: "POST",
            url: `http://localhost:8070/api/profile/user`,
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


const FriendSlice = createSlice({
    name: "friend",
    initialState: {
        isLoading: false,
        isError: false,
        errorMessage: "",
        data: []
    }, extraReducers: (builder) => {

        builder.addCase(fetchFriend.pending, (state, action) => {
            state.isLoading = true;
            state.isError = false;
            state.data = [];
            state.errorMessage = ''
        })

        builder.addCase(fetchFriend.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.data = action.payload.data;
            state.isError = false;
            state.errorMessage = ""
        })

        builder.addCase(fetchFriend.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.data = [];
            state.isLoading = false;
        })

    }
})


export default FriendSlice.reducer;