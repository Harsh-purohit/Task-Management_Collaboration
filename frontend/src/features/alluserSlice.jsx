import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allusers: [],
};

const userInfoSlice = createSlice({
  name: "allusers",
  initialState,
  reducers: {
    setAllusers: (state, action) => {
      state.allusers = action.payload;
      // console.log("from slice", state.allusers);
    },
  },
});

export const { setAllusers } = userInfoSlice.actions;
export default userInfoSlice.reducer;
