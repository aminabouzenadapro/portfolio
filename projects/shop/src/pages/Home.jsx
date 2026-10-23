import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useProducts } from "../store/db.js";
import { CATEGORIES } from "../data/products.js";
import { useI18n } from "../i18n.jsx";
import { BUSINESS } from "../config/business.js";
import { originalPrice } from "../format.js";
import ProductCard from "../components/ProductCard.jsx";
import Rating from "../components/Rating.jsx";
import {
  BadgeCheckIcon, CashIcon, CATEGORY_ICONS, ClockIcon, InstagramIcon, PhoneIcon, PinIcon, ShieldIcon, TruckIcon,
} from "../components/Icons.jsx";

const SORTS = {
  featured: { label: "sortFeatured", fn: (a, b) => (b.bestseller === true) - (a.bestseller === true) },
  "price-asc": { label: "sortPriceAsc", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "sortPriceDesc", fn: (a, b) => b.price - a.price },
  rating: { label: "sortRating", fn: (a, b) => b.rating - a.rating },
};

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function Home() {
  const { t, tr, money } = useI18n();
  const { state } = useLocation();
  const all = useProducts();
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState("featured");
  const b = BUSINESS;

  // Arriving from another page via the header menu: scroll to the requested section
  useEffect(() => {
    if (!state?.section) return;
    const id = setTimeout(() => document.getElementById(state.section)?.scrollIntoView(), 60);
    return () => clearTimeout(id);
  }, [state]);

  const products = useMemo(() => all.filter((p) => p.active), [all]);
  const list = useMemo(
    () => products.filter((p) => !cat || p.category === cat).sort(SORTS[sort].fn),
    [products, cat, sort]
  );
  const counts = useMemo(() => {
    const c = {};
    products.forEach((p) => { c[p.category] = (c[p.category] || 0) + 1; });
    return c;
  }, [products]);
  const heroImages = products.filter((p) => p.bestseller).slice(0, 4);
  // Deal of the week: the in-stock product with the biggest discount
  const deal = [...products].filter((p) => p.discount > 0 && p.stock > 0).sort((a, b2) => b2.discount - a.discount)[0];

  const chooseCategory = (slug) => { setCat(slug); scrollTo("produits"); };

  return (
    <>
      {/* Hero */}
      <section className="container">
        <div className="hero">
          <div className="hero-text">
            <span className="eyebrow">{t("heroEyebrow", { year: b.since })}</span>
            <h1>{tr(b.heroTitle)}</h1>
            <p>{tr(b.tagline)}</p>
            <div className="hero-actions">
              <button className="btn btn-dark" onClick={() => scrollTo("produits")}>{t("seeProducts")}</button>
              <a className="btn btn-light" href={`tel:${b.phone.replace(/\s/g, "")}`}><PhoneIcon size={18} /> {t("call")}</a>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            {heroImages.map((p) => <img key={p.id} src={p.image} alt="" />)}
          </div>
        </div>

        <ul className="trust four">
          <li><ShieldIcon /><div><strong>{t("trustWarranty")}</strong><span>{t("trustWarrantyText")}</span></div></li>
          <li><BadgeCheckIcon /><div><strong>{t("trustOriginal")}</strong><span>{t("trustOriginalText")}</span></div></li>
          <li><TruckIcon /><div><strong>{t("trustDelivery")}</strong><span>{t("trustDeliveryText")}</span></div></li>
          <li><CashIcon /><div><strong>{t("trustCod")}</strong><span>{t("trustCodText")}</span></div></li>
        </ul>
      </section>

      {/* Categories */}
      <section className="container section">
        <h2>{t("shopByCategory")}</h2>
        <div className="cat-tiles">
          {CATEGORIES.map((c) => {
            const CatIcon = CATEGORY_ICONS[c.icon];
            return (
              <button key={c.slug} className="cat-tile" onClick={() => chooseCategory(c.slug)}>
                <span className="cat-icon"><CatIcon size={26} /></span>
                <strong>{tr(c.name)}</strong>
                <span className="muted small">{t("productsCount", { n: counts[c.slug] || 0 })}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Deal of the week */}
      {deal && (
        <section className="container section">
          <div className="deal">
            <div className="deal-text">
              <span className="deal-tag">{t("dealTitle")} · −{deal.discount}%</span>
              <h2>{tr(deal.title)}</h2>
              <p>{tr(deal.description)}</p>
              <div className="price price-lg">
                <span className="price-now">{money(deal.price)}</span>
                <span className="price-was">{money(originalPrice(deal.price, deal.discount))}</span>
              </div>
              <div className="deal-actions">
                <Link to={`/product/${deal.id}`} className="btn btn-light">{t("dealCta")}</Link>
                <span className="small">{t("dealEnds")}</span>
              </div>
            </div>
            <img src={deal.image} alt={tr(deal.title)} className="deal-img" />
          </div>
        </section>
      )}

      {/* Products */}
      <section id="produits" className="container section">
        <div className="section-head">
          <div>
            <h2>{t("ourProducts")}</h2>
            <p className="muted">{t("ourProductsText")}</p>
          </div>
          <label className="select">
            <span className="sr-only">{t("sortBy")}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{t(s.label)}</option>)}
            </select>
          </label>
        </div>
        <div className="pills" role="tablist">
          {[{ slug: "", name: null }, ...CATEGORIES].map((c) => (
            <button key={c.slug} role="tab" aria-selected={cat === c.slug} className={cat === c.slug ? "active" : ""} onClick={() => setCat(c.slug)}>
              {c.name ? tr(c.name) : t("all")}
            </button>
          ))}
        </div>
        <div className="product-grid">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* How to order */}
      <section className="container section">
        <h2 className="center">{t("howTitle")}</h2>
        <ol className="steps">
          {[1, 2, 3].map((n) => (
            <li key={n}>
              <span className="step-num">{n}</span>
              <h3>{t(`step${n}`)}</h3>
              <p className="muted">{t(`step${n}Text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Story */}
      <section id="histoire" className="story-wrap">
        <div className="container story">
          <img src={b.storyImage} alt="" className="story-img" />
          <div>
            <span className="eyebrow">{t("heroEyebrow", { year: b.since })}</span>
            <h2>{t("storyTitle")}</h2>
            {tr(b.story).map((p, i) => <p key={i}>{p}</p>)}
            <ul className="stats">
              {b.stats.map((s, i) => <li key={i}><strong>{s.value}</strong><span>{tr(s.label)}</span></li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="avis" className="container section">
        <h2 className="center">{t("reviewsTitle")}</h2>
        <ul className="testimonials">
          {b.testimonials.map((r, i) => (
            <li key={i}>
              <Rating value={r.rating} />
              <p>“{tr(r.text)}”</p>
              <div className="who">
                <span className="avatar">{r.name[0]}</span>
                <div><strong>{r.name}</strong><span className="muted small">{tr(r.city)}</span></div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section id="faq" className="container section narrow">
        <h2 className="center">{t("faqTitle")}</h2>
        <div className="faq">
          {b.faq.map((f, i) => (
            <details key={i} open={i === 0}>
              <summary>{tr(f.q)}</summary>
              <p>{tr(f.a)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="container section">
        <div className="contact">
          <div>
            <h2>{t("contactTitle")}</h2>
            <p className="muted">{t("contactText")}</p>
            <div className="contact-actions">
              <a className="btn btn-dark" href={`tel:${b.phone.replace(/\s/g, "")}`}><PhoneIcon size={18} /> {t("call")}</a>
              <a className="btn btn-light" href={b.mapsUrl} target="_blank" rel="noopener noreferrer"><PinIcon size={18} /> {t("seeMap")}</a>
            </div>
          </div>
          <ul className="contact-list">
            <li><PhoneIcon /><div><strong>{t("phone")}</strong><span dir="ltr">{b.phone}</span></div></li>
            <li><PinIcon /><div><strong>{t("address")}</strong><span>{tr(b.address)}</span></div></li>
            <li>
              <ClockIcon />
              <div>
                <strong>{t("hours")}</strong>
                {b.hours.map((h, i) => <span key={i}>{tr(h.days)} : {tr(h.time)}</span>)}
              </div>
            </li>
            <li>
              <InstagramIcon />
              <div><strong>Instagram · Facebook</strong>
                <span>
                  <a href={b.instagram.url} target="_blank" rel="noopener noreferrer" dir="ltr">{b.instagram.handle}</a>
                  {" · "}
                  <a href={b.facebook.url} target="_blank" rel="noopener noreferrer">{b.facebook.handle}</a>
                </span>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
