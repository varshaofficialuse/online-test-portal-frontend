import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import "../styles/sessions.css";

import Analytics from "./Analytics";

// const API_URL = "http://127.0.0.1:8000/";
const API_URL = process.env.API_URL;

export default function Sessions() {
  const token = useSelector((s) => s.auth.accessToken);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTest, setCurrentTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submittedTestId, setSubmittedTestId] = useState(null);

  // Fetch all tests
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
  const startTest = async (test) => {
    try {
      const res = await axios.post(
        `${API_URL}sessions/${test.id}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const qRes = await axios.get(`${API_URL}tests/${test.id}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCurrentTest({ ...test, sessionId: res.data.session_id });
      setQuestions(qRes.data);
      setAnswers({});
      toast.success("Test started!");
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.detail || "Failed to start test session!"
      );
    }
  };

  // Select answer
  const handleAnswer = (qid, option) => {
    setAnswers({ ...answers, [qid]: { selected: option } });
  };

  // Submit test
  const submitTest = async () => {
    if (!currentTest) return;

    try {
      await axios.post(
        `${API_URL}sessions/${currentTest.id}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Test submitted!");
      setSubmittedTestId(currentTest.id);

      setCurrentTest(null);
      setQuestions([]);
      setAnswers({});
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to submit test!");
    }
  };

  const now = new Date();

  if (loading) return <p>Loading tests...</p>;

  return (
    <div className="sessions-container">
      <br />
      <h4 className="mb-3 see-test">Available Tests</h4>
      <br />
      {!currentTest && (
        <div className="tests-list">
          {tests.map((t) => {
            const startTime = new Date(t.start_at);
            const endTime = new Date(t.end_at);
            const isExpired = now > endTime;
            const isNotStarted = now < startTime;
            const isSubmitted = t.id === submittedTestId;

            return (
              <div key={t.id} className="test-card">
                <div style={{ width: "100%" }}>
                  <div><h5 className="see-test">{t.title}</h5></div>
                  
                  <p>
                    <strong>Start:</strong> {startTime.toLocaleString()}
                  </p>
                  <p>
                    <strong>End:</strong> {endTime.toLocaleString()}
                  </p>
                  <button
                    className={`start-btn btn-pill 
    ${isSubmitted ? "btn-submitted" : ""} 
    ${isExpired ? "btn-expired" : ""} 
    ${isNotStarted ? "btn-notstarted" : ""} 
    ${!isExpired && !isNotStarted && !isSubmitted ? "btn-start" : ""}
  `}
                    disabled={isExpired || isNotStarted || isSubmitted}
                    onClick={() => startTest(t)}
                  >
                    {isSubmitted
                      ? "Submitted"
                      : isExpired
                      ? "Expired"
                      : isNotStarted
                      ? "Not Started"
                      : "Start Test"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Current Test Questions */}
      {currentTest && (
        <div className="current-test">
          <h5 style={{ textAlign: "center" }}>{currentTest.title}</h5>
          <ol>
            {questions.map((q, idx) => (
              <li key={q.id} className="question-item">
                <p className="question-text">{q.ques}</p>
                <div className="options-list">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      className={`option-btn ${
                        answers[q.id]?.selected === opt ? "selected" : ""
                      }`}
                      onClick={() => handleAnswer(q.id, opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          <div className="test-actions ">
            <button className="btn-primary-custom btn-pill" onClick={submitTest}>
              Submit Test
            </button>
            <button
              className=" btn-pill btn-back-custom"
              onClick={() => {
                setCurrentTest(null);
                setQuestions([]);
                setAnswers({});
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}
      <br /><br />
      {submittedTestId && (
        <div className="analytics-section">
          <h4>Analytics</h4>
          <Analytics testId={submittedTestId} />
        </div>
      )}
    </div>
  );
}
