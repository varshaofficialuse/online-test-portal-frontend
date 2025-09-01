import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

export default function Signup(){
  const [form, setForm] = useState({ name:'', email:'', password:'' });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(s=>s.auth.loading);
  
  const submit = async (e)=>{
    e.preventDefault();
    const res = await dispatch(signup(form));
    navigate('/login');
  };

  
  return (
    <div className="auth-page d-flex justify-content-center align-items-center">
      <div className="card auth-card p-4">
        <h4>Create account</h4>
        <form onSubmit={submit}>
          <div className="mb-2">
            <label htmlFor='name' className="form-label">Name</label>
            <input id="name" className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
          </div>
          <div className="mb-2">
            <label htmlFor='email' className="form-label">Email</label>
            <input  id='email' className="form-control" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
          </div>
          <div className="mb-3">
            <label htmlFor='password' className="form-label">Password</label>
            <input id="password"  className="form-control" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
          </div>
          <button className="btn btn-primary w-100" disabled={loading}>{loading ? 'Creating...' : 'Sign Up'}</button>
        </form>
      </div>
    </div>
  );
}
