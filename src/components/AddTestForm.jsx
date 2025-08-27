import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import "../styles/add_test_form.css";

const AddQuestionsForm = ({ testID, closeForm }) => {
  const token = useSelector((s) => s.auth.token);
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState([]);

  const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: { Authorization: `Bearer ${token}` },
  });

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        ques: "",
        type: "mcq",
        difficulty: "medium",
        points: 1,
        options: [""],
        answer: null,
      },
    ]);
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex][field] = value;

    if (field === "type" && value === "true_false") {
      updatedQuestions[qIndex].options = ["True", "False"];
      updatedQuestions[qIndex].answer = null;
    }

    if (field === "type" && value === "mcq" && !updatedQuestions[qIndex].options.length) {
      updatedQuestions[qIndex].options = [""];
      updatedQuestions[qIndex].answer = null;
    }

    setQuestions(updatedQuestions);
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options.push("");
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questions.length) return toast.error("Add at least one question!");
    setLoading(true);

    try {
      await api.post(`/tests/${testID}/add-questions`, { questions });
      toast.success("Questions added successfully!");
      setQuestions([]);
      closeForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error adding questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <h4 className="text-center mb-3">Add Questions</h4>

      <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-light">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="card p-3 mb-3 shadow-sm">
            <div className="mb-2">
              <label className="form-label">Question</label>
              <input
                type="text"
                value={q.ques}
                onChange={(e) => handleQuestionChange(qIndex, "ques", e.target.value)}
                className="form-control"
                required
              />
            </div>

            <div className="row mb-2">
              <div className="col-md-4">
                <label className="form-label">Type</label>
                <select
                  value={q.type}
                  onChange={(e) => handleQuestionChange(qIndex, "type", e.target.value)}
                  className="form-select"
                >
                  <option value="mcq">MCQ</option>
                  <option value="true_false">True/False</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Difficulty</label>
                <select
                  value={q.difficulty}
                  onChange={(e) => handleQuestionChange(qIndex, "difficulty", e.target.value)}
                  className="form-select"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Points</label>
                <input
                  type="number"
                  value={q.points}
                  onChange={(e) => handleQuestionChange(qIndex, "points", e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            {q.type === "mcq" && (
              <div>
                <label className="form-label">Options</label>
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="input-group mb-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      className="form-control"
                      placeholder={`Option ${oIndex + 1}`}
                    />
                    <button
                      type="button"
                      className={`btn btn-outline-success`}
                      onClick={() => handleQuestionChange(qIndex, "answer", oIndex)}
                    >
                      {q.answer === oIndex ? "✓ Answer" : "Set Answer"}
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => addOption(qIndex)}>
                  + Add Option
                </button>
              </div>
            )}

            {q.type === "true_false" && (
              <div className="mt-2">
                <label className="form-label">Select Answer</label>
                <div className="d-flex gap-2">
                  {q.options.map((opt, i) => (
                    <button
                      type="button"
                      key={i}
                      className={`btn btn-outline-success ${q.answer === i ? "active" : ""}`}
                      onClick={() => handleQuestionChange(qIndex, "answer", i)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        <button type="button" className="btn btn-outline-primary mb-3" onClick={addQuestion}>
          + Add Question
        </button>

        <div className="d-flex justify-content-between">
          <button type="submit" className="btn btn-success px-4 py-2" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Add Questions"}
          </button>

          <button type="button" className="btn btn-secondary px-4 py-2" onClick={closeForm}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddQuestionsForm;
