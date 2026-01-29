import { createSlice } from "@reduxjs/toolkit";

const storedUser = JSON.parse(localStorage.getItem("user"));

const initialState = {
  user: storedUser?.user || null,
  isAuthenticated: !!storedUser?.token,
  isAdmin: storedUser?.role === "admin",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      // console.log("------", action.payload.user);
      const { user, token, role } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.isAdmin = role === "admin";

      localStorage.setItem("user", JSON.stringify({ user, token, role }));
    },
    register: (state, action) => {
      const { user, token, role } = action.payload;

      state.user = user;
      state.isAuthenticated = true;
      state.isAdmin = role === "admin";

      localStorage.setItem("user", JSON.stringify({ user, token, role }));
    },
    setUser: (state, action) => {
      // console.log(action.payload);
      state.user = action.payload;

      const stored = JSON.parse(localStorage.getItem("user")) || {};

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...stored, // keep token + role
          user: action.payload, // update only user
        }),
      );
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isAdmin = false;

      localStorage.removeItem("user");
    },
  },
});

export const { login, register, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
