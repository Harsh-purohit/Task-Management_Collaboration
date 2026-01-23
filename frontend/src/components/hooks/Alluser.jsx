import axios from "axios";
import { useDispatch } from "react-redux";
import { setAllusers } from "../../features/alluserSlice";

const useAllUsers = () => {
  const dispatch = useDispatch();
  const url = import.meta.env.VITE_BACKEND_URL;

  const fetchAllUsers = async () => {
    try {
      // if (!localStorage.getItem("token")) {
      //   alert("Please login again");
      //   return;
      // }

      const response = await axios.get(`${url}/api/admin/allusers`, {
        withCredentials: true,
      });

      //   console.log("all users", response.data.users);

      if (response.status === 200) {
        dispatch(setAllusers(response.data.users));
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong!");
    }
  };

  return { fetchAllUsers };
};

export default useAllUsers;
