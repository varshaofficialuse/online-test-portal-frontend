import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

import '../styles/layout.css';

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const role = user?.role;

  return (
    <div className="app d-flex">
      <aside className="sidebar">
        <div className="brand">Test Portal</div>
        <nav>
          
          <NavLink to="/sessions" className="nav-link">
            <i className="bi bi-clipboard-check nav-icon"></i> Sessions
          </NavLink>

           <NavLink to="/quizzes" className="nav-link">
            <i className="bi bi-question-circle nav-icon"></i> Quizzes
          </NavLink>

           {role.toLowerCase() !== "student" && (
            <>          

          <NavLink to="/tests" className="nav-link">
            <i className="bi bi-ui-checks-grid nav-icon"></i> Tests
          </NavLink>

          <NavLink to="/notes" className="nav-link">
            <i className="bi bi-journal-text nav-icon"></i> Notes
          </NavLink>
          

          </>
            )}
          
          {role.toLowerCase() === "superadmin" && (

          <NavLink to="/admin" className="nav-link">
            <i className="bi bi-person-gear nav-icon"></i> Admin
          </NavLink>
                    )}

        </nav>

        <div className="signout">
          <button
            className="btn btn-light w-100"
            onClick={() => { dispatch(logout()); navigate('/login'); }}
          >
            <i className="bi bi-box-arrow-right"></i> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content flex-grow-1">
        <header className="topbar d-flex justify-content-between align-items-center bg-light">
          <h4 className="mb-0">Welcome {user?.name}</h4>
          <div className="user-info">{user?.email||""}</div>
        </header>
        <div className="content p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
