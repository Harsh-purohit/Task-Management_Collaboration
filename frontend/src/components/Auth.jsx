import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login, register } from "../features/authSlice";
import axios from "axios";
import { hideLogin, showLogin, showRegister } from "../features/loginSlice";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import assets from "../assets/cross_icon.svg";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/toast";

const Auth = () => {
  const mode = useSelector((state) => state.login.mode);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const BACKEND_url = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // console.log(mode);
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password, role };

      const { data } = await axios.post(BACKEND_url + url, payload, {
        withCredentials: true,
      });
      // console.log(data);

      if (data.token) {
        const payload = {
          user: data.user_or_admin,
          role: data.role,
          token: data.token,
        };
        const action = mode === "login" ? login(payload) : register(payload);

        dispatch(action);

        dispatch(hideLogin());

        notify.success(
          mode === "login"
            ? "Welcome back!!"
            : "Account created successfully!!",
        );

        setTimeout(() => navigate("/dashboard"), 500);
      }
    } catch (error) {
      notify.error(error.response.data.message || "Something went wrong!");
      console.error("Error during authentication:", error);
    }
  };

  if (!mode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black/20">
      <form
        className="relative bg-white p-10 rounded-xl text-slate-500"
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-2xl text-primary font-medium text-neutral-700">
          {mode === "login" ? "Login" : "Register"}
        </h1>

        <p className="text-sm">
          Welcome back! Please {mode === "login" ? "login" : "register"} to
          continue
        </p>

        {mode !== "login" && (
          <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-5">
            <FontAwesomeIcon icon={faUser} />
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              className="outline-none text-sm "
              placeholder="Full Name"
              required
            />
          </div>
        )}

        <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4">
          <FontAwesomeIcon icon={faEnvelope} />
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            className="outline-none text-sm "
            placeholder="Email id"
            required
          />
        </div>

        {mode === "register" && (
          <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-4 ">
            <select
              name=""
              id=""
              className="outline-none"
              onChange={(e) => setRole(e.target.value)}
              value={role}
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4">
          <FontAwesomeIcon icon={faKey} />
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            className="outline-none text-sm "
            placeholder="Password"
            required
          />
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full hover:scale-105 transition-transform cursor-pointer mt-5 w-full text-white px-4 py-2">
          {mode === "login" ? "Login" : "Register"}
        </button>

        {mode === "register" ? (
          <p className="mt-5 text-center">
            Already have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer hover:text-blue-800"
              onClick={() => dispatch(showLogin())}
            >
              Login
            </span>
          </p>
        ) : (
          <p className="mt-5 text-center">
            Don't have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => dispatch(showRegister())}
            >
              Register
            </span>
          </p>
        )}

        <img
          onClick={() => dispatch(hideLogin())}
          src={assets}
          alt="close"
          className="absolute top-5 right-5 cursor-pointer"
        />
      </form>
    </div>
  );
};

export default Auth;
