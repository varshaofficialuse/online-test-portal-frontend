import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Analytics from './components/Analytics';
import Notes from './components/Notes';
import Quizzes from './components/Quizzes';
import Tests from './components/Tests';
import Sessions from './components/Sessions';
import Admin from './components/Admin';


function App(){
    return (
      <>
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/" element={<ProtectedRoute><Layout/></ProtectedRoute>}>
        {/* <Route index element={<Dashboard/>} /> */}
        <Route path="dashboard" element={<Dashboard/>} />
        <Route path="admin" element={<Admin/>} />
        <Route path="notes" element={<Notes/>} />
        <Route path="quizzes" element={<Quizzes/>} />
        <Route path="tests" element={<Tests/>} />
        <Route path="sessions" element={<Sessions/>} />
        <Route path="analytics" element={<Analytics/>} />
      </Route>
      <Route path="*" element={<Navigate to='/' />} />
    </Routes>
    <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#333",
            color: "#fff",
            padding: "12px 18px",
            fontSize: "15px",
            fontWeight: 500,
          },
          success: {
            style: {
              background: "linear-gradient(135deg, #4caf50, #2e7d32)",
              color: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#4caf50",
            },
          },
          error: {
            style: {
              background: "linear-gradient(135deg, #f44336, #b71c1c)",
              color: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#f44336",
            },
          },
        }}
      />
      </>
  );
}
export default App;
