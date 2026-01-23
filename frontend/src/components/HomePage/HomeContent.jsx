import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { showLogin } from "../../features/loginSlice";

const HomeContent = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // console.log("isAuthenticated", isAuthenticated);
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="mt-25">
        <h1 className="font-bold text-5xl text-center">
          <span className="text-blue-700 ">Work</span>
          <span className="text-green-600 italic">Sync</span>
        </h1>
        <h3 className="text-center text-sm mt-1">
          Connect. Collaborate. Achieve.
        </h3>
      </div>

      <div className="flex items-center justify-between gap-5 py-5">
        <button
          onClick={() => {
            !isAuthenticated && dispatch(showLogin());
          }}
          className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full w-full text-white px-6 py-2 cursor-pointer"
        >
          Get Started
        </button>
        <button className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full  w-full text-white px-6 py-2 cursor-pointer">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HomeContent;
