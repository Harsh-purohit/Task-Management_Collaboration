import React, { useState } from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { showLogin, showRegister } from "../features/loginSlice";
import { logout } from "../features/authSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userName = useSelector((state) => state.auth.user?.name);
  const [sidebar, setSidebar] = useState(false);

  console.log(userName);

  return (
    <div className="flex justify-between items-center py-4">
      <div className="flex justify-between items-center gap-6">
        <div>
          <FontAwesomeIcon
            icon={faBars}
            size="lg"
            className="cursor-pointer my-3"
            onClick={() => setSidebar(!sidebar)}
          />
          {sidebar && (
            <div className="absolute top-30 left-0 w-50 h-73 bg-[#F9FAFB] rounded-lg shadow-lg z-10">
              <Sidebar />
            </div>
          )}
        </div>
        <Link to="/">
          <img src={logo} alt="WorkSync" className="h-10 w-auto" />
        </Link>
      </div>

      <div className="flex items-center">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search tasks or projects"
          className="w-lg h-10 outline-none rounded-full p-4 bg-gray-100 "
        />
      </div>

      {isAuthenticated ? (
        <div className="relative group my-2 text-lg flex gap-2 items-center cursor-pointer hover:bg-gray-200 hover:rounded-full px-5 py-2 transition-all duration-200">
          <FontAwesomeIcon icon={faUser} style={{ color: "#63E6BE" }} />
          <button className="text-primary cursor-pointer">{userName}</button>

          <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12">
            <ul className="list-none m-2 p-2 shadow-xl rounded-lg text-sm bg-[#F9FAFB]">
              <li
                onClick={() => dispatch(logout())}
                className="py-2 px-5 cursor-pointer hover:text-white hover:bg-gradient-to-r from-blue-500 to-green-500  rounded-full text-center"
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="my-2 px-3 py-2 text-lg flex gap-2 items-center">
          <button
            className="text-primary hover:underline cursor-pointer"
            onClick={() => {
              dispatch(showLogin());
            }}
          >
            Login
          </button>
          <span className="text-primary">{" / "}</span>
          <button
            className="text-primary hover:underline cursor-pointer"
            onClick={() => {
              dispatch(showRegister());
            }}
          >
            Register
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
