import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/start_quiz.css";

const API_URL = "http://127.0.0.1:8000/";

export default function StartQuiz() {
  const token = useSelector((s) => s.auth.token);
  const { noteId, quizId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}quiz/${noteId}/quiz/${quizId}/questions?skip=0&limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const questionsWithId = res.data.items.map((q, idx) => ({
        id: q.id ?? idx,
        ...q,
      }));
      setQuestions(questionsWithId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (noteId && quizId) fetchQuestions();
  }, [noteId, quizId]);

  const handleSelect = (qid, optIndex) => {
    setAnswers((prev) => ({ ...prev, [qid]: optIndex }));
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${API_URL}quiz/${noteId}/quiz/${quizId}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit quiz");
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    setCurrent(0);
  };

  if (loading) return <p className="loading-text">Loading quiz...</p>;

  // RESULT VIEW
  if (result) {
    return (
      <div className="quiz-container">
        <h2 className="quiz-title">Quiz Results</h2>
        <p className="quiz-score">
          Score: {result.score} / {result.total}
        </p>
        {result.score === result.total && (
          <p className="congrats">🎉 Great job! All answers correct!</p>
        )}

        <div className="quiz-results">
          {questions.map((q, idx) => {
            const selected = answers[q.id];
            const correct = q.answer ?? 0;

            return (
              <div key={q.id} className="quiz-card result-card">
                <p className="question-text">{q.question}</p>
                <div className="options">
                  {q.options.map((opt, i) => {
                    const isSelected = selected === i;
                    const isCorrect = correct === i;
                    return (
                      <div
                        key={i}
                        className={`option-btn result-option ${
                          isCorrect
                            ? "correct"
                            : isSelected
                            ? "wrong"
                            : "neutral"
                        }`}
                      >
                        {opt}{" "}
                        {isCorrect ? "✅" : isSelected && !isCorrect ? "❌" : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="retry-section">
          <button className="retry-btn" onClick={handleRetry}>
            Retry Quiz
          </button>
        </div>
      </div>
    );
  }

  // QUIZ VIEW
  const question = questions[current];

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">Quiz</h2>
      {question ? (
        <>
          <p className="quiz-progress">
            Question {current + 1} / {questions.length}
          </p>

          <div className="quiz-card">
            <p className="question-text">{question.question}</p>
            <div className="options">
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={`option-btn ${
                    answers[question.id] === idx ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(question.id, idx)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-navigation">
            <button
              className="nav-btn"
              disabled={current === 0}
              onClick={() => setCurrent(current - 1)}
            >
              Prev
            </button>
            {current + 1 < questions.length ? (
              <button
                className="nav-btn"
                onClick={() => setCurrent(current + 1)}
              >
                Next
              </button>
            ) : (
              <button className="submit-btn" onClick={handleSubmit}>
                Submit Quiz
              </button>
            )}
          </div>
        </>
      ) : (
        <p>No questions available.</p>
      )}
    </div>
  );
}
