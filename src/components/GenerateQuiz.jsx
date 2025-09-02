import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import '../styles/generate_quiz.css';

// const API_URL = "http://127.0.0.1:8000/";
const API_URL = process.env.REACT_APP_API_URL;

export default function GenerateQuiz({ testId, quizID, onGenerated }) {
  const token = useSelector((s) => s.auth.accessToken);;
  const [loading, setLoading] = useState(false);

  const generateQuestions = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Generating questions... This may take some time");
    try {
      const res = await axios.post(
        `${API_URL}tests/${testId}/bulk-from-quiz`,
        { quiz_id: quizID }, // send in body
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.dismiss(loadingToast);
      toast.success(`${res.data.length} questions generated successfully!`);
      
      // 🔹 Call parent callback to refresh UI
      if (onGenerated) onGenerated();

    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Failed to generate questions!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        className="btn-pill btn-success-custom"
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
          <>Generate Test Questions</>
        )}
      </button>
    </div>
  );
}

