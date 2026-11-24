import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, AlertCircle, Download, FileUp, LineChart as LineIcon, TrendingDown } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { holdout, modelScores } from "../data";

const chartTooltip = {
  contentStyle: { background: "#111b28", border: "1px solid #263647", borderRadius: 12, color: "#eaf3fb" },
  labelStyle: { color: "#a9bbcc" },
};

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("The CSV must include a header and at least one data row.");
  const headers = lines[0].split(",").map((value) => value.trim().replace(/^"|"$/g, "").toLowerCase());
  const yearIndex = headers.findIndex((value) => value === "year");
  const valueIndex = headers.findIndex((value) => ["smoke everyday", "actual", "prevalence", "value", "predicted"].includes(value));
  if (yearIndex < 0 || valueIndex < 0) throw new Error("Expected a Year column and a Smoke everyday, Actual, Prevalence, or Predicted value column.");
  const observations = lines.slice(1).map((line, index) => {
    const cells = line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
    const year = Number(cells[yearIndex]);
    const value = Number(cells[valueIndex]);
    if (!Number.isInteger(year) || !Number.isFinite(value)) throw new Error(`Invalid year or prevalence on CSV row ${index + 2}.`);
    return { year, value };
  });
  const yearly = new Map();
  for (const row of observations) {
    const previous = yearly.get(row.year) || { sum: 0, count: 0 };
    yearly.set(row.year, { sum: previous.sum + row.value, count: previous.count + 1 });
  }
  return [...yearly.entries()].map(([year, values]) => ({ year, actual: values.sum / values.count })).sort((a, b) => a.year - b.year);
}

