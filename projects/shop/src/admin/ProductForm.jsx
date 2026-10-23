import { useEffect, useState } from "react";
import { CATEGORIES } from "../data/products.js";
import { CloseIcon, UploadIcon } from "../components/Icons.jsx";

const EMPTY = {
  titleFr: "", titleAr: "", brand: "", category: "smartphones", price: "", discount: "0", stock: "",
  descFr: "", descAr: "", image: "", bestseller: false, active: true,
};

const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Shrinks an uploaded photo to max 800px and returns it as a JPEG data URL (kept small for localStorage)
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 800 / Math.max(img.width, img.height));
      const canvas = Object.assign(document.createElement("canvas"), { width: img.width * scale, height: img.height * scale });
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function ProductForm({ product, images, onClose, onSave }) {
  const [f, setF] = useState(() => product ? {
    titleFr: product.title.fr, titleAr: product.title.ar, brand: product.brand || "", category: product.category,
    price: String(product.price), discount: String(product.discount || 0), stock: String(product.stock),
    descFr: product.description.fr, descAr: product.description.ar, image: product.image,
    bestseller: !!product.bestseller, active: product.active,
  } : EMPTY);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setF((x) => ({ ...x, image: "" })); const data = await resizeImage(file); setF((x) => ({ ...x, image: data })); }
    catch { setErrors((er) => ({ ...er, image: "Image illisible. Essayez un fichier JPG ou PNG." })); }
  }

  function submit(e) {
    e.preventDefault();
    const er = {};
    if (f.titleFr.trim().length < 2) er.titleFr = "Entrez un nom de produit.";
    if (!(Number(f.price) > 0)) er.price = "Entrez un prix supérieur à 0.";
    if (!(Number(f.stock) >= 0) || f.stock === "") er.stock = "Entrez une quantité (0 ou plus).";
    if (!(Number(f.discount) >= 0 && Number(f.discount) < 90)) er.discount = "Remise entre 0 et 89 %.";
    if (!f.image) er.image = "Choisissez ou importez une photo.";
    setErrors(er);
    if (Object.keys(er).length) return;

    const base = product || { id: `${slugify(f.titleFr)}-${Date.now().toString(36).slice(-4)}`, rating: 0, reviews: 0, options: [], specs: [], warranty: 12, credit: null };
    onSave({
      ...base,
      title: { fr: f.titleFr.trim(), ar: f.titleAr.trim() || f.titleFr.trim() },
      description: { fr: f.descFr.trim(), ar: f.descAr.trim() || f.descFr.trim() },
      brand: f.brand.trim(),
      category: f.category,
      price: Math.round(Number(f.price)),
      discount: Math.round(Number(f.discount)),
      stock: Math.round(Number(f.stock)),
      // A photo picked from the gallery keeps its credit; an uploaded one has none
      image: f.image,
      credit: f.image === product?.image ? product.credit : null,
      bestseller: f.bestseller,
      active: f.active,
    });
  }

  const field = (k, label, props = {}) => (
    <label className={`adm-field${errors[k] ? " invalid" : ""}`}>
      <span>{label}</span>
      <input value={f[k]} onChange={set(k)} {...props} />
      {errors[k] && <em>{errors[k]}</em>}
    </label>
  );

  return (
    <div className="adm-overlay center" onClick={onClose}>
      <form className="adm-modal" role="dialog" aria-modal="true" aria-label={product ? "Modifier le produit" : "Nouveau produit"}
        onClick={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
        <header className="panel-head">
          <h2>{product ? "Modifier le produit" : "Nouveau produit"}</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Fermer"><CloseIcon /></button>
        </header>

        <div className="modal-body">
          <div className="form-grid">
            {field("titleFr", "Nom (français)", { autoFocus: true })}
            {field("titleAr", "Nom (arabe)", { dir: "rtl", placeholder: "Facultatif" })}
            {field("brand", "Marque", { placeholder: "Ex. Samsung" })}
            <label className="adm-field">
              <span>Catégorie</span>
              <select value={f.category} onChange={set("category")}>
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name.fr}</option>)}
              </select>
            </label>
            {field("price", "Prix (DA)", { type: "number", min: 0, inputMode: "numeric" })}
            {field("discount", "Remise (%)", { type: "number", min: 0, max: 89, inputMode: "numeric" })}
            {field("stock", "Stock", { type: "number", min: 0, inputMode: "numeric" })}
          </div>

          <label className="adm-field">
            <span>Description (français)</span>
            <textarea rows={3} value={f.descFr} onChange={set("descFr")} />
          </label>
          <label className="adm-field">
            <span>Description (arabe)</span>
            <textarea rows={3} dir="rtl" value={f.descAr} onChange={set("descAr")} placeholder="Facultatif" />
          </label>

          <div className={`adm-field${errors.image ? " invalid" : ""}`}>
            <span>Photo</span>
            <div className="image-picker">
              <div className="image-preview">{f.image ? <img src={f.image} alt="Aperçu" /> : <span className="adm-muted small">Aucune photo</span>}</div>
              <div className="image-choices">
                <select value={images.includes(f.image) ? f.image : ""} onChange={set("image")} aria-label="Choisir une photo existante">
                  <option value="">Choisir dans la galerie…</option>
                  {images.map((src) => <option key={src} value={src}>{src.replace("products/", "")}</option>)}
                </select>
                <label className="adm-btn small">
                  <UploadIcon size={15} /> Importer une photo
                  <input type="file" accept="image/*" onChange={upload} hidden />
                </label>
              </div>
            </div>
            {errors.image && <em>{errors.image}</em>}
          </div>

          <div className="checks">
            <label><input type="checkbox" checked={f.bestseller} onChange={set("bestseller")} /> Best-seller (mis en avant)</label>
            <label><input type="checkbox" checked={f.active} onChange={set("active")} /> Visible dans la boutique</label>
          </div>
          {product?.options?.length > 0 && (
            <p className="adm-muted small">Les options ({product.options.map((o) => o.key).join(", ")}) et la fiche technique sont conservées.</p>
          )}
        </div>

        <footer className="modal-foot">
          <button type="button" className="adm-btn" onClick={onClose}>Annuler</button>
          <button type="submit" className="adm-btn primary">{product ? "Enregistrer" : "Ajouter le produit"}</button>
        </footer>
      </form>
    </div>
  );
}
