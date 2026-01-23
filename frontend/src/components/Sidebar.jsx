import React from "react";
import { Link } from "react-router-dom";
import project from "../assets/project.png";
// import tasks from "../assets/tasks.png";
import help from "../assets/help.png";
import dashboard from "../assets/dashboard.png";

const Sidebar = ({ setOpen }) => {
  return (
    <div className="py-5 text-center">
      <ul className="space-y-1 px-3">
        <li className="sidebar-hover flex items-center justify-center gap-4 ml-5 cursor-pointer">
          <img src={dashboard} alt="" className="w-7 h-7" />
          <Link
            to="/dashboard"
            onClick={() => {
              setOpen(false);
            }}
            className="block py-5 text-primary rounded-md"
          >
            Dashboard
          </Link>
        </li>

        <li className="sidebar-hover flex items-center justify-center gap-4 cursor-pointer">
          <img src={project} alt="" className="w-7 h-7" />
          <Link
            to="/projects"
            onClick={() => {
              setOpen(false);
            }}
            className="block py-5 text-primary rounded-md"
          >
            Projects
          </Link>
        </li>

        <li className=" sidebar-hover flex items-center justify-center gap-4 mr-4 cursor-pointer">
          <img src={help} alt="" className="w-7 h-7" />
          <Link
            to="/help"
            onClick={() => {
              setOpen(false);
            }}
            className="block py-5 text-primary rounded-md"
          >
            Help
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
