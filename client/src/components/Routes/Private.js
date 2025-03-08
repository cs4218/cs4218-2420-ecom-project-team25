import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth';
import { Outlet } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../Spinner';

export default function PrivateRoute() {
  const [ok, setOk] = useState(false);
  const [auth, setAuth] = useAuth();

  useEffect(() => {
    const authCheck = async () => {
      try {
        const res = await axios.get('/api/v1/auth/user-auth');
        if (res.data.ok) {
          setOk(true);
        } else {
          setAuth({
            user: null,
            token: '',
          });
          localStorage.removeItem('auth');
          setOk(false);
        }
      } catch (err) {
        console.log(err);
        setAuth({
          user: null,
          token: '',
        });
        localStorage.removeItem('auth');
        setOk(false);
      }
    };
    if (auth?.token) authCheck();
  }, [auth?.token]);

  return ok ? <Outlet /> : <Spinner />;
}
