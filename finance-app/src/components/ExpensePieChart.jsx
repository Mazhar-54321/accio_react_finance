import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensePieChart = ({ transactions }) => {
  const expenseTx = transactions.filter(tx => tx.type === "expense");

  const categoryTotals = expenseTx.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
    return acc;
  }, {});

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Expenses",
        data,
        backgroundColor: [
          "#f44336", "#ff9800", "#9c27b0", "#2196f3", "#ffc107", "#3f51b5"
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div style={{ maxWidth: 500, maxHeight:300, margin: "2rem auto" }}>
      {Boolean(data?.length)? <Pie style={{width:'auto !important'}} data={chartData} />:<div style={{display:'flex',justifyContent:'center',alignItems:'center',width:'100%',height:'300px'}}>
      <p>No Data to display</p></div>}
    </div>
  );
};

export default ExpensePieChart;
