// src/components/Converter.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaSyncAlt, FaCopy, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import { formatNumber } from "../utils/format";

// Symbol map for currencies
const symbolMap: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", NGN: "₦", JPY: "¥",
  AUD: "A$", CAD: "C$", CHF: "Fr", CNY: "¥", INR: "₹",
  ZAR: "R", KRW: "₩", SEK: "kr", NOK: "kr", DKK: "kr",
  SGD: "S$", HKD: "HK$", BRL: "R$", MXN: "$", RUB: "₽",
  AED: "د.إ", GHS: "₵", KES: "KSh", TZS: "TSh", UGX: "USh",
  IDR: "Rp", MYR: "RM", PHP: "₱", THB: "฿", VND: "₫"
};

type RateData = Record<string, number>;
type CurrencyMeta = { code: string; name: string; symbol: string };

const API_KEY = "8182794e41dde7fdc8f7d0f5";
const API_CODES = `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`;
const API_LATEST = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest`;

async function fetchCurrencyMeta(): Promise<CurrencyMeta[]> {
  const { data } = await axios.get(API_CODES);
  return data.supported_codes.map(([code, name]: any) => ({
    code,
    name,
    symbol: symbolMap[code] || ""
  }));
}

async function fetchRates(base: string): Promise<RateData> {
  const { data } = await axios.get(`${API_LATEST}/${base}`);
  return data.conversion_rates;
}

export default function Converter() {
  const { dark, toggle } = useTheme();
  const [currencyList, setCurrencyList] = useState<CurrencyMeta[]>([]);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [amount, setAmount] = useState<string>("100");
  const [rates, setRates] = useState<RateData>({});
  const [converted, setConverted] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  useEffect(() => { fetchCurrencyMeta().then(setCurrencyList); }, []);
  useEffect(() => {
    if (!from) return;
    setLoading(true);
    fetchRates(from)
      .then(r => { setRates(r); setError(""); })
      .catch(() => setError("Failed to fetch rates"))
      .finally(() => setLoading(false));
  }, [from]);

  useEffect(() => {
    const amt = parseFloat(amount) || 0;
    if (rates && rates[to] != null) setConverted(amt * rates[to]);
    else setConverted(null);
  }, [amount, rates, to]);

  const filteredFrom = currencyList.filter(c =>
    c.code.includes(searchFrom.toUpperCase()) ||
    c.name.toLowerCase().includes(searchFrom.toLowerCase())
  );
  const filteredTo = currencyList.filter(c =>
    c.code.includes(searchTo.toUpperCase()) ||
    c.name.toLowerCase().includes(searchTo.toLowerCase())
  );

  const swap = () => { setFrom(to); setTo(from); };
  const copy = () => {
    if (!converted) return;
    navigator.clipboard.writeText(formatNumber(converted, to));
    setCopied(true); setTimeout(() => setCopied(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto p-6 sm:p-10 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md space-y-6 text-gray-800 dark:text-gray-100"
    >
      <motion.button
        onClick={toggle}
        className="absolute top-6 right-6 p-2 rounded-full bg-indigo-200 dark:bg-indigo-700 hover:brightness-110 transition"
        whileTap={{ scale: 0.9 }}
        title={dark ? "Light mode" : "Dark mode"}
      >
        {dark ? <FaSun size={18}/> : <FaMoon size={18}/>}
      </motion.button>

      <h1 className="text-center text-2xl sm:text-3xl font-semibold">💱 Converter</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            value={searchFrom}
            onChange={e => setSearchFrom(e.target.value)}
            placeholder="🔍 Search currency"
            className="w-full mb-2 p-2 bg-transparent border-b border-gray-400 focus:outline-none"
          />
          <select
            value={from}
            onChange={e => setFrom(e.target.value)}
            size={4}
            className="w-full bg-transparent"
          >
            {filteredFrom.map(c => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name} {c.symbol && `(${c.symbol})`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input
            value={searchTo}
            onChange={e => setSearchTo(e.target.value)}
            placeholder="🔍 Search currency"
            className="w-full mb-2 p-2 bg-transparent border-b border-gray-400 focus:outline-none"
          />
          <select
            value={to}
            onChange={e => setTo(e.target.value)}
            size={4}
            className="w-full bg-transparent"
          >
            {filteredTo.map(c => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name} {c.symbol && `(${c.symbol})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">Amount</label>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={e => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
          className="w-full p-3 bg-transparent border border-gray-400 rounded focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-center">
        <motion.button
          onClick={swap}
          whileTap={{ rotate: 180 }}
          className="p-3 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition"
        >
          <FaSyncAlt size={20} />
        </motion.button>
      </div>

      <motion.div
        onClick={copy}
        className="py-4 text-center text-3xl sm:text-4xl font-semibold bg-indigo-50 dark:bg-indigo-900 rounded-lg cursor-pointer break-words"
        whileTap={{ scale: 0.97 }}
      >
        {loading ? "⏳" :
         error ? <span className="text-red-500">{error}</span> :
         converted != null ?
           <>
             {formatNumber(parseFloat(amount), from)} ➝ {formatNumber(converted, to)}
             {copied && <FaCopy className="inline ml-2 text-green-500 animate-pulse" />}
           </>
         : "-"}
      </motion.div>
    </motion.div>
  );
}
