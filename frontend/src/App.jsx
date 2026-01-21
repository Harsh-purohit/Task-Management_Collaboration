import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Auth from "./components/Auth";
import { useSelector } from "react-redux";
import PrivateRoute from "./routes/PrivateRoute";
import Dashboard from "./pages/Dashboard";

const App = () => {
  const mode = useSelector((state) => state.login.mode);
  // console.log(mode);

  return (
    <div className="px-2 sm:px-4 md:px-8 lg:px-10 min-h-screen bg-[#F9FAFB]">
      <Navbar />

      {mode && <Auth />}

      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/project" element={<Project />} /> */}
        {/* <Route path="/tasks" element={<Tasks />} /> */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
};

export default App;
