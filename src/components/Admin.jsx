import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from "react-hot-toast";

import '../styles/admin.css';


// const API_URL = "http://127.0.0.1:8000/";
const API_URL = "https://online-test-portal-extended.up.railway.app/";

export default function Admin() {
  const token =useSelector((s) => s.auth.accessToken);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const createAdmin = async () => {
    if (!name || !email || !password) {
        toast.error("All fields are required!");
        return;
  }
    const loadingToast = toast.loading("Creating admin...");

    try {
      const res = await axios.post(`${API_URL}auth/admin/create/`, { name, email, password }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
       toast.dismiss(loadingToast);
       toast.success(res.data.message || "Admin created successfully!");
      setMessage(res.data.message);
      setName(''); setEmail(''); setPassword('');
    }catch (err) {
  toast.dismiss(loadingToast);
  if (err.response?.status === 401) {
    toast.error("Unauthorized! Please login as a Super Admin.");
  } else {
    toast.error(err.response?.data?.detail || "Something went wrong!");
  }
}

  };

  return (
    <div className="admin-container">
      <h4>Create Admin User</h4>
      <input 
        className="admin-input"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input 
        className="admin-input"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input 
        className="admin-input"
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button className="admin-btn" onClick={createAdmin}>Create</button>
    </div>
  );
}
