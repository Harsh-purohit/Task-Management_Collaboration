import { configureStore, combineReducers } from "@reduxjs/toolkit";
// import storage from "redux-persist/lib/storage";
// import { persistReducer, persistStore } from "redux-persist";

import authReducer from "../features/authSlice";
import loginSlice from "../features/loginSlice";
import userInfoSlice from "../features/userInfoSlice";
import projectSlice from "../features/projectSlice";
import allusers from "../features/alluserSlice";
import tasksReducer from "../features/taskSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    login: loginSlice,
    userInfo: userInfoSlice,
    projects: projectSlice,
    allusers: allusers,
    tasks: tasksReducer,
  },
});

export default store;

// const rootReducer = combineReducers({
//   auth: authReducer,
//   login: loginSlice,
//   userInfo: userInfoSlice,
//   projects: projectSlice,
//   allusers: allusers,
//   tasks: tasksReducer,
// });

// const persistConfig = {
//   key: "root",
//   storage,
//   whitelist: ["auth", "userInfo"], // ONLY persist auth (important!)
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({ serializableCheck: false }),
// });

// export const persistor = persistStore(store);
