import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/authSlice";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; 
import "../styles/auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const dispatch = useDispatch();
  const loading = useSelector((s) => s.auth.loading);
  const navigate = useNavigate();

  const validate = () => {
    if (!form.email) {
      toast.error("Email is required");
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Enter a valid email");
      return false;
    }

    if (!form.password) {
      toast.error("Password is required");
      return false;
    } else if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return; // stop if invalid

    let res = await dispatch(login(form));
    if (res.meta && res.meta.requestStatus === "fulfilled") {
      navigate("/sessions");
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="auth-page d-flex justify-content-center align-items-center">
      <div className="card auth-card p-4 shadow">
        <h4 className="text-center mb-3">Sign In</h4>
        <form onSubmit={submit} noValidate>
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
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            )}
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-3 text-center">
          <Link to="/signup">Create account</Link>
        </div>
      </div>
    </div>
  );
}
