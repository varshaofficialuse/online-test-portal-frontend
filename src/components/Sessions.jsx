import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import '../styles/sessions.css';

const API_URL = "http://127.0.0.1:8000/";

export default function Sessions() {
  const token = useSelector(s => s.auth.token);
  const [tests, setTests] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  // fetch all tests
  const fetchTests = async () => {
    try {
      const res = await axios.get(`${API_URL}tests/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTests(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tests!");
    }
  };

  // start a session
  const startSession = async (testId) => {
    const loadingToast = toast.loading("Starting test...");
    try {
      await axios.post(`${API_URL}sessions/${testId}/start`, { webcam_required: false }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await axios.get(`${API_URL}tests/${testId}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentTest(testId);
      setQuestions(res.data);
      setAnswers({});
      toast.dismiss(loadingToast);
      toast.success("Test started!");
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Failed to start test!");
    }
  };

  // handle answer selection
  const handleAnswer = (qid, option) => {
    setAnswers({ ...answers, [qid]: { selected: option } });
  };

  // submit session
  const submitSession = async () => {
    const loadingToast = toast.loading("Submitting test...");
    try {
      await axios.post(`${API_URL}sessions/${currentTest}/submit`, { answers }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.dismiss(loadingToast);
      toast.success("Session submitted successfully!");
      setCurrentTest(null);
      setQuestions([]);
      setAnswers({});
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Failed to submit test!");
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  if (currentTest) {
    return (
      <div>
        <h4>Test in Progress</h4>
        <ol>
          {questions.map((q, idx) => (
            <li key={q.id} className="mb-3">
              <p><strong>{q.ques}</strong></p>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {q.options.map((opt, i) => (
                  <li key={i}>
                    <label>
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        onChange={() => handleAnswer(q.id, opt)}
                        checked={answers[q.id]?.selected === opt}
                      /> {opt}
                    </label>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <button className="btn btn-success" onClick={submitSession}>Submit Test</button>
      </div>
    );
  }

  return (
    <div>
      <h4>Available Tests</h4>
      <div className="d-flex flex-wrap gap-3">
        {tests.map(t => (
          <div key={t.id} className="card p-3" style={{ width: '220px' }}>
            <h6>{t.title}</h6>
            <p>{t.description}</p>
            <button className="btn btn-primary" onClick={() => startSession(t.id)}>Start Test</button>
          </div>
        ))}
      </div>
    </div>
  );
}
