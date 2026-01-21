import StatsCards from "../components/Dashboard/StatsCards";
import TodayTasks from "../components/Dashboard/TodayTasks";
// import RecentActivity from "../components/dashboard/RecentActivity";

const Dashboard = () => {
  return (
    <div className="py-10 space-y-10">
      <h1 className="text-2xl font-semibold">Hello 👋</h1>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TodayTasks />
        {/* <RecentActivity /> */}
      </div>
    </div>
  );
};

export default Dashboard;
