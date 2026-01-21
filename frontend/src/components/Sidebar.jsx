import React from "react";
import { Link } from "react-router-dom";
import project from "../assets/project.png";
import tasks from "../assets/tasks.png";
import help from "../assets/help.png";
import dashboard from "../assets/dashboard.png";

const Sidebar = () => {
  return (
    <div className="py-5 text-center">
      <ul className="space-y-1 px-3">
        <li className="sidebar-hover flex items-center justify-center gap-4 ml-5 cursor-pointer">
          <img src={dashboard} alt="" className="w-7 h-7" />
          <Link to="/dashboard" className="block py-5 text-primary rounded-md">
            Dashboard
          </Link>
        </li>

        <li className="sidebar-hover flex items-center justify-center gap-4 cursor-pointer">
          <img src={project} alt="" className="w-7 h-7" />
          <Link to="/projects" className="block py-5 text-primary rounded-md">
            Projects
          </Link>
        </li>

        <li className="sidebar-hover flex items-center justify-center gap-4 mr-4 cursor-pointer">
          <img src={tasks} alt="" className="w-7 h-7" />
          <Link to="/tasks" className="block py-5 text-primary rounded-md">
            Tasks
          </Link>
        </li>

        <li className=" sidebar-hover flex items-center justify-center gap-4 mr-4 cursor-pointer">
          <img src={help} alt="" className="w-7 h-7" />
          <Link to="/help" className="block py-5 text-primary rounded-md">
            Help
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
