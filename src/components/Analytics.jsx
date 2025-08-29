import React, { useEffect, useState } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import toast from "react-hot-toast";

const API_URL = "http://127.0.0.1:8000/";

export default function Analytics({ testId }) {
  const [data, setData] = useState(null);
  const [chartOptions, setChartOptions] = useState({});

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_URL}analytics/tests/${testId}`);
      setData(res.data);

      // Count correct and incorrect answers
      const correct = res.data.question_stats.filter(q => q.correct_rate === 1).length;
      const incorrect = res.data.question_stats.filter(q => q.correct_rate < 1).length;

      // Set chart options
      setChartOptions({
        chart: {
          type: "pie"
        },
        title: {
          text: "Question-wise Correct vs Incorrect"
        },
        tooltip: {
          pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>"
        },
        accessibility: {
          point: {
            valueSuffix: "%"
          }
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f} %"
            }
          }
        },
        series: [
          {
            name: "Questions",
            colorByPoint: true,
            data: [
              { name: "Correct", y: correct, color: "#4CAF50" },
              { name: "Incorrect", y: incorrect, color: "#F44336" }
            ]
          }
        ]
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch analytics!");
    }
  };

  useEffect(() => {
    if (testId) fetchAnalytics();
  }, [testId]);

  if (!data) return <p>Loading analytics...</p>;

  return (
    <div className="analytics-container">
      <h4>Test Analytics</h4>
      <div className="stats">
        <p><strong>Average Score:</strong> {data.avg_score}</p>
        <p><strong>Max Score:</strong> {data.max_score}</p>
        <p><strong>Total Attempts:</strong> {data.attempts}</p>
      </div>
      <div className="chart">
        {chartOptions.series && <HighchartsReact highcharts={Highcharts} options={chartOptions} />}
      </div>
    </div>
  );
}
