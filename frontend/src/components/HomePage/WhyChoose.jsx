import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faBolt,
  faUsers,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { showRegister } from "../../features/loginSlice";

const reasons = [
  {
    icon: faCheckCircle,
    title: "Clean UI",
    description:
      "A distraction-free interface designed to keep you focused on what matters most.",
  },
  {
    icon: faBolt,
    title: "Fast Workflow",
    description:
      "Create tasks, assign work, and track progress without unnecessary steps.",
  },
  {
    icon: faUsers,
    title: "Built for Teams & Individuals",
    description:
      "Perfect for solo productivity or seamless collaboration with your team.",
  },
  {
    icon: faLock,
    title: "Secure Authentication",
    description:
      "Your data is protected with secure login, encryption, and best practices.",
  },
];

const WhyChoose = () => {
  const dispatch = useDispatch();

  return (
    <section className="py-20 px-4 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-semibold text-gray-800">
            Why Choose <span className="text-blue-700 ">Work</span>
            <span className="text-green-600 italic">Sync?</span>
          </h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Designed to simplify your workflow and help you stay productive
            every day.
          </p>
        </div>

        {/* Bullet Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-20">
          {reasons.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="text-green-500 text-xl mt-1">
                <FontAwesomeIcon icon={item.icon} />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-800">
            Ready to get productive?
          </h3>
          <p className="text-gray-500 mt-3 mb-6">
            Create your free account and start managing your work smarter with
            WorkSync.
          </p>

          <button
            onClick={() => dispatch(showRegister())}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition"
          >
            Create your free account
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
