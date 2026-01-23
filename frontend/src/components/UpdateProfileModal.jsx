import { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../features/authSlice";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const UpdateProfileModal = ({ onClose }) => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    oldPassword: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {};

      if (form.name !== user.name) payload.name = form.name;
      if (form.email !== user.email) payload.email = form.email;

      

      if (form.oldPassword && form.newPassword) {
        payload.oldPassword = form.oldPassword;
        payload.newPassword = form.newPassword;
      }

      const { data } = await axios.patch(
        `${BACKEND_URL}/api/user/updateprofile/${user._id}`,
        payload,
        { withCredentials: true },
      );

      dispatch(setUser(data.user)); // update redux instantly
      alert("Profile updated ✅");
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-[420px] rounded-2xl shadow-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-center">Update Profile</h2>

        {/* Name */}
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />

        {/* Email */}
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />

        <hr />

        <h3 className="text-sm text-gray-500">Change Password (optional)</h3>

        <input
          type="password"
          name="oldPassword"
          placeholder="Old Password"
          value={form.oldPassword}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />

        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={form.newPassword}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-green-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfileModal;
