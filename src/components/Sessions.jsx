import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import "../styles/sessions.css";
import Analytics from "./Analytics";

const API_URL = "http://127.0.0.1:8000/";

export default function Sessions() {
  const token = useSelector((s) => s.auth.token);
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch questions separately if needed
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
      const res = await axios.post(
        `${API_URL}sessions/${currentTest.id}/submit`,
        { answers },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        'Test submitted! Score'
      );

      setSubmittedTestId(currentTest.id); // 👈 store submitted test ID

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
    <div>
      <h4 className="mb-3">Available Tests</h4>

      {!currentTest && (
        <div className="d-flex flex-wrap gap-3">
          {tests.map((t) => {
            const startTime = new Date(t.start_at);
            const endTime = new Date(t.end_at);
            const isExpired = now > endTime;
            const isNotStarted = now < startTime;
            const isSubmitted = t.id === submittedTestId; // 👈 check if already submitted


            return (
              <div
                key={t.id}
                className="card p-3 shadow-sm"
                style={{ width: "250px" }}
              >
                <h5 className="mb-2">{t.title}</h5>
                <p className="mb-1">
                  <strong>Start:</strong> {startTime.toLocaleString()}
                </p>
                <p className="mb-3">
                  <strong>End:</strong> {endTime.toLocaleString()}
                </p>
                <button
                  className="btn btn-primary w-100"
                  disabled={isExpired || isNotStarted || isSubmitted} // 👈 disable after submission

                  onClick={() => startTest(t)}
                  style={{
                    cursor: isExpired || isNotStarted ? "not-allowed" : "pointer",
                    backgroundColor: isExpired ? "#6c757d" : undefined,
                  }}
                >
                {isSubmitted ? "Submitted" : isExpired ? "Expired" : isNotStarted ? "Not Started" : "Start Test"}

                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Current Test Questions */}
      {currentTest && (
        <div className="card p-3 mt-3 ">
          <h5 style={{"text-align": "center"}}>{currentTest.title}</h5>
          <ol>
            {questions.map((q, idx) => (
              <li key={q.id} className="mb-3">
                <p>
                  <strong>{q.ques}</strong>
                </p>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {q.options.map((opt, i) => (
                    <li key={i}>
                      <label>
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={i}
                          checked={answers[q.id]?.selected === opt}
                          onChange={() => handleAnswer(q.id, opt)}
                        />{" "}
                        {opt}
                      </label>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <div>  
          <button className="btn btn-success me-2" onClick={submitTest}>
            Submit Test
          </button>
          <button
            className="btn btn-secondary "
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
      <br/><br/>
      {submittedTestId && (
  <div className="mt-4">
    <h4>Analytics</h4>
    <Analytics testId={submittedTestId} />
  </div>
)}

    </div>
  );
}
