import { lazy, Suspense, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Brain, ChartNoAxesCombined, ChevronRight, CircleHelp,
  Cigarette, Clock3, Heart, HeartPulse, LayoutDashboard, Leaf, Menu, Microscope, Moon,
  Orbit, PanelLeftClose, ShieldCheck, Sparkles, Sun, Wind, X,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { organs, prevalence, quitMilestones, sources } from "./data";

const AnatomyScene = lazy(() => import("./components/AnatomyScene"));
const Forecasting = lazy(() => import("./components/Forecasting"));

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "WORKSPACE" },
  { id: "body", label: "3D Human Body", icon: Orbit, group: "WORKSPACE" },
  { id: "simulator", label: "Smoking Simulator", icon: Cigarette, group: "WORKSPACE" },
  { id: "organs", label: "Organ Analysis", icon: HeartPulse, group: "WORKSPACE" },
  { id: "timeline", label: "Quitting Timeline", icon: Clock3, group: "INSIGHTS" },
  { id: "statistics", label: "Smoking Statistics", icon: ChartNoAxesCombined, group: "INSIGHTS" },
  { id: "forecast", label: "AI Forecasting", icon: Sparkles, group: "INSIGHTS" },
  { id: "about", label: "About Project", icon: CircleHelp, group: "INSIGHTS" },
];

const initialScenario = { cigarettes: 10, years: 8, age: "", frequency: "Daily", status: "Current smoker" };

function exposureFor(scenario) {
  if (scenario.status === "Never smoked") return 0;
  const raw = ((Number(scenario.cigarettes) || 0) / 20) * (Number(scenario.years) || 0);
  const frequencyScale = scenario.frequency.toLowerCase().includes("some days") ? 0.55 : 1;
  return Math.min(1, (raw * frequencyScale) / 30);
}

function packYears(scenario) {
  if (scenario.status === "Never smoked") return 0;
  return ((Number(scenario.cigarettes) || 0) / 20) * (Number(scenario.years) || 0);
}

