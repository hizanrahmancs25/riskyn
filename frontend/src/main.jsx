import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { budgetSummary, inr } from './format.js';
import './styles.css';

const views = [
  { id: 'overview', icon: '◫', label: 'Overview' },
  { id: 'processes', icon: '▦', label: 'Business processes' },
  { id: 'investments', icon: '↗', label: 'Investment planner' },
  { id: 'integrations', icon: '⊞', label: 'Integrations' },
];

function Metric({ label, value, note, accent }) {
  return <article className={`metric ${accent ? 'accent' : ''}`}>
    <p className="eyebrow">{label}</p><p className="metric-value">{value}</p><p className="muted text-sm">{note}</p>
  </article>;
}

function ProcessTable({ rows, onSelect }) {
  return <div className="table-scroll"><table>
    <caption className="sr-only">Illustrative business process metrics; not computed assessments</caption>
    <thead><tr><th scope="col">Business process</th><th scope="col">Assets</th><th scope="col">Demo EAL</th><th scope="col">Demo process VaR₉₅</th><th scope="col"><span className="sr-only">Details</span></th></tr></thead>
    <tbody>{rows.map((row, index) => <tr key={row.id}>
      <th scope="row"><span className="row-name"><span className="process-icon" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span>{row.name}<small>{row.owner}</small></span></span></th>
      <td>{row.assets}</td><td>{inr(row.eal_inr, true)}</td><td className="muted">{inr(row.var95_inr, true)}</td>
      <td><button className="text-button" onClick={() => onSelect(row)} aria-label={`View ${row.name} details`}>View ↗</button></td>
    </tr>)}</tbody>
  </table>{rows.length === 0 && <p className="empty">No processes match your search.</p>}</div>;
}

function ProcessDialog({ process, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} aria-labelledby="detail-title" onClose={(event) => { if (!event.currentTarget.open) onClose(); }} className="detail-dialog">
    <div className="section-heading"><p className="eyebrow">Demo process detail</p><button autoFocus className="secondary" onClick={() => ref.current.close()}>Close ×</button></div>
    <h2 id="detail-title">{process.name}</h2><p className="muted mb-6">{process.owner}</p>
    <dl className="detail-list"><div><dt>Linked assets</dt><dd>{process.assets}</dd></div><div><dt>Illustrative EAL</dt><dd>{inr(process.eal_inr)}</dd></div><div><dt>Illustrative process VaR₉₅</dt><dd>{inr(process.var95_inr)}</dd></div></dl>
    <p className="callout mt-6">These are presentation fixtures. No calculation inputs, attack graphs, or assessed findings are available.</p>
  </dialog>;
}

function Overview({ data, onSelect, onNavigate }) {
  const ranked = [...data.processes].sort((a, b) => b.eal_inr - a.eal_inr);
  return <>
    <section className="metric-grid" aria-label="Illustrative summary">
      <Metric accent label="Expected annual loss · demo" value={inr(data.summary.eal_inr, true)} note="Sum of illustrative process EAL values" />
      <Metric label="Business processes" value={data.summary.process_count} note="Across the example organization" />
      <Metric label="Assets in fixture" value={data.summary.asset_count} note="Sample inventory, not a live scan" />
      <Metric label="Connected engines" value="0 / 6" note="Application shell · integrations pending" />
    </section>
    <section className="chart-grid">
      <article className="panel"><div className="section-heading"><div><p className="eyebrow">The bigger picture</p><h2>Illustrative loss trend</h2></div><span className="chip">6 months · fixture</span></div>
        <p className="muted text-sm mb-5">Example portfolio EAL in INR. Not historical observations.</p>
        <div className="chart" role="img" aria-label="Illustrative expected annual loss trend; exact values are in the data table below">
          <ResponsiveContainer width="100%" height="100%"><AreaChart data={data.trend} margin={{ top: 12, right: 12, bottom: 0, left: 8 }}>
            <defs><linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7be4c4" stopOpacity={0.25} /><stop offset="100%" stopColor="#7be4c4" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="#27333d" vertical={false} strokeDasharray="4 4" />
            <XAxis dataKey="date" tickFormatter={(value) => new Date(`${value}T00:00:00Z`).toLocaleDateString('en', { month: 'short', timeZone: 'UTC' })} axisLine={false} tickLine={false} tick={{ fill: '#a4b3c1', fontSize: 12 }} dy={10} />
            <YAxis tickFormatter={(value) => inr(value, true)} axisLine={false} tickLine={false} tick={{ fill: '#a4b3c1', fontSize: 11 }} width={86} />
            <Tooltip formatter={(value) => [inr(Number(value)), 'Demo EAL']} contentStyle={{ background: '#15212b', border: '1px solid #3a4c5b', borderRadius: 12, color: '#edf4f9' }} />
            <Area type="monotone" dataKey="eal_inr" stroke="#7be4c4" fill="url(#trend-fill)" strokeWidth={3} isAnimationActive={false} />
          </AreaChart></ResponsiveContainer>
        </div>
        <details className="mt-4"><summary>View chart data</summary><table><thead><tr><th scope="col">Date</th><th scope="col">Demo EAL</th></tr></thead><tbody>{data.trend.map((row) => <tr key={row.date}><th scope="row">{row.date}</th><td>{inr(row.eal_inr)}</td></tr>)}</tbody></table></details>
      </article>
      <article className="panel"><p className="eyebrow">Portfolio composition</p><h2>Top contributors</h2><p className="muted text-sm mt-2 mb-6">Share of total illustrative EAL</p>
        <div className="contributors">{ranked.map((row, index) => {
          const share = data.summary.eal_inr > 0 ? row.eal_inr / data.summary.eal_inr * 100 : 0;
          return <div key={row.id}><div className="contributor-label"><span>{row.name}</span><strong>{share.toFixed(0)}%</strong></div><div className="bar-track" aria-hidden="true"><div style={{ width: `${share}%`, background: ['#7be4c4', '#8baff3', '#b6a1ec', '#eac48a'][index % 4] }} /></div></div>;
        })}</div><button className="secondary w-full mt-8" onClick={() => onNavigate('processes')}>Explore business processes →</button>
      </article>
    </section>
    <section className="panel"><div className="section-heading"><div><p className="eyebrow">From business to numbers</p><h2>Process overview</h2></div><span className="muted text-sm">INR · illustrative values</span></div><ProcessTable rows={ranked} onSelect={onSelect} /></section>
  </>;
}

