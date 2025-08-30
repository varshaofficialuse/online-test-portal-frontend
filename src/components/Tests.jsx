import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import "../styles/tests.css";
import AddTestForm from "./AddTestForm";
import UpdateTestForm from "./UpdateTestForm";
import GenerateQuiz from "./GenerateQuiz";


const API_URL = "http://127.0.0.1:8000/";

export default function Tests() {
  const token = useSelector((s) => s.auth.token);
  const [tests, setTests] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [duration, setDuration] = useState(30);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [allowReview, setAllowReview] = useState(true);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState("");
  const [activeTestId, setActiveTestId] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "add" | "edit"

  const [testsHasQuestions, setTestsHasQuestions] = useState({}); // { testId: true/false }

const [quizzes, setQuizzes] = useState([]);
const [selectedQuiz, setSelectedQuiz] = useState("");
const [createdTestId, setCreatedTestId] = useState(null);
const [quizGenerated, setQuizGenerated] = useState(false);



  useEffect(() => {
    const fetchAllQuestions = async () => {
      const updated = {};
      for (const t of tests) {
        try {
          const res = await axios.get(`${API_URL}tests/${t.id}/questions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          updated[t.id] = res.data.length > 0; // true if questions exist
        } catch (err) {
          updated[t.id] = false;
        }
      }
      setTestsHasQuestions(updated);
    };

    if (tests.length > 0) fetchAllQuestions();
  }, [tests, token]);

  const fetchTests = async () => {
    try {
      const res = await axios.get(`${API_URL}tests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTests(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tests");
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}notes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
      if (res.data.length > 0) setSelectedNote(res.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const createTest = async () => {
    if (!title || !description || !startAt || !endAt) {
      toast.error("Please fill all fields!");
      return;
    }

    const loadingToast = toast.loading("Creating test...");
    try {
      const res = await axios.post(
        `${API_URL}tests/create`,
        {
          title,
          description,
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
          duration_minutes: duration,
          shuffle_questions: shuffleQuestions,
          allow_review: allowReview,
          note_id: selectedNote,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTests([...tests, res.data]);
      setCreatedTestId(res.data.id);

      setTitle("");
      setDescription("");
      setStartAt("");
      setEndAt("");
      toast.dismiss(loadingToast);
      toast.success("Test created successfully!");
    } catch (err) {
      console.error(err.response?.data);
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Failed to create test!");
    }
  };

  const deleteTest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    const loadingToast = toast.loading("Deleting test...");
    try {
      await axios.delete(`${API_URL}tests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTests(tests.filter((t) => t.id !== id));
      toast.dismiss(loadingToast);
      toast.success("Test deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Failed to delete test!");
    }
  };
  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(`${API_URL}quiz/quizzes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch quizzes");
    }
  };

  useEffect(() => {
    fetchTests();
    fetchNotes();
    fetchQuizzes(); // new

  }, []);
  useEffect(() => {
  if (createdTestId) {
    setQuizGenerated(false); // reset for each new test
    setSelectedQuiz("");     // also reset dropdown
  }
}, [createdTestId]);


  useEffect(() => {
    fetchTests();
  }, [
    title,
    description,
    startAt,
    endAt,
    duration,
    shuffleQuestions,
    allowReview,
  ]);

  return (
    <div className="tests-container">
      <h4>Create Test</h4>
      <div className="test-form">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="form-row">
          <label>
            Start Time
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </label>
          <label>
            End Time
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
          </label>
          <label>
            Note
            <select
              value={selectedNote}
              onChange={(e) => setSelectedNote(e.target.value)}
            >
              {notes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Duration (minutes)
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </label>
          <label>
            Shuffle Questions
            <select
              value={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.value === "true")}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label>
            Allow Review
            <select
              value={allowReview}
              onChange={(e) => setAllowReview(e.target.value === "true")}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
        </div>
        <div className="create-btn">
          <button className=" btn-primary " onClick={createTest}>
            Create Test
          </button>
        </div>
      </div>

      {createdTestId && !quizGenerated && (
  <div className="generate-quiz-section" style={{ marginTop: "15px" }}>
    <label>
      Do you want to generate the Test Questions from quiz? If Yes, select quiz from dropdown :
      <select
        value={selectedQuiz || ""}
        onChange={(e) => setSelectedQuiz(e.target.value)}
      >
        <option value="">No</option>
        {quizzes.map((q) => (
          <option key={q.id} value={q.id}>
            {q.title}
          </option>
        ))}
      </select>
    </label>

    {selectedQuiz && (
      <GenerateQuiz
        testId={createdTestId}
        quizID={selectedQuiz}
        onGenerated={() => {
          fetchTests();
          setQuizGenerated(true); // hide after generation
        }}
      />
    )}
  </div>
)}







      <h4 className="mt-4">All Tests</h4>
      <table className="tests-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Start</th>
            <th>End</th>
            <th>Actions</th>
            <th>Add Question</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((t) => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{t.description}</td>
              <td>{new Date(t.start_at).toLocaleString()}</td>
              <td>{new Date(t.end_at).toLocaleString()}</td>

              {/* Actions */}
              <td className="btn-gap">
                {/* EDIT BUTTON: enabled only if test already has questions */}
                <button
                  className="btn-warning"
                  title="Edit Test"
                  disabled={!testsHasQuestions[t.id]} // enable only if questions exist
                  onClick={() => {
                    setActiveTestId(t.id);
                    setModalMode("edit");
                  }}
                >
                  <i className="bi bi-pencil"></i>
                </button>

                {/* DELETE BUTTON: always enabled */}
                <button
                  className="btn-danger"
                  title="Delete"
                  onClick={() => deleteTest(t.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </td>

              {/* ADD QUESTION BUTTON: disabled if test already has questions */}
              <td>
                <button
                  className="add-q"
                  title="Add Questions"
                  disabled={testsHasQuestions[t.id]} // disable if questions exist
                  onClick={() => {
                    setActiveTestId(t.id);
                    setModalMode("add");
                  }}
                >
                  <i className="bi bi-plus-circle"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal */}

      
      {activeTestId && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h5>
                {modalMode === "add" ? "Add Questions to Test" : "Edit Test"}
              </h5>
              <button
                className="modal-close-btn"
                onClick={() => setActiveTestId(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {modalMode === "add" ? (
                <AddTestForm
                  testID={activeTestId}
                  closeForm={() =>{ setActiveTestId(null),fetchTests()}}
                />
              ) : (
                <UpdateTestForm
                  testID={activeTestId}
                  closeForm={() => {
                    setActiveTestId(null), fetchTests();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}