function IconFor({ id, size = 17 }) {
  const map = { lungs: Wind, heart: Heart, brain: Brain, vessels: Activity, mouth: Sparkles, liver: ShieldCheck, stomach: Activity, kidneys: Activity, trachea: Wind, skin: Leaf };
  const Icon = map[id] || Activity;
  return <Icon size={size} />;
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [scenario, setScenario] = useState(initialScenario);
  const [selectedOrgan, setSelectedOrgan] = useState("lungs");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("classic");
  const exposure = exposureFor(scenario);
  const pack = packYears(scenario);
  const selected = organs[selectedOrgan];
  const content = useMemo(() => {
    const current = navigation.find((item) => item.id === page);
    return current || navigation[0];
  }, [page]);

  function update(key, value) {
    setScenario((previous) => ({
      ...previous,
      [key]: value,
      ...(key === "status" && value === "Never smoked" ? { cigarettes: 0, years: 0 } : {}),
    }));
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Activity size={22} strokeWidth={2.4} /></div>
          <div className="brand-copy"><strong>smoke<span>sense</span></strong><small>HEALTH INTELLIGENCE</small></div>
          <button className="mobile-close" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-picker"><div className="workspace-avatar">S</div><div><strong>SmokeSense AI</strong><small>Research workspace</small></div><ChevronRight size={15} /></div>
        <nav className="nav-list" aria-label="Main navigation">
          {["WORKSPACE", "INSIGHTS"].map((group) => <div className="nav-group" key={group}>
            <div className="nav-group-label">{group}</div>
            {navigation.filter((item) => item.group === group).map(({ id, label, icon: Icon }) => (
              <button key={id} className={`nav-item ${page === id ? "active" : ""}`} onClick={() => { setPage(id); setSidebarOpen(false); }}>
                <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{id === "forecast" && <span className="nav-new">DATA</span>}
              </button>
            ))}
          </div>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-status"><span className="status-dot" /><span>Educational mode active</span></div>
          <button className="profile-button" onClick={() => { setPage("about"); setSidebarOpen(false); }} title="Open project information"><div className="profile-avatar">SS</div><div><strong>Research demo</strong><small>Local session</small></div><PanelLeftClose size={17} /></button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{content.label}</strong></div>
          <div className="topbar-right"><span className="live-badge"><span /> LIVE SIMULATION</span><button className="theme-indicator" type="button" title={`Switch to ${theme === "classic" ? "light" : "classic"} theme`} aria-label={`Switch to ${theme === "classic" ? "light" : "classic"} theme`} onClick={() => setTheme((current) => current === "classic" ? "light" : "classic")}>{theme === "classic" ? <Sun size={17} /> : <Moon size={17} />}</button><div className="top-avatar">SS</div></div>
        </header>
        <div className="content-area">
          {page === "dashboard" && <Dashboard
            exposure={exposure} scenario={scenario} pack={pack} selected={selected} selectedOrgan={selectedOrgan}
            onSelect={setSelectedOrgan} setPage={setPage} update={update}
          />}
          {page === "body" && <BodyPage exposure={exposure} selected={selected} selectedOrgan={selectedOrgan} onSelect={setSelectedOrgan} scenario={scenario} pack={pack} update={update} />}
          {page === "simulator" && <SimulatorPage exposure={exposure} scenario={scenario} pack={pack} update={update} selected={selected} />}
          {page === "organs" && <OrganPage selectedOrgan={selectedOrgan} setSelectedOrgan={setSelectedOrgan} exposure={exposure} />}
          {page === "timeline" && <TimelinePage />}
          {page === "statistics" && <StatisticsPage />}
          {page === "forecast" && <Suspense fallback={<div className="panel loading-panel">Loading forecasting dashboard…</div>}><Forecasting /></Suspense>}
          {page === "about" && <AboutPage />}
        </div>
        <footer className="app-footer"><span>SmokeSense AI <span className="footer-sep">·</span> Educational visualization only</span><span>Not a diagnostic tool or medical advice</span></footer>
      </main>
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}

function PageTitle({ eyebrow, title, description, right }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{right}</div>;
}

function AnatomyView(props) {
  return <Suspense fallback={<div className="anatomy-loading">Loading interactive 3D anatomy…</div>}><AnatomyScene {...props} /></Suspense>;
}

function Dashboard({ exposure, scenario, pack, selected, selectedOrgan, onSelect, setPage, update }) {
  return <div className="page-stack">
    <PageTitle eyebrow="HEALTH INTELLIGENCE · EDUCATIONAL DEMO" title="A clearer view of smoking's impact." description="Explore how smoking affects the body, and investigate population-level trends." right={<div className="secure-tag"><ShieldCheck size={15} /> Private, local simulation</div>} />
    <div className="stats-grid">
      <div className="stat-card cyan"><div className="stat-icon"><Cigarette size={18} /></div><div><span>Calculated exposure</span><strong>{pack.toFixed(1)} <small>pack-years</small></strong><small>Based on inputs · not a risk score</small></div></div>
      <div className="stat-card coral"><div className="stat-icon"><HeartPulse size={18} /></div><div><span>Scenario status</span><strong className="text-medium">{scenario.status}</strong><small>{scenario.cigarettes} cigarettes/day · {scenario.years} years</small></div></div>
      <div className="stat-card green"><div className="stat-icon"><ChartNoAxesCombined size={18} /></div><div><span>Forecasting data</span><strong>1995–2010</strong><small>BRFSS · 56 state / territory units</small></div></div>
      <div className="stat-card violet"><div className="stat-icon"><Microscope size={18} /></div><div><span>Best listed RMSE</span><strong>0.213</strong><small>Prophet · holdout evaluation</small></div></div>
    </div>
    <div className="dashboard-grid">
      <section className="panel body-panel">
        <div className="panel-heading"><div><div className="eyebrow">INTERACTIVE ANATOMY</div><h2>Explore the human body</h2></div><button className="text-button" onClick={() => setPage("body")}>Open full view <ChevronRight size={14} /></button></div>
        <div className="body-layout">
          <div className="body-visual-wrap"><AnatomyView exposure={exposure} selected={selectedOrgan} onSelect={onSelect} /><div className="model-badge"><span className="model-pulse" /> {scenario.status === "Never smoked" ? "REFERENCE VIEW" : "EXPOSURE VIEW"}</div></div>
          <OrganInfo organ={selected} exposure={exposure} />
        </div>
      </section>
      <aside className="side-stack">
        <SimulatorCard scenario={scenario} update={update} pack={pack} exposure={exposure} compact />
        <section className="panel mini-trend">
          <div className="panel-heading compact"><div><div className="eyebrow">BRFSS · SMOKE EVERYDAY</div><h2>Prevalence trend</h2></div><button className="icon-button small" onClick={() => setPage("statistics")} aria-label="Open smoking statistics"><ChevronRight size={16} /></button></div>
          <div className="trend-value"><strong>12.86%</strong><span><ArrowDownRight size={14} /> 7.16 pts</span><small>1995–2010</small></div>
          <div className="chart-area trend-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={prevalence} margin={{ top: 5, right: 3, left: -30, bottom: 0 }}>
            <defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#38c9d7" stopOpacity={0.3} /><stop offset="100%" stopColor="#38c9d7" stopOpacity={0} /></linearGradient></defs>
            <XAxis dataKey="year" hide /><YAxis domain={[10, 20]} hide /><Tooltip contentStyle={{ background: "#111b28", border: "1px solid #263647", borderRadius: 9, color: "#edf5fb" }} formatter={(value) => [`${value}%`, "Smoke everyday"]} labelFormatter={(value) => `Year ${value}`} />
            <Area type="monotone" dataKey="prevalence" stroke="#42d4dc" strokeWidth={2} fill="url(#trendFill)" />
          </AreaChart></ResponsiveContainer></div>
          <div className="chart-caption"><span>1995</span><span>16 annual observations</span><span>2010</span></div>
          <button className="text-button trend-link" onClick={() => setPage("forecast")}>Explore forecast evaluation <ChevronRight size={14} /></button>
        </section>
      </aside>
    </div>
    <section className="organ-strip panel">
      <div className="strip-title"><div><div className="eyebrow">SYSTEM OVERVIEW</div><h2>Choose an organ to explore</h2></div><button className="text-button" onClick={() => setPage("organs")}>View all insights <ChevronRight size={14} /></button></div>
      <div className="organ-tiles">{Object.entries(organs).map(([id, organ]) => <button key={id} onClick={() => { onSelect(id); setPage("organs"); }} className={`organ-tile ${selectedOrgan === id ? "selected" : ""}`}><span className={`organ-icon ${id}`}><IconFor id={id} size={19} /></span><span>{organ.name}</span><ChevronRight size={14} className="organ-arrow" /></button>)}</div>
    </section>
  </div>;
}

function OrganInfo({ organ, exposure }) {
  return <div className="organ-info">
    <span className="organ-tag"><span style={{ background: organ.color }} />{organ.short}</span>
    <h3>{organ.name}</h3>
    <div className="compare-block"><div className="compare-label"><span>HEALTHY</span><span className="healthy-mark">REFERENCE</span></div><p>{organ.healthy}</p></div>
    <div className="compare-block exposed"><div className="compare-label"><span>SMOKING EXPOSURE</span><span className="exposure-mark">EDUCATIONAL</span></div><p>{organ.exposed}</p></div>
    <div className="impact-meter"><div className="meter-caption"><span>Visualization intensity</span><span>{Math.round(exposure * 100)}%</span></div><div className="meter-track"><span style={{ width: `${Math.max(3, exposure * 100)}%` }} /></div><small>Illustrative animation only · not measured organ damage</small></div>
  </div>;
}

function SimulatorCard({ scenario, update, pack, exposure, compact = false }) {
  const statusNever = scenario.status === "Never smoked";
  return <section className={`panel simulator-card ${compact ? "compact-sim" : ""}`}>
    <div className="panel-heading"><div><div className="eyebrow">PERSONALIZED SCENARIO</div><h2>Exposure simulator</h2></div>{!compact && <div className="sim-icon"><Cigarette size={19} /></div>}</div>
    <div className="status-pills">{["Never smoked", "Current smoker", "Former smoker"].map((status) => <button key={status} className={scenario.status === status ? "active" : ""} onClick={() => update("status", status)}>{status}</button>)}</div>
    <div className="control-row"><div className="control-heading"><label htmlFor={`cigs${compact ? "-compact" : ""}`}>Cigarettes per day</label><strong>{statusNever ? 0 : scenario.cigarettes}<small> / 40</small></strong></div>
      <input id={`cigs${compact ? "-compact" : ""}`} type="range" min="0" max="40" value={scenario.cigarettes} disabled={statusNever} onChange={(event) => update("cigarettes", Number(event.target.value))} style={{ "--range-progress": `${Number(scenario.cigarettes) / 40 * 100}%` }} />
      <div className="range-labels"><span>0</span><span>40 cigarettes / day</span></div>
    </div>
    <div className="control-row"><div className="control-heading"><label htmlFor={`years${compact ? "-compact" : ""}`}>Years smoked</label><strong>{statusNever ? 0 : scenario.years}<small> / 50</small></strong></div>
      <input id={`years${compact ? "-compact" : ""}`} type="range" min="0" max="50" value={scenario.years} disabled={statusNever} onChange={(event) => update("years", Number(event.target.value))} style={{ "--range-progress": `${Number(scenario.years) / 50 * 100}%` }} />
      <div className="range-labels"><span>0</span><span>50 years</span></div>
    </div>
    {!compact && <div className="form-grid">
      <label className="field-label">Smoking frequency<select value={scenario.frequency} onChange={(event) => update("frequency", event.target.value)}><option>Daily</option><option>Some days</option><option>Former daily</option><option>Former some days</option></select></label>
      <label className="field-label">Age <span>optional</span><input type="number" min="18" max="120" placeholder="Not provided" value={scenario.age} onChange={(event) => update("age", event.target.value)} /></label>
    </div>}
    {compact && <div className="compact-controls"><label>Frequency<select value={scenario.frequency} onChange={(event) => update("frequency", event.target.value)}><option>Daily</option><option>Some days</option><option>Former daily</option><option>Former some days</option></select></label><label>Age <input type="number" min="18" max="120" placeholder="Optional" value={scenario.age} onChange={(event) => update("age", event.target.value)} /></label></div>}
    <div className="pack-years"><div><span>Estimated pack-years</span><small>(cigarettes / day ÷ 20) × years</small></div><strong>{pack.toFixed(1)}</strong></div>
    <div className="medical-disclaimer"><CircleHelp size={15} /><span>This is a calculated exposure measure—not a personal diagnosis, prediction, or medical-risk estimate.</span></div>
  </section>;
}

function BodyPage({ exposure, selected, selectedOrgan, onSelect, scenario, pack, update }) {
  return <div className="page-stack"><PageTitle eyebrow="3D ANATOMY LAB" title="Explore the body" description="Choose Surface, X-ray, or Internal mode; select an organ, drag to rotate, right-drag to pan, and scroll to zoom." right={<span className="secure-tag"><span className="model-pulse" /> Interactive illustration</span>} />
    <div className="body-page-grid"><section className="panel body-stage"><div className="body-page-visual"><AnatomyView exposure={exposure} selected={selectedOrgan} onSelect={onSelect} /></div><div className="organ-selector">{Object.entries(organs).map(([id, organ]) => <button className={id === selectedOrgan ? "selected" : ""} key={id} onClick={() => onSelect(id)}><IconFor id={id} size={16} />{organ.name}</button>)}</div></section><div className="body-page-side"><OrganInfo organ={selected} exposure={exposure} /><SimulatorCard scenario={scenario} update={update} pack={pack} exposure={exposure} compact /></div></div>
  </div>;
}

function SimulatorPage({ exposure, scenario, pack, update, selected }) {
  return <div className="page-stack"><PageTitle eyebrow="INTERACTIVE EXPOSURE MODEL" title="Smoking simulator" description="Change the scenario to explore how the educational visualization responds." />
    <div className="simulator-page-grid"><SimulatorCard scenario={scenario} update={update} pack={pack} exposure={exposure} /><section className="panel simulation-preview"><div className="panel-heading"><div><div className="eyebrow">LIVE VISUALIZATION</div><h2>Exposure response</h2></div><span className="live-badge"><span /> LIVE</span></div><div className="sim-preview-canvas"><AnatomyView exposure={exposure} selected="lungs" onSelect={() => {}} /></div><div className="preview-organ"><span className="organ-icon lungs"><Wind size={19} /></span><div><strong>{selected.name} · illustrative view</strong><p>Visual shading changes smoothly with the selected exposure inputs. It does not represent tissue pathology.</p></div></div><div className="exposure-summary"><div><span>Pack-years</span><strong>{pack.toFixed(1)}</strong></div><div><span>Animation scale</span><strong>{Math.round(exposure * 100)}%</strong></div><div><span>Current status</span><strong>{scenario.status}</strong></div></div></section></div>
  </div>;
}

function OrganPage({ selectedOrgan, setSelectedOrgan, exposure }) {
  const selected = organs[selectedOrgan];
  return <div className="page-stack"><PageTitle eyebrow="ORGAN-SPECIFIC EDUCATION" title="How smoking affects the body" description="Evidence-based context for each system. Individual outcomes vary and cannot be inferred from this illustration." />
    <div className="organ-page-layout"><div className="organ-list panel">{Object.entries(organs).map(([id, organ]) => <button key={id} className={`organ-list-item ${selectedOrgan === id ? "active" : ""}`} onClick={() => setSelectedOrgan(id)}><span className={`organ-icon ${id}`}><IconFor id={id} /></span><span><strong>{organ.name}</strong><small>{organ.short}</small></span><ChevronRight size={16} /></button>)}</div>
      <section className="panel organ-detail"><div className="detail-header"><span className={`organ-icon ${selectedOrgan}`}><IconFor id={selectedOrgan} size={22} /></span><div><div className="eyebrow">{selected.short.toUpperCase()}</div><h2>{selected.name}</h2></div><span className="educational-tag">EDUCATIONAL</span></div>
        <div className="organ-compare-grid"><div className="compare-card healthy"><span className="compare-chip">HEALTHY FUNCTION</span><p>{selected.healthy}</p></div><div className="compare-card smoking"><span className="compare-chip">POTENTIAL SMOKING EFFECTS</span><p>{selected.exposed}</p></div></div>
        <h3 className="detail-subhead">What research tells us</h3><div className="detail-bullets">{selected.details.map((item) => <div key={item}><span />{item}</div>)}</div>
        <div className="detail-callout"><CircleHelp size={17} /><span>These are population-level associations and general educational information, not a way to predict an individual's health. Consult a qualified health professional for personal advice.</span></div>
        <div className="impact-meter detail-meter"><div className="meter-caption"><span>Simulation visual intensity</span><span>{Math.round(exposure * 100)}%</span></div><div className="meter-track"><span style={{ width: `${Math.max(3, exposure * 100)}%` }} /></div><small>Input-driven illustration, not a clinical measurement</small></div>
      </section>
    </div>
  </div>;
}

function TimelinePage() {
  const icons = { pulse: HeartPulse, wind: Wind, activity: Activity, heart: Heart, brain: Brain, shield: ShieldCheck };
  return <div className="page-stack"><PageTitle eyebrow="RECOVERY & RESILIENCE" title="The benefits of quitting" description="The body begins recovering soon after the last cigarette. Progress varies; it's never too late to benefit." right={<span className="secure-tag"><Leaf size={15} /> Evidence-informed</span>} />
    <section className="panel timeline-panel"><div className="timeline-intro"><div className="timeline-hero-icon"><Leaf size={24} /></div><div><strong>A timeline of positive change</strong><p>Quitting has health benefits at any age, regardless of how long or how much someone smoked.</p></div></div>
      <div className="timeline">{quitMilestones.map((item, index) => { const Icon = icons[item.icon]; return <article className="timeline-item" key={item.time}><div className="timeline-marker"><Icon size={18} /></div><div className="timeline-card"><div className="timeline-time">{item.time}<span>{String(index + 1).padStart(2, "0")}</span></div><h3>{item.label}</h3><p>{item.body}</p></div></article>; })}</div>
      <div className="source-list"><strong>Sources</strong>{sources.slice(0, 2).map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label}<ChevronRight size={13} /></a>)}</div>
    </section><div className="detail-callout"><CircleHelp size={17} /><span>Timeframes are population-level estimates and can vary by individual. A clinician or smoking-cessation service can help find support.</span></div>
  </div>;
}

function StatisticsPage() {
  const first = prevalence[0];
  const last = prevalence[prevalence.length - 1];
  const change = last.prevalence - first.prevalence;
  return <div className="page-stack"><PageTitle eyebrow="POPULATION HEALTH · BRFSS" title="A changing national picture" description="Annual, unweighted state mean of adults reporting that they smoke every day." right={<span className="secure-tag"><ChartNoAxesCombined size={15} /> Supplied CSV dataset</span>} />
    <div className="stats-grid three"><div className="stat-card cyan"><div className="stat-icon"><ChartNoAxesCombined size={18} /></div><div><span>First available year</span><strong>{first.prevalence.toFixed(2)}%</strong><small>Unweighted state mean · {first.year}</small></div></div><div className="stat-card green"><div className="stat-icon"><ArrowDownRight size={18} /></div><div><span>Last available year</span><strong>{last.prevalence.toFixed(2)}%</strong><small>Unweighted state mean · {last.year}</small></div></div><div className="stat-card blue"><div className="stat-icon"><Activity size={18} /></div><div><span>Observed change</span><strong>{change.toFixed(2)} <small>points</small></strong><small>Across all observations · {first.year}–{last.year}</small></div></div></div>
    <section className="panel"><div className="panel-heading"><div><div className="eyebrow">HISTORICAL SERIES · ANNUAL</div><h2>Smoke everyday prevalence</h2><p>Percent · unweighted mean of state-level rates</p></div><span className="data-badge">4 AVAILABLE YEARS</span></div><div className="chart-area xl"><ResponsiveContainer width="100%" height="100%"><AreaChart data={prevalence} margin={{ top: 16, right: 18, left: 0, bottom: 4 }}><defs><linearGradient id="statsFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#38c9d7" stopOpacity={0.24} /><stop offset="100%" stopColor="#38c9d7" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid stroke="#243241" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="year" stroke="#71859a" tickLine={false} axisLine={false} /><YAxis stroke="#71859a" tickLine={false} axisLine={false} domain={[10, 20]} tickFormatter={(value) => `${value}%`} /><Tooltip contentStyle={{ background: "#111b28", border: "1px solid #263647", borderRadius: 9, color: "#edf5fb" }} formatter={(value) => [`${Number(value).toFixed(2)}%`, "Prevalence"]} /><Area type="monotone" dataKey="prevalence" stroke="#42d4dc" strokeWidth={2.5} fill="url(#statsFill)" activeDot={{ r: 5, fill: "#42d4dc" }} /></AreaChart></ResponsiveContainer></div><div className="footnote"><CircleHelp size={15} />The notebook's available annual mean output covers 2007–2010 (54 states). Import the CSV in AI Forecasting for the full historical series.</div></section>
    <div className="two-col stats-insights"><section className="panel"><div className="eyebrow">INTERPRETATION</div><h2>Recent observed change</h2><p>The available notebook output shows lower daily-smoking prevalence from 2007 to 2010. These four observations describe population patterns—they cannot explain the cause of the change or predict an individual's outcome.</p></section><section className="panel"><div className="eyebrow">LIMITATIONS</div><h2>Read with care</h2><p>The source dataset spans 1995–2010, but the four annual means currently available in the notebook's extracted results cover 2007–2010 and 54 states. Import the original CSV to explore the full series. State means are unweighted.</p></section></div>
  </div>;
}

function AboutPage() {
  return <div className="page-stack"><PageTitle eyebrow="PROJECT OVERVIEW" title="About SmokeSense AI" description="A research demonstrator connecting individual-level education with population-level forecasting." />
    <div className="about-hero panel"><div className="about-emblem"><Activity size={27} /></div><div><div className="eyebrow">HEALTH EDUCATION · VISUAL ANALYTICS</div><h2>See the story behind the statistics.</h2><p>SmokeSense AI combines an interactive 3D anatomy atlas with a smoking exposure simulator and the evaluation outputs from a BRFSS time-series research project.</p></div></div>
    <div className="two-col about-grid"><section className="panel"><div className="about-card-icon"><Orbit size={19} /></div><h3>Interactive anatomy</h3><p>Organs can be selected and inspected. Visual tone responds to the exposure inputs as an illustration only; it is not medical imaging or a measurement of damage.</p></section><section className="panel"><div className="about-card-icon"><ChartNoAxesCombined size={19} /></div><h3>Research integration</h3><p>The forecasting dashboard includes holdout metrics and predictions documented in the project notebook. No trained forecast artifacts were supplied, so no future predictions are invented.</p></section></div>
    <section className="panel"><div className="eyebrow">3D ANATOMY ATTRIBUTION</div><h2>Z-Anatomy · CC BY-SA 4.0</h2><p className="model-attribution">The interactive body and organ meshes are adapted from Z-Anatomy, which credits BodyParts3D (Database Center for Life Science, CC BY-SA 2.1 Japan). This detailed atlas is not a photogrammetry scan and its surface material is not photorealistic.</p><div className="source-links"><a href="https://github.com/Z-Anatomy/Unity-app_Z-Anatomy" target="_blank" rel="noreferrer">Z-Anatomy source<ChevronRight size={15} /></a><a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0 license<ChevronRight size={15} /></a></div></section>
    <section className="panel methodology"><div className="eyebrow">DATA & METHODS</div><h2>What this project includes</h2><div className="method-grid"><div><span>01</span><strong>Dataset</strong><p>CDC BRFSS four-level smoking data, 1995–2010; 56 state and territory units.</p></div><div><span>02</span><strong>Target</strong><p>"Smoke everyday" prevalence; annual state-level observations and unweighted yearly means.</p></div><div><span>03</span><strong>Evaluation</strong><p>AR, MA, ARMA, ARIMA, SARIMA, Holt–Winters, differenced VAR, Prophet, XGBoost, LSTM, and GRU approaches.</p></div><div><span>04</span><strong>Limitations</strong><p>Short history, varying evaluation cohorts, and no causal or clinical interpretation.</p></div></div></section>
    <section className="panel"><div className="eyebrow">HEALTH REFERENCES</div><h2>Learn more from trusted sources</h2><div className="source-links">{sources.map((source) => <a href={source.href} key={source.href} target="_blank" rel="noreferrer">{source.label}<ChevronRight size={15} /></a>)}</div></section>
    <div className="detail-callout"><CircleHelp size={17} /><span>This application is for education and research demonstration. It is not a diagnostic tool and does not provide medical advice.</span></div>
  </div>;
}
