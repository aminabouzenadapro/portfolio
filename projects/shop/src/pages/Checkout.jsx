import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useI18n } from "../i18n.jsx";
import { deliveryDays, shippingCost } from "../format.js";
import { WILAYAS, wilayaByCode } from "../data/wilayas.js";
import { EmptyState } from "../components/States.jsx";
import { db } from "../store/db.js";
import { ArrowLeftIcon, CardIcon, CashIcon, LockIcon } from "../components/Icons.jsx";

const EMPTY = { fullName: "", phone: "", email: "", wilaya: "", commune: "", address: "" };

// Algerian mobile (05/06/07) or landline (02x/03x/04x) numbers, with optional +213 prefix
const PHONE_RE = /^(?:\+213|00213|0)(?:[567]\d{8}|[234]\d{7})$/;
const cleanPhone = (v) => v.replace(/[\s.-]/g, "");

// Returns the i18n key of the error for a field, or "" if valid
function validate(name, value, method) {
  const v = value.trim();
  switch (name) {
    case "fullName": return v.length >= 3 ? "" : "errName";
    case "phone": return !v ? "errPhoneEmpty" : PHONE_RE.test(cleanPhone(v)) ? "" : "errPhone";
    case "email": return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "errEmail";
    case "wilaya": return v ? "" : "errWilaya";
    case "commune": return v ? "" : "errCommune";
    case "address": return method === "desk" || v.length >= 5 ? "" : "errAddress"; // not needed for stop desk
    default: return "";
  }
}

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { t, tr, money, lang, shopName } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [method, setMethod] = useState("home");
  const [placing, setPlacing] = useState(false);

  useEffect(() => { document.title = `${t("checkoutTitle")} — ${shopName}`; }, [t, shopName]);

  if (items.length === 0 && !placing) {
    return (
      <div className="container">
        <EmptyState
          title={t("cartEmptyTitle")}
          text={t("cartEmptyText")}
          action={<Link to="/" className="btn btn-dark">{t("browse")}</Link>}
        />
      </div>
    );
  }

  const wilaya = wilayaByCode(form.wilaya);
  const shipping = shippingCost(wilaya, method, subtotal);
  const total = subtotal + (shipping || 0);
  const errors = Object.fromEntries(Object.keys(EMPTY).map((k) => [k, validate(k, form[k], method)]));
  const showError = (k) => touched[k] && errors[k];
  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  const blur = (name) => () => setTouched((tch) => ({ ...tch, [name]: true }));

  const field = (name, label, props = {}) => (
    <div className={`field${showError(name) ? " invalid" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name} name={name} value={form[name]}
        onChange={set(name)} onBlur={blur(name)}
        aria-invalid={!!showError(name)}
        aria-describedby={showError(name) ? `${name}-err` : undefined}
        {...props}
      />
      {showError(name) && <span className="field-error" id={`${name}-err`}>{t(errors[name])}</span>}
    </div>
  );

  async function placeOrder(e) {
    e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])));
    const firstInvalid = Object.keys(EMPTY).find((k) => errors[k]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 900)); // simulate a network request
    // Sequential order number following the last one in the store
    const lastNumber = Math.max(1000, ...db.get().orders.map((o) => Number(o.id.split("-")[1]) || 0));
    const order = {
      id: `CMD-${lastNumber + 1}`,
      date: new Date().toISOString(),
      items: items.map(({ stock, ...line }) => line), // eslint-disable-line no-unused-vars
      subtotal, shipping, total, method,
      status: "new",
      customer: { ...form, phone: cleanPhone(form.phone), wilaya: wilaya.code },
    };
    db.addOrder(order); // saved for the admin dashboard; also updates stock
    clear();
    navigate(`/order/${order.id}`, { replace: true, state: { order } });
  }

  const optionPrice = (m) => {
    const cost = shippingCost(wilaya, m, subtotal);
    return cost === null ? "—" : cost === 0 ? t("free") : money(cost);
  };
  const [minD, maxD] = wilaya ? deliveryDays(wilaya) : [];

  return (
    <div className="container checkout">
      <Link to="/" className="back-link"><ArrowLeftIcon size={16} /> {t("continueShopping")}</Link>
      <h1 className="page-title">{t("checkoutTitle")}</h1>

      <form className="checkout-grid" onSubmit={placeOrder} noValidate>
        <div className="checkout-main">
          <section className="panel">
            <h2>{t("yourDetails")}</h2>
            {field("fullName", t("fullName"), { autoComplete: "name" })}
            <div className="field-row">
              {field("phone", t("phone"), { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "0555 12 34 56", dir: "ltr" })}
              {field("email", t("email"), { type: "email", autoComplete: "email", dir: "ltr" })}
            </div>
          </section>

          <section className="panel">
            <h2>{t("delivery")}</h2>
            <div className="field-row">
              <div className={`field${showError("wilaya") ? " invalid" : ""}`}>
                <label htmlFor="wilaya">{t("wilaya")}</label>
                <select id="wilaya" value={form.wilaya} onChange={set("wilaya")} onBlur={blur("wilaya")} aria-invalid={!!showError("wilaya")}>
                  <option value="">{t("chooseWilaya")}</option>
                  {WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>{String(w.code).padStart(2, "0")} - {w.name[lang]}</option>
                  ))}
                </select>
                {showError("wilaya") && <span className="field-error">{t(errors.wilaya)}</span>}
              </div>
              {field("commune", t("commune"), { autoComplete: "address-level2" })}
            </div>

            <h3 className="sub-title">{t("deliveryMethod")}</h3>
            <div className="options">
              {[["home", t("home"), t("homeText")], ["desk", t("desk"), t("deskText")]].map(([key, label, text]) => (
                <label key={key} className={`option${method === key ? " selected" : ""}`}>
                  <input type="radio" name="method" value={key} checked={method === key} onChange={() => setMethod(key)} />
                  <div>
                    <strong>{label}</strong>
                    <span className="muted small">{text}{wilaya ? ` · ${t("days", { min: minD, max: maxD })}` : ""}</span>
                  </div>
                  <span className="option-price">{optionPrice(key)}</span>
                </label>
              ))}
            </div>
            {!wilaya && <p className="muted small hint">{t("pickWilayaFirst")}</p>}

            {method === "home" && field("address", t("address"), { autoComplete: "street-address", placeholder: t("addressHint") })}
          </section>

          <section className="panel">
            <h2>{t("payment")}</h2>
            <div className="options">
              <label className="option selected">
                <input type="radio" name="payment" checked readOnly />
                <CashIcon />
                <div><strong>{t("cod")}</strong><span className="muted small">{t("codText")}</span></div>
              </label>
              <label className="option disabled">
                <input type="radio" name="payment" disabled />
                <CardIcon />
                <div><strong>{t("card")}</strong><span className="muted small">{t("soon")}</span></div>
              </label>
            </div>
            <div className="notice"><LockIcon size={18} /><p>{t("demoNotice")}</p></div>
          </section>
        </div>

        <aside className="summary panel">
          <h2>{t("summary")}</h2>
          <ul className="summary-items">
            {items.map((i) => (
              <li key={i.key}>
                <span className="sum-img"><img src={i.image} alt="" /><span className="sum-qty">{i.qty}</span></span>
                <span className="sum-title">
                  {tr(i.title)}
                  {i.options?.length > 0 && <small className="muted">{i.options.map(tr).join(" · ")}</small>}
                </span>
                <span>{money(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="totals">
            <div className="row"><span>{t("subtotal")}</span><span>{money(subtotal)}</span></div>
            <div className="row">
              <span>{t("shipping")}{wilaya ? ` · ${wilaya.name[lang]}` : ""}</span>
              <span>{shipping === null ? t("toCalculate") : shipping === 0 ? t("free") : money(shipping)}</span>
            </div>
            <div className="row total"><span>{t("total")}</span><span>{money(total)}</span></div>
            <p className="muted small">{t("taxIncluded")}</p>
          </div>
          <button className="btn btn-dark btn-block btn-lg" type="submit" disabled={placing}>
            {placing ? <><span className="spinner" /> {t("placing")}</> : t("confirmOrder", { total: money(total) })}
          </button>
        </aside>
      </form>
    </div>
  );
}
