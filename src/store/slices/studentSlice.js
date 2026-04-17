import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const fetchStudentStats = createAsyncThunk(
  "student/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/student/fetch-dashboard-stats");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

export const fetchStudentProject = createAsyncThunk(
  "student/fetchProject",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/student/project");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch project");
    }
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState: {
    project: null,
    dashboardStats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload.data || action.payload;
      })
      .addCase(fetchStudentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchStudentProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudentProject.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload.data?.project || action.payload.project;
      })
      .addCase(fetchStudentProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default studentSlice.reducer;
