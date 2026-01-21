import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import loginSlice from "../features/loginSlice";
import userInfoSlice from "../features/userInfoSlice";
// import taskReducer from "../features/tasks/taskSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    login: loginSlice,
    userInfo: userInfoSlice,
    // tasks: taskReducer,
  },
});

export default store;
