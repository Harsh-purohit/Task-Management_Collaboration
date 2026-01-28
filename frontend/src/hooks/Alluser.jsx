import axios from "axios";
import { useDispatch } from "react-redux";
import { setAllusers } from "../features/alluserSlice";
import { notify } from "../utils/toast";

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

      // console.log("all users", response.data);

      if (response.status === 200) {
        dispatch(setAllusers(response.data));
      }
    } catch (error) {
      notify.error(error.response?.data?.message || "Something went wrong!");
    }
  };

  return { fetchAllUsers };
};

export default useAllUsers;
