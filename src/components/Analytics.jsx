import React, { useEffect, useState } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useSelector } from "react-redux";

const API_URL = "http://127.0.0.1:8000/";

export default function Analytics({ testId }) {
  const token = useSelector((s) => s.auth.token);
  const [data, setData] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_URL}analytics/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (testId) fetchAnalytics();
  }, [testId]);

  if (!data) return <p>Loading analytics...</p>;

  // total questions
  const totalQuestions = data.question_stats.length;

  // student correct/incorrect count
  const correctCount = data.student_percentage
    ? Math.round((data.student_percentage / 100) * totalQuestions)
    : 0;
  const incorrectCount = totalQuestions - correctCount;

  const pieOptions = {
    chart: { type: "pie" },
    title: { text: "Your Performance" },
    tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.1f}%)" },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: { enabled: true, format: "{point.name}: {point.y}" },
      },
    },
    series: [
      {
        name: "Questions",
        colorByPoint: true,
        data: [
          { name: "Correct", y: correctCount, color: "#007bff" }, // blue
          { name: "Incorrect", y: incorrectCount, color: "#17a2b8" }, // sky blue
        ],
      },
    ],
  };

  return (
    <div className="card p-3 mt-3">
      <h5>Test Analytics</h5>
      <p><strong>Total Attempts:</strong> {data.attempts}</p>
      <p><strong>Max Score:</strong> {data.max_score}</p>
      {data.student_percentage !== null && (
        <p><strong>Your Score:</strong> {data.student_percentage.toFixed(2)}%</p>
      )}

      <HighchartsReact highcharts={Highcharts} options={pieOptions} />
    </div>
  );
}
