import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import GenerateQuiz from "./GenerateQuiz";
import "../styles/quizzes.css";

export default function Quizzes({ testId }) {
  const token = useSelector((s) => s.auth.token);
  const [quizzes, setQuizzes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
 
  const handleStartQuiz = (NoteId,quizId) => {
    // Navigate to practice route
    navigate(`/practice/${NoteId}/${quizId}`);
  };

  const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    fetchQuizzes();
    fetchNotes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get("/quiz/quizzes/");
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch quizzes");
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch notes");
    }
  };

  const createQuiz = async () => {
    if (!selectedNote) return toast.error("Select a Note");

    setLoading(true);
    try {
      const res = await api.post("/quiz/create/", { note_id: parseInt(selectedNote) });
      setQuizzes([...quizzes, res.data]);
      toast.success("Quiz created successfully 🎉");
      setSelectedNote("");
    } catch {
      toast.error("Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (id) => {
    try {
      await api.delete(`/quiz/delete/${id}`);
      setQuizzes(quizzes.filter((q) => q.id !== id));
      toast.success("Quiz deleted 🗑️");
    } catch {
      toast.error("Failed to delete quiz");
    }
  };

  return (
    <div className="quiz-dashboard-container">
      <Toaster position="top-right" />
      <h2 className="quiz-title">Quiz Management</h2>

      {/* Create Quiz */}
      <div className="create-quiz-section">
        <select
          className="form-select note-dropdown"
          value={selectedNote}
          onChange={(e) => setSelectedNote(e.target.value)}
        >
          <option value="">-- Select Note --</option>
          {notes.map((n) => (
            <option key={n.id} value={n.id}>{n.title}</option>
          ))}
        </select>
        <button
          className="create-quiz-btn"
          onClick={createQuiz}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Creating...
            </>
          ) : (
            <>
              {/* <i className="bi bi-plus-circle me-1"></i> */}
              Create
            </>
          )}
        </button>
      </div>

      {/* Quiz Cards */}
      <div className="quiz-cards-container">
        {quizzes.map((q) => (
          <div key={q.id} className="quiz-card">
            <div className="quiz-info">
            <strong>
                {q.title
                  ? q.title.charAt(0).toUpperCase() + q.title.slice(1)
                  : "N/A"}
              </strong>  
              </div>

            <div className="quiz-actions">
              <GenerateQuiz testId={testId} quizID={q.id} />
               <button className="start-quiz-btn"   
                 onClick={() => handleStartQuiz(q.note_id, q.id)}>
                Start Quiz
              </button>

              <button className=" delete-btn"  onClick={() => deleteQuiz(q.id)}>
                {/* <i className="bi bi-trash"></i> */}
                 Delete
              </button>
            </div>
           
          </div>
        ))}
      </div>
    </div>
  );
}
