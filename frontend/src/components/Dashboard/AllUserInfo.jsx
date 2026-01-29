import React from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { softDeleteUser } from "../../features/alluserSlice";

const AllUserInfo = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.allusers.allusers.users || []);

  // const [search, setSearch] = useState("");
  const url = import.meta.env.VITE_BACKEND_URL;

  // ================= Delete =================
  const handleDelete = async (id) => {
    try {
      await axios.patch(
        `${url}/api/admin/${id}/deleteuser`,
        {},
        { withCredentials: true },
      );

      // console.log(response);

      dispatch(softDeleteUser(id));
      toast.success("User moved to trash 🗑️");
    } catch {
      toast.error("Delete failed");
    }
  };

  // // ================= Filter =================
  // const filteredUsers = users.filter((u) =>
  //   u.name.toLowerCase().includes(search.toLowerCase()),
  // );

  return (
    <div className="p-2 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">All Users</h2>

        {/* Search
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-xl px-4 py-2 w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-black/20"
        /> */}
      </div>

      {/* User List */}
      <div className="grid gap-4 items-center">
        {users.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No users found 👀
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="bg-white shadow-md rounded-2xl p-4 flex items-center justify-between hover:shadow-lg transition"
            >
              {/* Left side */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                {/* Role badge */}
                {user.role && (
                  <span className="ml-3 text-xs bg-gray-100 px-3 py-1 rounded-full">
                    {user.role}
                  </span>
                )}
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(user._id)}
                className="text-red-500 px-4 py-2 rounded-xl hover:text-red-600 transition cursor-pointer"
              >
                <FontAwesomeIcon
                  icon={faTrashCan}
                  // style={{ color: "#ff0000" }}
                  size="lg"
                />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllUserInfo;
