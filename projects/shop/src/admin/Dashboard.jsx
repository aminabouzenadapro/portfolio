import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useOrders, useProducts } from "../store/db.js";
import { DAY, STATUS, compactDzd, dzd, fmtDate, fmtDateTime, isSale, startOfDay, wilayaName } from "./util.js";
import { AlertIcon } from "../components/Icons.jsx";

const PERIODS = [[7, "7 derniers jours"], [30, "30 derniers jours"], [60, "60 derniers jours"]];

export default function Dashboard() {
  const orders = useOrders();
  const products = useProducts();
  const [days, setDays] = useState(30);

  const stats = useMemo(() => {
    const today = startOfDay(Date.now()).getTime();
    const from = today - (days - 1) * DAY;
    const prevFrom = from - days * DAY;
    const inRange = orders.filter((o) => new Date(o.date) >= from);
    const prev = orders.filter((o) => { const d = new Date(o.date); return d >= prevFrom && d < from; });
    const sum = (list) => list.filter(isSale).reduce((s, o) => s + o.total, 0);

    const revenue = sum(inRange);
    const prevRevenue = sum(prev);
    const sales = inRange.filter(isSale).length;
    const prevSales = prev.filter(isSale).length;

    // Revenue per day for the chart
    const series = Array.from({ length: days }, (_, i) => ({ date: new Date(from + i * DAY), value: 0, orders: 0 }));
    inRange.filter(isSale).forEach((o) => {
      const i = Math.floor((startOfDay(o.date).getTime() - from) / DAY);
      if (series[i]) { series[i].value += o.total; series[i].orders += 1; }
    });

    const byStatus = Object.keys(STATUS).map((s) => ({ status: s, count: inRange.filter((o) => o.status === s).length }));

    const productTotals = {};
    inRange.filter(isSale).forEach((o) => o.items.forEach((i) => {
      const t = (productTotals[i.id] ||= { id: i.id, title: i.title.fr, qty: 0, revenue: 0 });
      t.qty += i.qty; t.revenue += i.price * i.qty;
    }));
    const topProducts = Object.values(productTotals).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const wilayaTotals = {};
    inRange.forEach((o) => { wilayaTotals[o.customer.wilaya] = (wilayaTotals[o.customer.wilaya] || 0) + 1; });
    const topWilayas = Object.entries(wilayaTotals).map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      revenue, prevRevenue, sales, prevSales,
      avg: sales ? revenue / sales : 0,
      prevAvg: prevSales ? prevRevenue / prevSales : 0,
      toProcess: orders.filter((o) => o.status === "new" || o.status === "confirmed").length,
      series, byStatus, topProducts, topWilayas, total: inRange.length,
    };
  }, [orders, days]);

  const lowStock = products.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock);

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Tableau de bord</h1>
          <p className="adm-muted">Vue d'ensemble des ventes de la boutique.</p>
        </div>
        <div className="adm-seg" role="tablist" aria-label="Période">
          {PERIODS.map(([d, label]) => (
            <button key={d} role="tab" aria-selected={days === d} className={days === d ? "active" : ""} onClick={() => setDays(d)}>{label}</button>
          ))}
        </div>
      </header>

      <section className="kpis">
        <Kpi label="Chiffre d'affaires" value={dzd(stats.revenue)} now={stats.revenue} before={stats.prevRevenue} />
        <Kpi label="Ventes" value={stats.sales} now={stats.sales} before={stats.prevSales} />
        <Kpi label="Panier moyen" value={dzd(stats.avg)} now={stats.avg} before={stats.prevAvg} />
        <div className="adm-card kpi">
          <span className="kpi-label">Commandes à traiter</span>
          <strong className="kpi-value">{stats.toProcess}</strong>
          <Link to="/admin/commandes" className="adm-link small">Voir les commandes →</Link>
        </div>
      </section>

      <section className="adm-card">
        <div className="card-head">
          <h2>Chiffre d'affaires par jour</h2>
          <span className="adm-muted small">Hors commandes annulées et retournées</span>
        </div>
        <RevenueChart series={stats.series} />
      </section>

      <section className="adm-grid-3">
        <div className="adm-card">
          <h2>Commandes par statut</h2>
          <BarList
            rows={stats.byStatus.map((s) => ({ key: s.status, label: <span className={`badge ${STATUS[s.status].cls}`}>{STATUS[s.status].label}</span>, value: s.count, display: s.count }))}
          />
          <p className="adm-muted small">{stats.total} commandes sur la période</p>
        </div>
        <div className="adm-card">
          <h2>Meilleures ventes</h2>
          {stats.topProducts.length ? (
            <BarList rows={stats.topProducts.map((p) => ({ key: p.id, label: p.title, sub: `${p.qty} vendus`, value: p.revenue, display: compactDzd(p.revenue) }))} />
          ) : <p className="adm-muted">Aucune vente sur la période.</p>}
        </div>
        <div className="adm-card">
          <h2>Wilayas les plus actives</h2>
          {stats.topWilayas.length ? (
            <BarList rows={stats.topWilayas.map((w) => ({ key: w.code, label: wilayaName(w.code), value: w.count, display: `${w.count} cmd` }))} />
          ) : <p className="adm-muted">Aucune commande sur la période.</p>}
        </div>
      </section>

      <section className="adm-grid-2">
        <div className="adm-card">
          <div className="card-head">
            <h2>Dernières commandes</h2>
            <Link to="/admin/commandes" className="adm-link small">Tout voir →</Link>
          </div>
          <div className="table-wrap">
            <table className="adm-table">
              <thead><tr><th>N°</th><th>Client</th><th>Date</th><th className="num">Total</th><th>Statut</th></tr></thead>
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id}>
                    <td className="mono">{o.id}</td>
                    <td>{o.customer.fullName}</td>
                    <td className="adm-muted">{fmtDateTime(o.date)}</td>
                    <td className="num">{dzd(o.total)}</td>
                    <td><span className={`badge ${STATUS[o.status].cls}`}>{STATUS[o.status].label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="adm-card">
          <div className="card-head">
            <h2>Alertes de stock</h2>
            <Link to="/admin/produits" className="adm-link small">Gérer →</Link>
          </div>
          {lowStock.length === 0 ? <p className="adm-muted">Tous les produits sont bien approvisionnés.</p> : (
            <ul className="stock-alerts">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <img src={p.image} alt="" />
                  <span>{p.title.fr}</span>
                  <span className={`badge ${p.stock === 0 ? "s-returned" : "s-confirmed"}`}>
                    <AlertIcon size={13} /> {p.stock === 0 ? "Épuisé" : `${p.stock} en stock`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function Kpi({ label, value, now, before }) {
  const change = before ? ((now - before) / before) * 100 : null;
  const up = change !== null && change >= 0;
  return (
    <div className="adm-card kpi">
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
      {change !== null ? (
        <span className={`kpi-delta ${up ? "up" : "down"}`}>
          {up ? "▲" : "▼"} {Math.abs(change).toFixed(0)} % <span className="adm-muted">vs période précédente</span>
        </span>
      ) : <span className="adm-muted small">Pas de données pour comparer</span>}
    </div>
  );
}

// Horizontal bars: label on the left, value on the right, bar scaled to the max
function BarList({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="barlist">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="barlist-top">
            <span className="barlist-label">{r.label}{r.sub && <small className="adm-muted"> · {r.sub}</small>}</span>
            <span className="barlist-value">{r.display}</span>
          </div>
          <div className="barlist-track"><span style={{ width: `${(r.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

// Daily revenue bar chart (SVG) with a hover tooltip
function RevenueChart({ series }) {
  const [hover, setHover] = useState(null);
  const W = 900, H = 260, pad = { top: 12, right: 8, bottom: 26, left: 56 };
  const innerW = W - pad.left - pad.right, innerH = H - pad.top - pad.bottom;
  const max = Math.max(1, ...series.map((d) => d.value));
  // Round the axis top to a "nice" number
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * top);
  const slot = innerW / series.length;
  const barW = Math.max(3, Math.min(28, slot - 4));
  const labelEvery = Math.ceil(series.length / 8);
  const y = (v) => pad.top + innerH - (v / top) * innerH;
  const h = hover !== null ? series[hover] : null;

  return (
    <div className="chart" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Chiffre d'affaires par jour">
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={pad.left} x2={W - pad.right} y1={y(tk)} y2={y(tk)} className="grid" />
            <text x={pad.left - 8} y={y(tk) + 4} textAnchor="end" className="tick">{compactDzd(tk)}</text>
          </g>
        ))}
        {series.map((d, i) => {
          const x = pad.left + i * slot + (slot - barW) / 2;
          const bh = Math.max(0, pad.top + innerH - y(d.value));
          return (
            <g key={i}>
              {/* invisible full-height hit area, larger than the bar */}
              <rect x={pad.left + i * slot} y={pad.top} width={slot} height={innerH} fill="transparent"
                onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0}
                aria-label={`${fmtDate(d.date)} : ${dzd(d.value)}, ${d.orders} ventes`} />
              {d.value > 0 && (
                <path className={`bar${hover === i ? " active" : ""}`}
                  d={roundedTop(x, y(d.value), barW, bh, Math.min(4, barW / 2, bh))} />
              )}
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={H - 6} textAnchor="middle" className="tick">{fmtDate(d.date, { day: "2-digit", month: "short" })}</text>
              )}
            </g>
          );
        })}
        <line x1={pad.left} x2={W - pad.right} y1={pad.top + innerH} y2={pad.top + innerH} className="axis" />
      </svg>
      {h && (
        <div className="chart-tip" style={{ left: `${((pad.left + (hover + 0.5) * slot) / W) * 100}%` }}>
          <strong>{fmtDate(h.date, { weekday: "short", day: "numeric", month: "long" })}</strong>
          <span>{dzd(h.value)}</span>
          <span className="adm-muted">{h.orders} vente{h.orders > 1 ? "s" : ""}</span>
        </div>
      )}
    </div>
  );
}

// Bar path with rounded top corners, flat on the baseline
function roundedTop(x, y, w, h, r) {
  if (h <= 0) return "";
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}
