import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import "../styles/dashboard.css";

const API_URL = "http://127.0.0.1:8000/";

export default function Dashboard() {
  const token = useSelector((s) => s.auth.token);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);

  // Fetch tests
  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}tests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTests(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tests!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // Start test session
  const handleStartTest = async (test) => {
    try {
      // Start session
      const startRes = await axios.post(
        `${API_URL}tests/${test.id}/start`,
        { webcam_required: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch questions
      const qRes = await axios.get(`${API_URL}tests/${test.id}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedTest(test);
      setCurrentSession({
        testId: test.id,
        sessionId: startRes.data.session_id,
        questions: qRes.data,
        startedAt: startRes.data.started_at,
        duration: startRes.data.duration_minutes,
      });
      setAnswers({});
      toast.success("Test session started!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to start test!");
    }
  };

  // Handle answer selection
  const handleAnswer = (qid, option) => {
    setAnswers({ ...answers, [qid]: option });
  };

  // Submit test
  const handleSubmit = async () => {
    if (!currentSession) return;
    try {
      const res = await axios.post(
        `${API_URL}tests/${currentSession.testId}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Test submitted!");
      setResults([
        ...results,
        {
          test: selectedTest,
          score: res.data.score,
          maxScore: res.data.max_score,
          submittedAt: res.data.submitted_at,
        },
      ]);
      setSelectedTest(null);
      setCurrentSession(null);
      setAnswers({});
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit test!");
    }
  };

  // Stats
  const total = tests.length;
  const practice = tests.filter((t) => t.type === "practice").length;
  const exams = tests.filter((t) => t.type === "test").length;

  return (
    <div className="dashboard-container">
      {/* Stats cards */}
      <div className="cards">
        <div className="card">
          <p>Total Tests</p>
          <div className="stat">{total}</div>
        </div>
        <div className="card">
          <p>Practice</p>
          <div className="stat">{practice}</div>
        </div>
        <div className="card">
          <p>Exams</p>
          <div className="stat">{exams}</div>
        </div>
      </div>

      {/* Test list */}
      {!selectedTest && (
        <div className="card recent">
          <h5>Available Tests</h5>
          {loading && <p>Loading tests...</p>}
          <div className="tests-grid">
            {tests.map((t) => (
              <div key={t.id} className="quiz-card card">
                <h6>{t.title}</h6>
                <small>Type: {t.type || "N/A"}</small>
                <p>Start: {new Date(t.start_at).toLocaleString()}</p>
                <p>End: {new Date(t.end_at).toLocaleString()}</p>
                <button
                  className="btn-primary"
                  onClick={() => handleStartTest(t)}
                  disabled={
                    new Date() < new Date(t.start_at) ||
                    new Date() > new Date(t.end_at)
                  }
                >
                  {new Date() > new Date(t.end_at)
                    ? "Expired"
                    : new Date() < new Date(t.start_at)
                    ? "Not Started"
                    : "Start Test"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test detail view */}
      {selectedTest && currentSession && (
        <div className="quiz-detail card">
          <h5>{selectedTest.title}</h5>
          <ol>
            {currentSession.questions.map((q, idx) => (
              <li key={q.id} className="mb-3">
                <p>
                  <strong>{q.question}</strong>
                </p>
                <ul className="options">
                  {q.options.map((opt, i) => (
                    <li key={i}>
                      <label>
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={i}
                          checked={answers[q.id] === i}
                          onChange={() => handleAnswer(q.id, i)}
                        />{" "}
                        {opt}
                      </label>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <div className="actions">
            <button className="btn-success" onClick={handleSubmit}>
              Submit Test
            </button>
            <button
              className="btn-secondary"
              onClick={() => setSelectedTest(null)}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Previous results */}
      {results.length > 0 && (
        <div className="card results">
          <h5>Previous Results</h5>
          {results.map((r, idx) => (
            <div key={idx} className="result-card">
              <p>
                Test: <strong>{r.test.title}</strong>
              </p>
              <p>
                Score: {r.score} / {r.maxScore}
              </p>
              <p>Submitted: {new Date(r.submittedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
