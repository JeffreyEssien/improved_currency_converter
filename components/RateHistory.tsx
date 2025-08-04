"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

type ExchangeHistoryPoint = {
  date: string;
  rate: number;
};

type Props = {
  base: string;
  target: string;
};

export default function RateHistory({ base, target }: Props) {
  const [data, setData] = useState<ExchangeHistoryPoint[]>([]);
  const [percentChange, setPercentChange] = useState<number | null>(null);

  useEffect(() => {
    const fetchHistoricalRates = async () => {
      try {
        const fetched: ExchangeHistoryPoint[] = [];

        // Loop through last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const formattedDate = date.toISOString().split("T")[0];

          const response = await axios.get(
            `https://v6.exchangerate-api.com/v6/8182794e41dde7fdc8f7d0f5/history/${base}/${formattedDate}`
          );

          const rate = response.data.conversion_rates[target];

          fetched.push({
            date: formattedDate,
            rate,
          });
        }

        setData(fetched);

        const first = fetched[0].rate;
        const last = fetched[fetched.length - 1].rate;
        setPercentChange(((last - first) / first) * 100);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistoricalRates();
  }, [base, target]);

  const minRate = Math.min(...data.map((d) => d.rate));
  const maxRate = Math.max(...data.map((d) => d.rate));

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl text-white shadow-lg mt-6"
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{base} → {target} (7 Day History)</h2>
        {percentChange !== null && (
          <span
            className={`text-sm font-semibold ${
              percentChange >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {percentChange >= 0 ? "▲" : "▼"} {percentChange.toFixed(2)}%
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="#cbd5e1"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#334155" }}
          />
          <YAxis
            stroke="#cbd5e1"
            domain={["auto", "auto"]}
            tickFormatter={(v) => v.toFixed(2)}
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#334155" }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
            labelStyle={{ color: "#f1f5f9" }}
            formatter={(value: number) => [`${value.toFixed(4)}`, `${base} → ${target}`]}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#38bdf8"
            strokeWidth={3}
            dot={{ fill: "#38bdf8", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 text-sm text-gray-300">
        <p>High: <span className="text-green-400">{maxRate.toFixed(4)}</span></p>
        <p>Low: <span className="text-red-400">{minRate.toFixed(4)}</span></p>
      </div>
    </motion.div>
  );
}
