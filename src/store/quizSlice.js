import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = "http://localhost:8000/";

// -------- Async Thunks --------
export const fetchQuizzes = createAsyncThunk(
  "quiz/fetchQuizzes",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}quiz/quizzes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
      
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch quizzes");
    }
  }
);

export const submitQuiz = createAsyncThunk(
  "quiz/submitQuiz",
  async ({ quizId, answers }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}quiz/${quizId}/submit`, answers, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to submit quiz");
    }
  }
);

// -------- Slice --------
const slice = createSlice({
  name: "quiz",
  initialState: {
    quizzes: [],
    currentSession: null,
    results: {},
    status: "idle",
    error: null,
  },
  reducers: {
    startSession(state, action) {
      const quiz = state.quizzes.find((q) => q.id === action.payload);
      if (quiz) {
        state.currentSession = {
          id: Date.now().toString(),
          quizId: quiz.id,
          startedAt: Date.now(),
          answers: {},
          quiz,
        };
      }
    },
    answerQuestion(state, action) {
      const { qid, option } = action.payload;
      if (state.currentSession) {
        state.currentSession.answers[qid.toString()] = option;
      }
    },
    finishSession(state) {
      const session = state.currentSession;
      if (!session) return;

      const quiz = session.quiz;
      let correct = 0;
      quiz.questions.forEach((q, idx) => {
        if (session.answers[idx.toString()] === q.answer) correct++;
      });

      state.results[session.id] = {
        score: correct,
        total: quiz.questions.length,
        answers: session.answers,
        quiz,
      };
      state.currentSession = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => { state.status = "loading"; })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(submitQuiz.pending, (state) => { state.status = "submitting"; })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        const { quiz_id, score, total } = action.payload;
        state.results[quiz_id] = { score, total };
        state.status = "succeeded";
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { startSession, answerQuestion, finishSession } = slice.actions;
export default slice.reducer;
