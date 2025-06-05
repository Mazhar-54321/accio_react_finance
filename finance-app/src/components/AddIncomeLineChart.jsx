import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { format } from "date-fns";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const AddIncomeLineChart = ({ transactions }) => {
  const incomeTx = transactions
    .filter(tx => tx.type === "income")
    .sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);

  const labels = incomeTx.map(tx =>
    tx.timestamp?.seconds ? format(new Date(tx.timestamp.seconds * 1000), "dd MMM") : ""
  );
  const data = incomeTx.map(tx => Number(tx.amount));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Income",
        data,
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        tension: 0.3
      }
    ]
  };

  return (
    <div style={{ maxWidth: 600,minHeight:300, margin: "2rem auto" }}>
      {Boolean(data?.length)?<Line data={chartData} />:<div style={{display:'flex',justifyContent:'center',alignItems:'center',width:'100%',height:'300px'}}>
        <p>No Data to display</p></div>}
    </div>
  );
};

export default AddIncomeLineChart;
