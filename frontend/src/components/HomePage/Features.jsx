import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListCheck,
  faUsers,
  faChartLine,
  faBell,
} from "@fortawesome/free-solid-svg-icons";

const features = [
  {
    icon: faListCheck,
    title: "Task Management",
    description:
      "Create, organize, and prioritize tasks effortlessly to stay focused and productive every day.",
  },
  {
    icon: faUsers,
    title: "Team Collaboration",
    description:
      "Work together seamlessly with shared projects, clear assignments, and real-time updates.",
  },
  {
    icon: faChartLine,
    title: "Progress Tracking",
    description:
      "Track task completion and project progress with clear visual insights and status updates.",
  },
  {
    icon: faBell,
    title: "Smart Notifications",
    description:
      "Never miss an update with timely notifications for deadlines, assignments, and changes.",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-14">
        <h2 className="text-3xl font-semibold text-gray-800">
          Everything you need to stay productive
        </h2>
        <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
          WorkSync helps you manage tasks, collaborate with your team, and track
          progress — all in one place.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white mb-4">
              <FontAwesomeIcon icon={feature.icon} />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {feature.title}
            </h3>

            <p className="text-gray-500 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
