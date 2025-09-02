import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import "../styles/add_test_form.css";

const AddQuestionsForm = ({ testID, closeForm }) => {
  const token = useSelector((s) => s.auth.accessToken);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const api = axios.create({
    // baseURL: "http://127.0.0.1:8000",
    baseURL: process.env.REACT_APP_API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const addQuestion = () => {
    const newQuestion = {
      ques: "",
      type: "mcq",
      difficulty: "medium",
      points: 1,
      options: ["", "", "", ""],
      answer: null,
    };

    const updated = [...questions, newQuestion];
    setQuestions(updated);
    setExpandedIndex(updated.length - 1);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex][field] = value;

    if (field === "type" && value === "true_false") {
      updated[qIndex].options = ["True", "False"];
      updated[qIndex].answer = null;
    }

    if (field === "type" && value === "mcq") {
      updated[qIndex].options = ["", "", "", ""];
      updated[qIndex].answer = null;
    }

    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const setCorrectAnswer = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].answer = oIndex;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questions.length) return toast.error("Add at least one question!");
    setLoading(true);

    try {
      await api.post(`/tests/${testID}/create-manually`, { questions });
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
    <div className="add-questions-modal">
      <div className="modal-content">
        <h3 className="text-center mb-4">Add Questions</h3>

        <form onSubmit={handleSubmit}>
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="question-row">
              {/* Header */}
              <div
                className="d-flex justify-content-between align-items-center question-header p-2"
                onClick={() => toggleExpand(qIndex)}
                style={{ cursor: "pointer" }}
              >
                <span>
                  <i className="bi bi-question-circle me-2"></i>
                  Q{qIndex + 1}: {q.ques || "Untitled Question"}
                </span>
                <i
                  className={`bi ${
                    expandedIndex === qIndex
                      ? "bi-chevron-up"
                      : "bi-chevron-down"
                  }`}
                ></i>
              </div>

              {/* Body */}
              {expandedIndex === qIndex && (
                <div className="question-body">
                  <div className="mb-2">
                    <label className="form-label">Question</label>
                    <input
                      type="text"
                      value={q.ques}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "ques", e.target.value)
                      }
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="row mb-2">
                    <div className="col-md-4">
                      <label className="form-label">Type</label>
                      <select
                        value={q.type}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, "type", e.target.value)
                        }
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
                        onChange={(e) =>
                          handleQuestionChange(
                            qIndex,
                            "difficulty",
                            e.target.value
                          )
                        }
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
                        onChange={(e) =>
                          handleQuestionChange(
                            qIndex,
                            "points",
                            e.target.value
                          )
                        }
                        className="form-control"
                      />
                    </div>
                  </div>

                  {q.type === "mcq" && (
                    <div>
                        <label className="form-label">Options</label>
                        {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="input-group mb-2 gap-space">
                          <div className="input-box"> 
                            <input
                            type="text"
                            value={opt}
                            onChange={(e) =>
                                handleOptionChange(qIndex, oIndex, e.target.value)
                            }
                            className="form-control"
                            placeholder={`Option ${oIndex + 1}`}
                            />
                            </div>
                           <div>
                            <button
                            type="button"
                            className={`option-btn ${
                                q.answer === oIndex ? "correct" : "wrong"
                            }`}
                            onClick={() => setCorrectAnswer(qIndex, oIndex)}
                            >
                            <i className="bi bi-check-circle"></i>
                            </button>
                            </div>
                        </div>
                        ))}
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
                            className={` option-btn ${
                                q.answer === i ? "correct" : "wrong"
                            }`}
                            onClick={() => setCorrectAnswer(qIndex, i)}
                            >
                            <i className="bi bi-check-circle"></i> {opt}
                            </button>
                        ))}
                        </div>
                    </div>
                    )}



                </div>
              )}
            </div>
          )
          
          
          
          )}

         <div>
            
             <button
            type="button"
            className="add-btn "
            onClick={addQuestion}
          >
            <i className="bi bi-plus-circle me-2"></i> 
          </button>
            </div> {/* Add question */}
         

          {/* Submit + Cancel */}
            <div className="d-flex justify-content-evenly mt-4">
            <button
              type="submit"
              className=" add-q-btn py-2 px-2 "
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Submit Questions"}
            </button>

            <button
              type="button"
              className="cancel-btn px-5 py-3"
              onClick={closeForm}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionsForm;
