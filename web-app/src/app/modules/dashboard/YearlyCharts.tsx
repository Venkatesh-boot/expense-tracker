import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const barData = [
  { month: 'Jan', amount: 1200 },
  { month: 'Feb', amount: 900 },
  { month: 'Mar', amount: 1500 },
  { month: 'Apr', amount: 1100 },
  { month: 'May', amount: 1700 },
  { month: 'Jun', amount: 1300 },
  { month: 'Jul', amount: 1400 },
  { month: 'Aug', amount: 1600 },
  { month: 'Sep', amount: 1250 },
  { month: 'Oct', amount: 1800 },
  { month: 'Nov', amount: 1350 },
  { month: 'Dec', amount: 1550 },
];

const pieData = [
  { name: 'Food', value: 8000 },
  { name: 'Transport', value: 3500 },
  { name: 'Shopping', value: 12000 },
  { name: 'Bills', value: 9000 },
  { name: 'Entertainment', value: 4000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF'];

export default function YearlyCharts() {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-green-700">Monthwise Expenses (Bar)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#34D399" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-green-700">Spend by Category (Pie)</h3>
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
    </div>
  );
}
