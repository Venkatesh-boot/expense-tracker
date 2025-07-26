import React from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';

const pieData = [
  { name: 'Food', value: 500 },
  { name: 'Transport', value: 200 },
  { name: 'Shopping', value: 1200 },
  { name: 'Bills', value: 800 },
  { name: 'Entertainment', value: 300 },
];

// Example daywise data for a 30-day month
const barData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  amount: Math.floor(Math.random() * 500) + 100 // Random amount between 100-600
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF'];

export default function MonthlyCharts() {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-blue-700">Expense Breakdown (Pie)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label
            >
              {pieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-blue-700">Expense by Day (Bar)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
