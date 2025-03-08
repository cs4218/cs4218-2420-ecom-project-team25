import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

import Layout from "../../components/Layout";
import AdminMenu from "../../components/AdminMenu";

export const USERS_STRINGS = {
  FETCH_USERS_ERROR: "Something went wrong while fetching users",
  COMPONENT_UNMOUNTED: "Component is unmounted",
};

export const API_URLS = {
  GET_USERS: "/api/v1/auth/all-users",
};

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const getAllUsers = async () => {
      try {
        const { data } = await axios.get(API_URLS.GET_USERS);

        if (!data?.success) {
          throw new Error(USERS_STRINGS.FETCH_USERS_ERROR);
        }

        if (!isMounted) {
          console.log(USERS_STRINGS.COMPONENT_UNMOUNTED);
          return;
        }

        setUsers(data.users);
      } catch (error) {
        toast.error(USERS_STRINGS.FETCH_USERS_ERROR);
        console.log(error);
      }
    };

    getAllUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Layout title={"Dashboard - All Users"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1>All Users</h1>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Address</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user._id} data-testid={`user-display-item-${i}`}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Users;
