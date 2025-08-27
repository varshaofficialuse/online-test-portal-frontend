import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { answerQuestion, finishSession } from '../store/quizSlice';
import { useNavigate } from 'react-router-dom';
import '../styles/exam.css';
export default function ExamSession(){
  const session = useSelector(s=>s.quiz.currentSession);
  const results = useSelector(s=>s.quiz.results);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(()=>{
    if(!session){
      navigate('/tests');
      return;
    }
    const quiz = session.quiz;
    if(quiz.time_minutes) setTimeLeft(quiz.time_minutes * 60);
    const t = setInterval(()=>{
      setTimeLeft(prev=>{
        if(prev<=1){ clearInterval(t); handleSubmit(); return 0; }
        return prev-1;
      });
    },1000);
    return ()=>clearInterval(t);
  },[session]);

  if(!session) return null;
  const { quiz } = session;
  const choose = (qid, option)=>{ dispatch(answerQuestion({ qid, option })); }
  const handleSubmit = ()=>{ dispatch(finishSession()); const ids = Object.keys(results); const last = ids[ids.length-1]; navigate('/result/'+last); }

  const fmt = (s)=>{ const m=Math.floor(s/60); const sec=s%60; return m+':'+String(sec).padStart(2,'0'); }

  return (
    <div className="exam">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>{quiz.title}</h5>
        {quiz.time_minutes ? <div className="timer">Time left: {fmt(timeLeft)}</div> : null}
      </div>
      <div className="questions">
        {quiz.questions.map((q,idx)=>(
          <div className="card mb-3 p-3" key={q.id}>
            <div><strong>{idx+1}. {q.text}</strong></div>
            <div className="options mt-2">
              {q.options.map((opt,i)=>(
                <button key={i} className="btn btn-outline-secondary btn-sm m-1" onClick={()=>choose(q.id,i)}>{opt}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <button className="btn btn-success" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}
