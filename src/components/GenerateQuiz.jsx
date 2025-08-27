import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import '../styles/generate_quiz.css';

const API_URL = "http://127.0.0.1:8000/";

export default function GenerateQuiz({ testId, quizID }) {
  const token = useSelector(s => s.auth.token);
  const [loading, setLoading] = useState(false);

  const generateQuestions = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Generating questions... This may take some time");
    try {
      const res = await axios.post(
        `${API_URL}tests/${testId}/bulk-from-quiz?quiz_id=${quizID}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.dismiss(loadingToast);
      toast.success(`${res.data.length} questions generated successfully!`);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Failed to generate questions!");
      setLoading(false);
    }
  };

  return (
    <div>
    <button 
      className=" auto-generate-btn"
      onClick={generateQuestions}
      disabled={loading}
      title="Auto Generate Quiz"
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" />
          Generating...
        </>
      ) : (
        <>
        Generate Questions
        </>
      )}
    </button>
    </div>
  );
}