function Processes({ data, onSelect }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('eal');
  const rows = data.processes.filter((row) => `${row.name} ${row.owner}`.toLowerCase().includes(query.toLowerCase()));
  rows.sort(sort === 'name' ? (a, b) => a.name.localeCompare(b.name) : (a, b) => b.eal_inr - a.eal_inr);
  return <section className="panel"><div className="section-heading"><div><p className="eyebrow">Example inventory</p><h2>Business processes</h2></div><span className="chip">{rows.length} processes</span></div>
    <div className="filters"><label className="grow">Search processes<input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search by process or owner…" /></label><label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="eal">Demo EAL: high to low</option><option value="name">Name: A–Z</option></select></label></div>
    <ProcessTable rows={rows} onSelect={onSelect} />
  </section>;
}

function Investments({ data }) {
  const [budget, setBudget] = useState('1500000');
  const [selected, setSelected] = useState([]);
  const { valid, spent, remaining } = budgetSummary(data.investments, selected, budget);
  function toggle(id) { setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  return <div className="planner-grid"><section className="panel"><p className="eyebrow">Plan your allocation</p><h2>Investment sandbox</h2><p className="muted mt-2 mb-6">Manually select example line items to explore a budget. Selections reset when you leave this view.</p>
    <div className="investment-list">{data.investments.map((item) => <label className={`investment ${selected.includes(item.id) ? 'selected' : ''}`} key={item.id}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} /><span className="grow"><strong>{item.name}</strong><small>{item.category}</small></span><span>{inr(item.cost_inr, true)}</span></label>)}</div>
  </section><section className="panel"><p className="eyebrow">Budget workspace</p><h2>Your allocation</h2><label className="block mt-6" htmlFor="budget">Budget in INR<input id="budget" type="number" min="0" step="1" value={budget} onChange={(event) => setBudget(event.target.value)} aria-invalid={!valid} aria-describedby={!valid ? 'budget-error' : undefined} /></label>
    {!valid && <p id="budget-error" className="error-text mt-2">Enter a non-negative whole-rupee budget within the supported numeric range.</p>}
    <div className="allocation" aria-live="polite"><p><span>Selected items</span><strong>{selected.length}</strong></p><p><span>Example total</span><strong>{inr(spent)}</strong></p><p className={valid && remaining < 0 ? 'error-text' : 'mint'}><span>{valid && remaining < 0 ? 'Over budget' : 'Remaining'}</span><strong>{valid ? inr(Math.abs(remaining)) : '—'}</strong></p></div>
    <button className="secondary w-full" disabled={selected.length === 0} onClick={() => setSelected([])}>Clear selection</button><p className="callout mt-6">Cost calculator only. No optimization, risk reduction, ROI, or control recommendation is calculated.</p>
  </section></div>;
}

