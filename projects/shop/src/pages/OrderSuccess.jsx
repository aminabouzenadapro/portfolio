import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "../i18n.jsx";
import { deliveryDays } from "../format.js";
import { wilayaByCode } from "../data/wilayas.js";
import { useOrders } from "../store/db.js";
import { EmptyState } from "../components/States.jsx";
import { CheckIcon } from "../components/Icons.jsx";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const { t, tr, money, date, lang, shopName } = useI18n();

  // Orders are kept in the shared store, so a refresh still works
  const order = useOrders().find((o) => o.id === orderId);

  useEffect(() => { document.title = `${t("orderNumber", { id: orderId })} — ${shopName}`; }, [t, orderId, shopName]);

  if (!order) {
    return (
      <div className="container">
        <EmptyState title={t("orderNotFound")} text={t("orderNotFoundText")} action={<Link className="btn btn-dark" to="/">{t("backToShop")}</Link>} />
      </div>
    );
  }

  const c = order.customer;
  const wilaya = wilayaByCode(c.wilaya);
  const eta = new Date(order.date);
  eta.setDate(eta.getDate() + deliveryDays(wilaya)[1]);

  return (
    <div className="container success">
      <div className="success-head">
        <span className="success-icon"><CheckIcon size={28} /></span>
        <p className="muted">{t("orderNumber", { id: order.id })}</p>
        <h1>{t("thanks", { name: c.fullName.split(" ")[0] })}</h1>
        <p className="muted">
          {t("orderConfirmed", { phone: c.phone })}
          <br />{t("demoNothing")}
        </p>
      </div>

      <div className="success-grid">
        <section className="panel">
          <h2>{t("items")}</h2>
          <ul className="summary-items">
            {order.items.map((i) => (
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
            <div className="row"><span>{t("subtotal")}</span><span>{money(order.subtotal)}</span></div>
            <div className="row"><span>{t("shipping")}</span><span>{order.shipping === 0 ? t("free") : money(order.shipping)}</span></div>
            <div className="row total"><span>{t("total")}</span><span>{money(order.total)}</span></div>
          </div>
        </section>

        <section className="panel details">
          <div>
            <h3>{t("deliverTo")}</h3>
            <p>
              {c.fullName}<br />
              <span dir="ltr">{c.phone}</span><br />
              {order.method === "home" && <>{c.address}<br /></>}
              {c.commune}, {wilaya.name[lang]}
            </p>
          </div>
          <div>
            <h3>{t("deliveryMethod")}</h3>
            <p>{order.method === "home" ? t("home") : t("desk")}</p>
            <p className="muted small">{t("estimated", { date: date(eta, { weekday: "long", day: "numeric", month: "long" }) })}</p>
          </div>
          <div>
            <h3>{t("payment")}</h3>
            <p>{t("paidCod")}</p>
          </div>
          <Link to="/" className="btn btn-dark btn-block">{t("continueShopping")}</Link>
        </section>
      </div>
    </div>
  );
}
