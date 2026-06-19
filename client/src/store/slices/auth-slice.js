import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  isProfileComplete: false,
  isAuthLoading: true, // Track auth bootstrap loading state
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.role = action.payload.role;
      state.isAuthenticated = true;
      state.isProfileComplete = action.payload.isProfileComplete;
      state.isAuthLoading = false;
    },

    clearUser: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isProfileComplete = false;
      state.isAuthLoading = false;
    },

    setAuthLoading: (state, action) => {
      state.isAuthLoading = action.payload;
    },
  },
});

export const { setUser, clearUser, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
