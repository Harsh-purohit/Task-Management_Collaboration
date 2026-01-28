import StatsCards from "../components/Dashboard/StatsCards";
import TodayTasks from "../components/Dashboard/TodayTasks";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import useAllUsers from "../hooks/Alluser";
// import RecentActivity from "../components/dashboard/RecentActivity";

const Dashboard = () => {
  const userName = useSelector((state) => state.auth.user?.name);

  const { fetchAllUsers } = useAllUsers();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className="py-10 space-y-10 min-h-screen">
      <h1 className="text-2xl font-semibold">Hello, {userName}👋</h1>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TodayTasks />
        {/* <RecentActivity /> */}
      </div>
    </div>
  );
};

export default Dashboard;
