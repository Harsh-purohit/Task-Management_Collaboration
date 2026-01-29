import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo, clearUserInfo } from "../../features/userInfoSlice";
import axios from "axios";
import { setProjects } from "../../features/projectSlice";
import { notify } from "../../utils/toast";

const StatsCards = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.user?._id);
  const userInfo = useSelector((state) => state.userInfo.userInfo);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  // const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // if (!token) {
        //   alert("Please login again");
        //   return;
        // }
        const [tasksRes, projectsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/tasks`, {
            withCredentials: true,
            params: { users: userId },
          }),
          axios.get(`${BACKEND_URL}/api/projects`, {
            withCredentials: true,
            params: { users: userId },
          }),
        ]);

        // console.log("Fetched user info:", {
        //   tasks: tasksRes,
        //   projects: projectsRes,
        // });

        dispatch(
          setUserInfo({
            tasks: tasksRes.data,
            projects: projectsRes.data,
          }),
        );
        dispatch(setProjects(projectsRes.data));
      } catch (error) {
        notify.error("Failed to fetch details");
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();

    return () => {
      dispatch(clearUserInfo());
    };
  }, []);

  const totalTasks = userInfo?.tasks?.length || 0;
  const completedTasks =
    userInfo?.tasks?.filter((t) => t.status === "Done").length || 0;

  // console.log(totalTasks,"totalTasks",  completedTasks);

  const stats = [
    { label: "Total Tasks", value: totalTasks },
    { label: "Completed", value: completedTasks },
    {
      label: "Pending",
      value: totalTasks - completedTasks,
    },
    {
      label: "Total Projects",
      value: userInfo?.projects?.length || 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((item, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">{item.label}</p>
          <h2 className="text-2xl font-semibold">{item.value}</h2>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
