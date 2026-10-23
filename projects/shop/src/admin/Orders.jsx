import { useEffect, useMemo, useState } from "react";
import { db, useOrders } from "../store/db.js";
import { ORDER_STATUSES } from "../format.js";
import { STATUS, downloadCsv, dzd, fmtDateTime, wilayaName } from "./util.js";
import { CloseIcon, DownloadIcon, SearchIcon } from "../components/Icons.jsx";

const PAGE = 15;
// Next step suggested for each status
const NEXT = { new: "confirmed", confirmed: "shipped", shipped: "delivered" };
const NEXT_LABEL = { new: "Confirmer", confirmed: "Marquer expédiée", shipped: "Marquer livrée" };

export default function Orders() {
  const orders = useOrders();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);

  const counts = useMemo(() => {
    const c = {};
    orders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders.filter((o) =>
      (!status || o.status === status) &&
      (!term || [o.id, o.customer.fullName, o.customer.phone, wilayaName(o.customer.wilaya)].join(" ").toLowerCase().includes(term))
    );
  }, [orders, q, status]);

  useEffect(() => setPage(1), [q, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const rows = filtered.slice((page - 1) * PAGE, page * PAGE);
  const open = orders.find((o) => o.id === openId);

  function exportCsv() {
    downloadCsv(`commandes-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["N°", "Date", "Client", "Téléphone", "Wilaya", "Commune", "Livraison", "Articles", "Total (DA)", "Statut"],
      ...filtered.map((o) => [
        o.id, fmtDateTime(o.date), o.customer.fullName, o.customer.phone, wilayaName(o.customer.wilaya), o.customer.commune,
        o.method === "home" ? "Domicile" : "Stop desk", o.items.map((i) => `${i.qty}× ${i.title.fr}`).join(", "), o.total, STATUS[o.status].label,
      ]),
    ]);
  }

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Commandes</h1>
          <p className="adm-muted">{orders.length} commandes au total.</p>
        </div>
        <button className="adm-btn" onClick={exportCsv}><DownloadIcon size={16} /> Exporter en CSV</button>
      </header>

      <div className="adm-card">
        <div className="toolbar-row">
          <label className="adm-search">
            <SearchIcon size={16} />
            <input type="search" placeholder="N° de commande, client, téléphone, wilaya…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher une commande" />
          </label>
          <div className="adm-tabs" role="tablist" aria-label="Filtrer par statut">
            <button role="tab" aria-selected={!status} className={!status ? "active" : ""} onClick={() => setStatus("")}>Toutes <span>{orders.length}</span></button>
            {ORDER_STATUSES.map((s) => (
              <button key={s} role="tab" aria-selected={status === s} className={status === s ? "active" : ""} onClick={() => setStatus(s)}>
                {STATUS[s].label} <span>{counts[s] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table className="adm-table clickable">
            <thead>
              <tr><th>N°</th><th>Date</th><th>Client</th><th>Wilaya</th><th className="num">Articles</th><th className="num">Total</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} onClick={() => setOpenId(o.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setOpenId(o.id)}>
                  <td className="mono">{o.id}</td>
                  <td className="adm-muted">{fmtDateTime(o.date)}</td>
                  <td><strong>{o.customer.fullName}</strong><br /><span className="adm-muted small">{o.customer.phone}</span></td>
                  <td>{wilayaName(o.customer.wilaya)}</td>
                  <td className="num">{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                  <td className="num">{dzd(o.total)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select className={`status-select ${STATUS[o.status].cls}`} value={o.status} onChange={(e) => db.setOrderStatus(o.id, e.target.value)} aria-label={`Statut de ${o.id}`}>
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="empty-row">Aucune commande ne correspond.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="pager">
          <span className="adm-muted small">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>
          <div>
            <button className="adm-btn small" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Précédent</button>
            <span className="small">Page {page} / {pages}</span>
            <button className="adm-btn small" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>Suivant</button>
          </div>
        </div>
      </div>

      {open && <OrderPanel order={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function OrderPanel({ order: o, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="adm-overlay" onClick={onClose}>
      <aside className="adm-panel" role="dialog" aria-modal="true" aria-label={`Commande ${o.id}`} onClick={(e) => e.stopPropagation()}>
        <header className="panel-head">
          <div>
            <h2>Commande {o.id}</h2>
            <span className="adm-muted small">{fmtDateTime(o.date)}</span>
          </div>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Fermer"><CloseIcon /></button>
        </header>

        <div className="panel-body">
          <div className="panel-status">
            <span className={`badge ${STATUS[o.status].cls}`}>{STATUS[o.status].label}</span>
            <div className="panel-actions">
              {NEXT[o.status] && <button className="adm-btn primary small" onClick={() => db.setOrderStatus(o.id, NEXT[o.status])}>{NEXT_LABEL[o.status]}</button>}
              {["new", "confirmed"].includes(o.status) && <button className="adm-btn small danger" onClick={() => db.setOrderStatus(o.id, "cancelled")}>Annuler</button>}
            </div>
          </div>

          <h3>Client</h3>
          <dl className="panel-dl">
            <div><dt>Nom</dt><dd>{o.customer.fullName}</dd></div>
            <div><dt>Téléphone</dt><dd><a href={`tel:${o.customer.phone}`}>{o.customer.phone}</a></dd></div>
            {o.customer.email && <div><dt>E-mail</dt><dd>{o.customer.email}</dd></div>}
            <div><dt>Wilaya</dt><dd>{wilayaName(o.customer.wilaya)}</dd></div>
            <div><dt>Commune</dt><dd>{o.customer.commune}</dd></div>
            <div><dt>Livraison</dt><dd>{o.method === "home" ? `À domicile — ${o.customer.address}` : "Stop desk (bureau de livraison)"}</dd></div>
            <div><dt>Paiement</dt><dd>À la livraison (espèces)</dd></div>
          </dl>

          <h3>Articles</h3>
          <ul className="panel-items">
            {o.items.map((i) => (
              <li key={i.key}>
                <img src={i.image} alt="" />
                <div>
                  <strong>{i.title.fr}</strong>
                  {i.options?.length > 0 && <span className="adm-muted small">{i.options.map((x) => x.fr).join(" · ")}</span>}
                  <span className="adm-muted small">{i.qty} × {dzd(i.price)}</span>
                </div>
                <span className="num">{dzd(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="panel-totals">
            <div><dt>Sous-total</dt><dd>{dzd(o.subtotal)}</dd></div>
            <div><dt>Livraison</dt><dd>{o.shipping ? dzd(o.shipping) : "Gratuite"}</dd></div>
            <div className="total"><dt>Total</dt><dd>{dzd(o.total)}</dd></div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
