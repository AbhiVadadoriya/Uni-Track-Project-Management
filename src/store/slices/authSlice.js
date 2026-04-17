import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      toast.success("Logged in successfully!");
      return response.data.user;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed.";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);


export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      toast.success("Registered successfully!");
      return response.data.user || response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed.";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.get("/auth/logout");
      toast.success("Logged out successfully");
      return null;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Logout failed.";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/me");
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Not authenticated");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isLoggingIn: false,
    isCheckingAuth: true,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoggingIn = false;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoggingIn = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.authUser = null;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isCheckingAuth = false;
        state.authUser = null;
      });
  },
});

export default authSlice.reducer;

