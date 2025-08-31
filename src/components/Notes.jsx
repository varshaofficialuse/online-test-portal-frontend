import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import '../styles/notes.css';

const API_URL = "http://127.0.0.1:8000/";

export default function Notes() {
  const token =useSelector((s) => s.auth.accessToken);
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}notes/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch notes!");
    }
  };

  const addNote = async () => {
    if (!title || !content) {
      toast.error("Title and content are required!");
      return;
    }
    const loadingToast = toast.loading("Adding note...");
    try {
      const res = await axios.post(`${API_URL}notes/`, { title, content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes([...notes, res.data]);
      setTitle('');
      setContent('');
      toast.dismiss(loadingToast);
      toast.success("Note added successfully!");
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Failed to add note!");
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    const loadingToast = toast.loading("Deleting note...");
    try {
      await axios.delete(`${API_URL}notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter(n => n.id !== id));
      toast.dismiss(loadingToast);
      toast.success("Note deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Failed to delete note!");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="notes-container">
      <h4>My Notes</h4>

      <div className="note-form">
        <input
          className="note-input"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="note-textarea"
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <div> 
        <button className="btn-pill btn-primary-custom" onClick={addNote}>Add Note</button>
        </div>
      </div>

      <div className="notes-table-container">
        <table className="notes-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Title</th>
              <th>Content</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notes.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>No notes found</td>
              </tr>
            )}
            {notes.map((note, idx) => (
              <tr key={note.id}>
                <td>{idx + 1}</td>
                <td>{note.title}</td>
                <td>{note.content}</td>
                <td className="btn-gap">
                  {/* <button className="btn-circle btn-info" title="View"><i className="bi bi-eye"></i></button> */}
                  {/* <button className="btn-circle btn-warning" title="Edit"><i className="bi bi-pencil"></i></button> */}
                  <button className="btn-circle btn-danger" title="Delete" onClick={() => deleteNote(note.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
