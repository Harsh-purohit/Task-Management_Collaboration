import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      // console.log("------", action.payload.user_or_admin);
      state.user = action.payload.user_or_admin;
      state.isAuthenticated = true;
      state.isAdmin = action.payload.role === "admin";
    },
    register: (state, action) => {
      state.user = action.payload.user_or_admin;
      state.isAuthenticated = true;
      state.isAdmin = action.payload.role === "admin";
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      localStorage.removeItem("token");
    },
  },
});

export const { login, register, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
