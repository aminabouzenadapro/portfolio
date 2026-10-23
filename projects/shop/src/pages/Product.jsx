import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../store/db.js";
import { CATEGORIES, defaultChoice, priceWithOptions } from "../data/products.js";
import { useCart } from "../context/CartContext.jsx";
import { useI18n } from "../i18n.jsx";
import { originalPrice } from "../format.js";
import Rating from "../components/Rating.jsx";
import QtyStepper from "../components/QtyStepper.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { EmptyState } from "../components/States.jsx";
import { CashIcon, ChevronIcon, ReturnIcon, ShieldIcon, TruckIcon } from "../components/Icons.jsx";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { t, tr, money, shopName } = useI18n();
  const products = useProducts();
  const p = products.find((x) => x.id === id && x.active);
  const [qty, setQty] = useState(1);
  const [choice, setChoice] = useState({});

  useEffect(() => { setQty(1); setChoice(p ? defaultChoice(p) : {}); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (p) document.title = `${tr(p.title)} — ${shopName}`; }, [p, tr, shopName]);

  const related = useMemo(
    () => (p ? products.filter((x) => x.active && x.category === p.category && x.id !== p.id).slice(0, 4) : []),
    [p, products]
  );

  if (!p) {
    return (
      <div className="container">
        <EmptyState title={t("productNotFound")} text={t("productNotFoundText")} action={<Link className="btn btn-dark" to="/">{t("backToShop")}</Link>} />
      </div>
    );
  }

  const unit = priceWithOptions(p, choice);
  const was = originalPrice(unit, p.discount);
  const soldOut = p.stock === 0;
  const maxQty = Math.min(p.stock || 1, 10);
  const title = tr(p.title);
  const catName = tr(CATEGORIES.find((c) => c.slug === p.category)?.name);

  return (
    <div className="container product-page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">{t("shop")}</Link><ChevronIcon size={14} />
        <span>{catName}</span><ChevronIcon size={14} />
        <span aria-current="page">{title}</span>
      </nav>

      <div className="pdp">
        <div className="gallery">
          <div className="gallery-main">
            <img src={p.image} alt={title} />
            {was ? <span className="badge badge-sale">−{p.discount}%</span> : p.bestseller && <span className="badge badge-best">{t("bestseller")}</span>}
          </div>
          {p.credit && (
            <p className="credit">
              {t("photoCredit", { author: p.credit.author, license: p.credit.license })}{" "}
              <a href={p.credit.source} target="_blank" rel="noopener noreferrer">{t("source")}</a>
            </p>
          )}
        </div>

        <div className="pdp-info">
          {p.brand && <span className="pc-region">{p.brand}</span>}
          <h1>{title}</h1>
          <Rating value={p.rating} count={p.reviews} size={16} />

          <div className="price price-lg">
            <span className="price-now">{money(unit)}</span>
            {was && <span className="price-was">{money(was)}</span>}
            {was && <span className="save">{t("save", { amount: money(was - unit) })}</span>}
          </div>

          <p className="pdp-desc">{tr(p.description)}</p>

          {/* Options: color swatches or labelled buttons */}
          {(p.options || []).map((o) => {
            const selected = o.values.find((v) => v.id === choice[o.key]);
            return (
              <fieldset key={o.key} className="option-group">
                <legend>{t(`opt_${o.key}`)} : <strong>{selected ? tr(selected.label) : ""}</strong></legend>
                <div className="option-values">
                  {o.values.map((v) => {
                    const active = choice[o.key] === v.id;
                    const delta = v.delta ? ` (${v.delta > 0 ? "+" : "−"}${money(Math.abs(v.delta))})` : "";
                    return v.swatch ? (
                      <button
                        key={v.id} type="button"
                        className={`swatch${active ? " active" : ""}`}
                        style={{ "--swatch": v.swatch }}
                        onClick={() => setChoice((c) => ({ ...c, [o.key]: v.id }))}
                        aria-pressed={active}
                        aria-label={tr(v.label) + delta}
                        title={tr(v.label) + delta}
                      />
                    ) : (
                      <button
                        key={v.id} type="button"
                        className={`chip-option${active ? " active" : ""}`}
                        onClick={() => setChoice((c) => ({ ...c, [o.key]: v.id }))}
                        aria-pressed={active}
                      >
                        {tr(v.label)}{delta && <span className="muted small">{delta}</span>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          <p className={`stock ${soldOut ? "out" : p.stock <= 5 ? "low" : "in"}`}>
            <span className="stock-dot" />
            {soldOut ? t("outOfStock") : p.stock <= 5 ? t("lowStock", { n: p.stock }) : t("inStock")}
          </p>

          <div className="buy-row">
            <QtyStepper value={qty} max={maxQty} onChange={(q) => setQty(Math.max(1, Math.min(q, maxQty)))} />
            <button className="btn btn-dark grow" disabled={soldOut} onClick={() => add(p, qty, choice)}>{t("addToCart")}</button>
          </div>
          <button
            className="btn btn-light btn-block"
            disabled={soldOut}
            onClick={() => { add(p, qty, choice, { openDrawer: false }); navigate("/checkout"); }}
          >
            {t("buyNow")}
          </button>

          <ul className="perks">
            <li><ShieldIcon /><div><strong>{t("perkWarranty", { n: p.warranty || 12 })}</strong><span>{t("perkWarrantyText")}</span></div></li>
            <li><TruckIcon /><div><strong>{t("perkDelivery")}</strong><span>{t("perkDeliveryText")}</span></div></li>
            <li><CashIcon /><div><strong>{t("perkCod")}</strong><span>{t("perkCodText")}</span></div></li>
            <li><ReturnIcon /><div><strong>{t("perkReturn")}</strong><span>{t("perkReturnText")}</span></div></li>
          </ul>
        </div>
      </div>

      {p.specs?.length > 0 && (
        <section className="specs-section">
          <h2>{t("specsTitle")}</h2>
          <dl className="spec-table">
            {p.brand && <div><dt>{t("brand")}</dt><dd>{p.brand}</dd></div>}
            {p.specs.map((s, i) => <div key={i}><dt>{t(`spec_${s.key}`)}</dt><dd>{tr(s.value)}</dd></div>)}
            <div><dt>{t("warranty")}</dt><dd>{t("warrantyMonths", { n: p.warranty || 12 })}</dd></div>
          </dl>
        </section>
      )}

      {related.length > 0 && (
        <section className="related">
          <div className="section-row">
            <h2>{t("youMayLike")}</h2>
          </div>
          <div className="product-grid four">
            {related.map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
