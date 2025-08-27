import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/";

export default function Analytics({ testId }) {
  const [data, setData] = useState(null);

  const fetchAnalytics = async () => {
    const res = await axios.get(`${API_URL}analytics/tests/${testId}`);
    setData(res.data);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [testId]);

  if (!data) return <p>Loading analytics...</p>;

  return (
    <div>
      <h4>Test Analytics</h4>
      <p>Average Score: {data.avg_score}</p>
      <p>Max Score: {data.max_score}</p>
      <p>Total Attempts: {data.attempts}</p>
    </div>
  );
}
