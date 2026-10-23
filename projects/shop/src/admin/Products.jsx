import { useMemo, useState } from "react";
import { db, useProducts } from "../store/db.js";
import { CATEGORIES } from "../data/products.js";
import { dzd } from "./util.js";
import ProductForm from "./ProductForm.jsx";
import { EditIcon, PlusIcon, SearchIcon, TrashIcon } from "../components/Icons.jsx";

export default function Products() {
  const products = useProducts();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [editing, setEditing] = useState(null); // product being edited, or "new"

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) =>
      (!cat || p.category === cat) &&
      (!term || `${p.title.fr} ${p.title.ar} ${p.brand}`.toLowerCase().includes(term))
    );
  }, [products, q, cat]);

  const catName = (slug) => CATEGORIES.find((c) => c.slug === slug)?.name.fr || slug;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  function remove(p) {
    if (window.confirm(`Supprimer « ${p.title.fr} » ? Cette action est définitive.`)) db.deleteProduct(p.id);
  }

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Produits</h1>
          <p className="adm-muted">{products.length} produits · {products.filter((p) => p.active).length} en ligne · {outOfStock} épuisé{outOfStock > 1 ? "s" : ""}</p>
        </div>
        <button className="adm-btn primary" onClick={() => setEditing("new")}><PlusIcon size={16} /> Nouveau produit</button>
      </header>

      <div className="adm-card">
        <div className="toolbar-row">
          <label className="adm-search">
            <SearchIcon size={16} />
            <input type="search" placeholder="Nom, marque…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher un produit" />
          </label>
          <select className="adm-select" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filtrer par catégorie">
            <option value="">Toutes les catégories</option>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name.fr}</option>)}
          </select>
        </div>

        <div className="table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Produit</th><th>Catégorie</th><th className="num">Prix</th><th className="num">Stock</th><th>En ligne</th><th className="actions-col"><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className={p.active ? "" : "inactive"}>
                  <td>
                    <div className="prod-cell">
                      <img src={p.image} alt="" />
                      <div>
                        <strong>{p.title.fr}</strong>
                        <span className="adm-muted small">{[p.brand, p.discount ? `−${p.discount} %` : "", p.bestseller ? "Best-seller" : ""].filter(Boolean).join(" · ")}</span>
                      </div>
                    </div>
                  </td>
                  <td>{catName(p.category)}</td>
                  <td className="num">{dzd(p.price)}</td>
                  <td className="num">
                    <span className={`stock-pill ${p.stock === 0 ? "out" : p.stock <= 5 ? "low" : "ok"}`}>
                      {p.stock === 0 ? "Épuisé" : p.stock}
                    </span>
                  </td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" checked={p.active} onChange={() => db.saveProduct({ ...p, active: !p.active })} aria-label={`Afficher ${p.title.fr} dans la boutique`} />
                      <span />
                    </label>
                  </td>
                  <td className="actions-col">
                    <button className="adm-icon-btn" onClick={() => setEditing(p)} aria-label={`Modifier ${p.title.fr}`} title="Modifier"><EditIcon size={16} /></button>
                    <button className="adm-icon-btn danger" onClick={() => remove(p)} aria-label={`Supprimer ${p.title.fr}`} title="Supprimer"><TrashIcon size={16} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="empty-row">Aucun produit ne correspond.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <ProductForm
          product={editing === "new" ? null : editing}
          images={[...new Set(products.map((p) => p.image).filter((src) => src.startsWith("products/")))]}
          onClose={() => setEditing(null)}
          onSave={(p) => { db.saveProduct(p); setEditing(null); }}
        />
      )}
    </>
  );
}