function Integrations({ data }) {
  return <section className="panel"><p className="eyebrow">Ready for the next layer</p><h2>Integration workspace</h2><p className="muted mt-2 mb-6">The interface is connected to the demo API. Domain engines and external services are not implemented.</p>
    <div className="integration-grid">{data.capabilities.map((item) => <article className="integration" key={item.name}><span className="process-icon" aria-hidden="true">⊞</span><h3>{item.name}</h3><span className="chip">{item.status}</span></article>)}</div>
    <div className="callout mt-6">Compliance clauses and AI answers are intentionally absent until verified mappings and a real provider are connected.</div>
    <a className="text-button inline-block mt-6" href="/docs" target="_blank" rel="noreferrer">Explore FastAPI documentation ↗</a>
  </section>;
}

function App() {
  const [view, setView] = useState('overview');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [process, setProcess] = useState(null);
  const controller = useRef(null);
  async function load() {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/dashboard', { signal: request.signal });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const snapshot = await response.json();
      if (snapshot.mode !== 'demo' || !Array.isArray(snapshot.processes) || !Array.isArray(snapshot.trend) || !Array.isArray(snapshot.investments) || !Array.isArray(snapshot.capabilities) || !snapshot.summary) throw new Error('Unexpected dashboard response');
      if (!request.signal.aborted) setData(snapshot);
    } catch (failure) {
      if (failure.name !== 'AbortError') setError('Unable to load the dashboard. Check that the FastAPI service is running, then retry.');
    } finally {
      if (!request.signal.aborted) setLoading(false);
    }
  }
  useEffect(() => { load(); return () => controller.current?.abort(); }, []);
  const active = views.find((item) => item.id === view);
  return <div className="app-shell"><a href="#main" className="skip-link">Skip to content</a>
    <aside className="sidebar"><a className="brand" href="#main" onClick={() => setView('overview')}><span className="brand-icon" aria-hidden="true">r</span>riskyn<span className="brand-dot">.</span></a>
      <div className="workspace"><span className="workspace-avatar" aria-hidden="true">AC</span><div><strong>Acme Financial</strong><small>Example workspace</small></div></div>
      <p className="eyebrow nav-label">Workspace</p><nav aria-label="Main navigation">{views.map((item) => <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`} aria-current={view === item.id ? 'page' : undefined} onClick={() => setView(item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}{view === item.id && <span className="active-dot" aria-hidden="true" />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="demo-card"><span className="mint text-xs">● DEMO ENVIRONMENT</span><p>Clarity starts with context.</p><small>Explore the interface with illustrative business data.</small></div><p className="muted text-xs mt-5">PS 26105 · Application shell</p></div>
    </aside>
    <div className="main-shell"><header className="topbar"><p><span className="muted">Workspace</span><span className="mx-3 muted">/</span>{active.label}</p><span className="chip">Demo data only</span></header>
      <main id="main" tabIndex="-1"><div className="page-heading"><div><p className="eyebrow mint">Business visibility, in perspective</p><h1>{view === 'overview' ? 'Your business. A clearer picture.' : active.label}</h1><p className="muted">{view === 'overview' ? 'An executive workspace for understanding the numbers that matter.' : 'Explore the application shell with clearly labeled example data.'}</p></div><button className="primary" disabled={loading} onClick={load}>{loading ? 'Loading…' : '↻ Reload demo data'}</button></div>
        <div className="demo-banner"><span aria-hidden="true">ⓘ</span><p><strong>Illustrative demo.</strong> {data?.notice || 'No live telemetry or calculated assessments. All monetary values are presentation fixtures.'}</p></div>
        {error && <div className="error-banner" role="alert"><p>{error}{data && ' Previously loaded demo data remains visible.'}</p><button className="secondary" onClick={load} disabled={loading}>Retry</button></div>}
        {loading && !data && <div className="panel empty" role="status">Loading your example workspace…</div>}
        {data && <div aria-busy={loading}>{view === 'overview' && <Overview data={data} onSelect={setProcess} onNavigate={setView} />}{view === 'processes' && <Processes data={data} onSelect={setProcess} />}{view === 'investments' && <Investments data={data} />}{view === 'integrations' && <Integrations data={data} />}</div>}
        <footer><span>Riskyn · Built for business perspective</span><span>{data ? `Fixture snapshot: ${new Date(data.snapshot_at).toLocaleDateString('en-IN', { timeZone: 'UTC' })}` : 'Demo application'}</span></footer>
      </main>
    </div>
    {process && <ProcessDialog process={process} onClose={() => setProcess(null)} />}
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
