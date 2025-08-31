import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Spinner } from "react-bootstrap";
import "../styles/update_test_form.css";

const UpdateTestForm = ({ testID, closeForm }) => {
  const token =useSelector((s) => s.auth.accessToken);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const testRes = await api.get(`/tests/${testID}`);
        const questionsRes = await api.get(`/tests/${testID}/questions`);
        setFormData({ ...testRes.data, questions: questionsRes.data });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch test or questions");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testID]);

  if (!formData) return <p>Loading...</p>;

  const addQuestion = () => {
    const newQ = {
      ques: "",
      type: "mcq",
      difficulty: "medium",
      points: 1,
      options: ["", "", "", ""],
      answer: null,
    };
    const updated = [...formData.questions, newQ];
    setFormData({ ...formData, questions: updated });
    setExpandedIndex(updated.length - 1);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const updated = [...formData.questions];
    updated[qIndex][field] = value;

    if (field === "type" && value === "true_false") {
      updated[qIndex].options = ["True", "False"];
      updated[qIndex].answer = null;
    }
    if (field === "type" && value === "mcq") {
      updated[qIndex].options = ["", "", "", ""];
      updated[qIndex].answer = null;
    }
    setFormData({ ...formData, questions: updated });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...formData.questions];
    updated[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: updated });
  };

  const setCorrectAnswer = (qIndex, oIndex) => {
    const updated = [...formData.questions];
    updated[qIndex].answer = oIndex;
    setFormData({ ...formData, questions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/tests/update/${testID}`, formData);
      toast.success("Test updated successfully!");
      closeForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-questions-modal">
      <div className="modal-content">
        <h3 className="text-center mb-4">Update Test & Questions</h3>
        <form onSubmit={handleSubmit}>
          {/* Test fields */}
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="form-control"
            />
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Start At</label>
              <input
                type="datetime-local"
                value={formData.start_at?.slice(0, 16)}
                onChange={(e) => handleChange("start_at", e.target.value)}
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">End At</label>
              <input
                type="datetime-local"
                value={formData.end_at?.slice(0, 16)}
                onChange={(e) => handleChange("end_at", e.target.value)}
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) =>
                  handleChange("duration_minutes", e.target.value)
                }
                className="form-control"
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Shuffle Questions</label>
              <select
                value={formData.shuffle_questions}
                onChange={(e) =>
                  handleChange("shuffle_questions", e.target.value === "true")
                }
                className="form-select"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Allow Review</label>
              <select
                value={formData.allow_review}
                onChange={(e) =>
                  handleChange("allow_review", e.target.value === "true")
                }
                className="form-select"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          {/* Questions */}
          {formData.questions.map((q, qIndex) => (
            <div key={qIndex} className="question-row">
              <div
                className="d-flex justify-content-between align-items-center question-header p-2"
                onClick={() => toggleExpand(qIndex)}
                style={{ cursor: "pointer" }}
              >
                <span>
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
                          handleQuestionChange(qIndex, "points", e.target.value)
                        }
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
                            onChange={(e) =>
                              handleOptionChange(qIndex, oIndex, e.target.value)
                            }
                            className="form-control"
                          />
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
                      ))}
                    </div>
                  )}

                  {q.type === "true_false" && (
                    <div className="d-flex gap-2">
                      {q.options.map((opt, i) => (
                        <button
                          type="button"
                          key={i}
                          className={`option-btn ${
                            q.answer === i ? "correct" : "wrong"
                          }`}
                          onClick={() => setCorrectAnswer(qIndex, i)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="d-flex justify-content-start gap-3 mt-3">
            <button
              type="button"
              className="btn-success border-0 rounded-pill transition ease-in-out duration-200 "
              onClick={addQuestion}
            >
              <i className="bi bi-plus-circle me-2"></i>Add Questions
            </button>

            <button
              type="submit"
              className="btn-primary border-0  rounded-pill transition ease-in-out duration-200 "
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "  Update  Test Details "
              )}
            </button>

            <button
              type="button"
              className="btn-danger rounded-pill border-0 transition ease-in-out duration-200"
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

export default UpdateTestForm;
