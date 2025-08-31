import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });

  const dispatch = useDispatch();
  const loading = useSelector((s) => s.auth.loading);
  const navigate = useNavigate();
  // console.log('navigate----', navigate)
  const submit = async (e) => {
    e.preventDefault();
     let res=await dispatch(login(form));
    if (res.meta && res.meta.requestStatus === 'fulfilled') {
      // navigate('/dashboard');
        window.location.href = "/dashboard"; 
    }
  };

  return (
    <div className="auth-page d-flex justify-content-center align-items-center">
      <div className="card auth-card p-4 shadow">
        <h4 className="text-center mb-3">Sign In</h4>
        <form onSubmit={submit}>
          {/* Email Field */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              className="form-control"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              className="form-control"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {/* Submit Button with Spinner */}
          <button
            className="btn btn-primary w-100 d-flex justify-content-center align-items-center"
            type="submit"
            disabled={loading}
          >
            {loading && (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            )}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        {/* <button onClick={()=>navigate('dashboard')}>Go to dashboard</button> */}
        {/* Signup Link */}
        <div className="mt-3 text-center">
          <Link to="/signup">Create account</Link>
        </div>
      </div>
    </div>
  );
}