export default function Forecasting() {
  const [selectedModel, setSelectedModel] = useState("GRU");
  const [history, setHistory] = useState([]);
  const [notice, setNotice] = useState("");
  const [forecast, setForecast] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    let active = true;
    fetch("/brfss-smoking-1995-2010.csv")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load bundled BRFSS data.");
        return response.text();
      })
      .then((text) => {
        if (!active) return;
        const rows = parseCsv(text);
        setHistory(rows);
        setNotice(`Loaded the bundled dataset: ${rows.length} observed years (1995–2010).`);
      })
      .catch((error) => setNotice(error.message || "Could not load the bundled dataset."));
    return () => { active = false; };
  }, []);
  const comparison = holdout[selectedModel];
  const selectedScore = modelScores.find((item) => item.model.toLowerCase().startsWith(selectedModel.toLowerCase())) || modelScores[0];
  const chartData = useMemo(() => {
    if (history.length) return history.map((row) => ({ ...row }));
    return comparison;
  }, [history, comparison]);

  async function importCsv(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const rows = parseCsv(await file.text());
      setHistory(rows);
      setNotice(`Loaded ${rows.length} observed year${rows.length === 1 ? "" : "s"} from ${file.name}.`);
    } catch (error) {
      setNotice(error.message || "Could not read the selected CSV.");
    }
    event.target.value = "";
  }

  async function importForecast(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const rows = parseCsv(await file.text());
      setForecast(rows.map(({ year, actual }) => ({ year, predicted: actual })));
      setNotice(`Loaded ${rows.length} supplied forecast point${rows.length === 1 ? "" : "s"}.`);
    } catch (error) {
      setNotice(error.message || "Could not read the selected forecast CSV.");
    }
    event.target.value = "";
  }

  const data = history.length ? chartData : comparison;
  const fullSeries = forecast.length ? [
    ...data.map((row) => ({ ...row })),
    ...forecast.map((row) => ({ year: row.year, predicted: row.predicted })),
  ] : data;

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><span className="eyebrow">POPULATION HEALTH · BRFSS</span><h1>Smoking prevalence forecast</h1><p>Explore the historical evaluation from your 1995–2010 state-level analysis.</p></div>
        <div className="button-row">
          <input ref={inputRef} className="visually-hidden" type="file" accept=".csv,text/csv" onChange={importCsv} />
          <button className="button secondary" onClick={() => inputRef.current?.click()}><FileUp size={16} /> Import history CSV</button>
          <label className="button secondary file-label"><Download size={16} /> Import forecast CSV<input className="visually-hidden" type="file" accept=".csv,text/csv" onChange={importForecast} /></label>
        </div>
      </section>

      <div className="stats-grid three">
        <Stat icon={<LineIcon size={18} />} label="Best listed RMSE" value="0.213" detail="Prophet · holdout" accent="cyan" />
        <Stat icon={<Activity size={18} />} label="Target" value="Smoke everyday" detail="State-level prevalence (%)" accent="blue" />
        <Stat icon={<TrendingDown size={18} />} label="Historical coverage" value={history.length ? `${history.length} years` : "1995–2010"} detail="56 states & territories in source" accent="green" />
      </div>

      {notice && <div className="notice"><AlertCircle size={16} />{notice}<button className="text-button" onClick={() => { setNotice(""); setHistory([]); setForecast([]); }}>Dismiss</button></div>}

      <section className="panel forecast-panel">
        <div className="panel-heading">
          <div><div className="eyebrow">MODEL EVALUATION</div><h2>Actual vs predicted</h2><p>{history.length ? "Imported observed series (no prediction unless one is supplied below)." : `${selectedModel} · actual holdout means vs notebook predictions, 2007–2010`}</p></div>
          <label className="select-wrap"><span>Model</span><select value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}><option>GRU</option><option>LSTM</option><option>XGBoost baseline</option></select></label>
        </div>
        <div className="chart-area large"><ResponsiveContainer width="100%" height="100%">
          <LineChart data={fullSeries} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#243241" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="year" stroke="#71859a" tickLine={false} axisLine={false} />
            <YAxis stroke="#71859a" tickLine={false} axisLine={false} domain={["auto", "auto"]} tickFormatter={(value) => `${value}%`} />
            <Tooltip {...chartTooltip} formatter={(value) => [`${Number(value).toFixed(2)}%`, undefined]} />
            <Legend />
            {history.length ? <Line type="monotone" dataKey="actual" name="Imported actual" stroke="#42d4dc" strokeWidth={2.5} dot={{ r: 3 }} connectNulls /> :
              <><Line type="monotone" dataKey="actual" name="Actual" stroke="#42d4dc" strokeWidth={2.5} dot={{ r: 4 }} /><Line type="monotone" dataKey="predicted" name="Notebook prediction" stroke="#ff8b76" strokeWidth={2.5} strokeDasharray="6 5" dot={{ r: 4 }} /></>}
          </LineChart>
        </ResponsiveContainer></div>
        <div className="footnote"><AlertCircle size={15} />{history.length ? "The chart shows only the uploaded observations. No forecasts are generated in this dashboard." : "These are notebook holdout outputs, not future forecasts. The chart covers four annual test points only."}</div>
      </section>

      <div className="two-col">
        <section className="panel">
          <div className="panel-heading compact"><div><div className="eyebrow">CHRONOLOGICAL HOLDOUT</div><h2>Model comparison</h2></div></div>
          <div className="chart-area medium"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelScores} layout="vertical" margin={{ left: 18, right: 15, top: 4, bottom: 2 }}>
              <CartesianGrid stroke="#243241" strokeDasharray="3 5" horizontal={false} />
              <XAxis type="number" stroke="#71859a" tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="model" width={125} stroke="#a9bbcc" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <Tooltip {...chartTooltip} formatter={(value) => [Number(value).toFixed(3), "RMSE"]} />
              <Bar dataKey="rmse" name="RMSE" fill="#37c7d7" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
          <div className="metric-table-wrap"><table className="metric-table"><thead><tr><th>Model</th><th>RMSE</th><th>MAE</th><th>MAPE</th></tr></thead><tbody>
            {modelScores.map((item) => <tr key={item.model} className={item.model === selectedScore.model ? "active-row" : ""}><td>{item.model}</td><td>{item.rmse.toFixed(3)}</td><td>{item.mae.toFixed(3)}</td><td>{item.mape.toFixed(2)}%</td></tr>)}
          </tbody></table></div>
        </section>
        <section className="panel model-notes">
          <div className="eyebrow">READ THE RESULTS</div><h2>Useful context</h2>
          <p>Errors are reported in percentage-point units for MAE and RMSE; MAPE is percent. Lower values are better on this specific holdout.</p>
          <div className="note-callout"><span className="note-dot" /><div><strong>Not a level playing field</strong><p>Classical and advanced methods were evaluated on slightly different state sets. Compare within each evaluation cohort; small score differences should not be over-interpreted.</p></div></div>
          <div className="note-callout"><span className="note-dot warm" /><div><strong>No model artifacts bundled</strong><p>Evaluation metrics and available holdout predictions are integrated. Future forecasts require trained model outputs—import a CSV with Year and Predicted columns to visualize supplied values.</p></div></div>
          <div className="note-callout"><span className="note-dot violet" /><div><strong>Short annual series</strong><p>Sixteen annual points are not enough to establish a dependable long-range trend; the holdout ranking is exploratory, not proof of future accuracy.</p></div></div>
          <div className="code-chip">CSV: Year, Smoke everyday<br />Forecast: Year, Predicted</div>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, detail, accent }) {
  return <div className={`stat-card ${accent}`}><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}
