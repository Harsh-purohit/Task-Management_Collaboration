import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: JSON.parse(localStorage.getItem("userTask_Project")) || null,
};

const userInfoSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      // console.log(action.payload);
      state.userInfo = action.payload;

      localStorage.setItem(
        "userTask_Project",
        JSON.stringify({
          userTask: action.payload?.tasks,
          userProject: action.payload?.projects,
        }),
      );
    },

    clearUserInfo: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userTask_Project");
    },
  },
});

export const { setUserInfo, clearUserInfo } = userInfoSlice.actions;
export default userInfoSlice.reducer;
