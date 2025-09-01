import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import React, { Suspense, lazy } from "react";
import '../src/styles/spinner.css'
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy imports
const Layout = lazy(() => import("./components/Layout"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Notes = lazy(() => import("./components/Notes"));
const Quizzes = lazy(() => import("./components/Quizzes"));
const Tests = lazy(() => import("./components/Tests"));
const Sessions = lazy(() => import("./components/Sessions"));
const Admin = lazy(() => import("./components/Admin"));
const StartQuiz = lazy(() => import("./components/StartQuiz"));

function App() {
  return (
    <>
      <Suspense
        fallback={
          <div className="spinner-container">
            loading......
            <div className="spinner"></div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<sessions />} />
            <Route path="admin" element={<Admin />} />
            <Route path="notes" element={<Notes />} />/
            <Route path="quizzes" element={<Quizzes />} />
            <Route path="tests" element={<Tests />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="practice" element={<StartQuiz />} />
            <Route path="practice/:noteId/:quizId" element={<StartQuiz />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>

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
