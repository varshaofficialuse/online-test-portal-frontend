import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes, startSession, answerQuestion, submitQuiz, finishSession } from '../store/quizSlice';
import '../styles/dashboard.css';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { quizzes, currentSession, results, status, error } = useSelector(state => state.quiz);

  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const handleStartQuiz = (quizId) => {
    dispatch(startSession(quizId));
    const quiz = quizzes.find(q => q.id === quizId);
    setSelectedQuiz(quiz);
  };

  const handleAnswer = (qid, option) => {
    dispatch(answerQuestion({ qid, option }));
  };

  const handleSubmit = async () => {
    if (!currentSession) return;
    await dispatch(submitQuiz({ quizId: currentSession.quizId, answers: currentSession.answers }));
    dispatch(finishSession());
    setSelectedQuiz(null);
  };

  const total = quizzes.length;
  const practice = quizzes.filter(q => q.type === 'practice').length;
  const tests = quizzes.filter(q => q.type === 'test').length;

  return (
    <div>
      {/* Stats cards */}
      <div className="cards d-flex gap-3 mb-4">
        <div className="card p-3">Total Quizzes <div className="stat">{total}</div></div>
        <div className="card p-3">Practice <div className="stat">{practice}</div></div>
        <div className="card p-3">Tests <div className="stat">{tests}</div></div>
      </div>

      {/* Quiz list */}
      {!selectedQuiz && (
        <div className="recent card p-3">
          <h5>Available Quizzes</h5>
          {status === "loading" && <p>Loading quizzes...</p>}
          {error && <p className="text-danger">{error}</p>}
          <div className="d-flex flex-wrap gap-3">
            {quizzes.map(q => (
              <div
                key={q.id}
                className="quiz-card card p-3"
                style={{ cursor: "pointer", width: "220px" }}
              >
                <h6>{q.note_id ? `Note ${q.note_id}` : q.title}</h6>
                <small>Type: {q.type || 'N/A'}</small>
                <button className="btn btn-sm btn-primary mt-2" onClick={() => handleStartQuiz(q.id)}>
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz detail view */}
      {selectedQuiz && currentSession && (
        <div className="quiz-detail card p-3 mt-4">
          <h5>Quiz {selectedQuiz.id}</h5>
          <ol>
            {selectedQuiz.questions.map((q, idx) => (
              <li key={idx} className="mb-3">
                <p><strong>{q.question}</strong></p>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {q.options.map((opt, i) => (
                    <li key={i}>
                      <label>
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={i}
                          checked={currentSession.answers[idx]?.toString() === i.toString()}
                          onChange={() => handleAnswer(idx, i)}
                        /> {opt}
                      </label>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <button className="btn btn-success me-2" onClick={handleSubmit}>Submit Quiz</button>
          <button className="btn btn-secondary" onClick={() => setSelectedQuiz(null)}>Back to Dashboard</button>
        </div>
      )}

      {/* Display results */}
      {Object.keys(results).length > 0 && (
        <div className="mt-4">
          <h5>Previous Results</h5>
          {Object.values(results).map((r, idx) => (
            <div key={idx} className="card p-3 mb-2">
              <p>Quiz ID: {r.quiz.id}</p>
              <p>Score: {r.score} / {r.total}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
