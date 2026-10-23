import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useI18n } from "../i18n.jsx";
import { FREE_SHIPPING_FROM } from "../format.js";
import QtyStepper from "./QtyStepper.jsx";
import { BagIcon, CloseIcon, TrashIcon } from "./Icons.jsx";

export default function CartDrawer() {
  const { items, open, setOpen, subtotal, count, setQty, remove } = useCart();
  const { t, tr, money } = useI18n();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const panel = useRef(null);

  // Close on route change and on Escape; lock page scroll while open
  useEffect(() => setOpen(false), [pathname, setOpen]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const remaining = Math.max(0, FREE_SHIPPING_FROM - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100);

  return (
    <div className={`drawer-root${open ? " open" : ""}`} aria-hidden={!open} inert={open ? undefined : ""}>
      <div className="drawer-backdrop" onClick={() => setOpen(false)} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={t("yourCart")} tabIndex={-1} ref={panel}>
        <header className="drawer-head">
          <h2>{t("yourCart")} <span className="muted">({count})</span></h2>
          <button className="icon-btn ghost" onClick={() => setOpen(false)} aria-label={t("close")}>
            <CloseIcon />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <div className="empty-icon"><BagIcon size={28} /></div>
            <p>{t("cartEmpty")}</p>
            <button className="btn btn-dark" onClick={() => setOpen(false)}>{t("continueShopping")}</button>
          </div>
        ) : (
          <>
            <div className="ship-progress">
              <p>{remaining > 0 ? t("freeShipLeft", { amount: money(remaining) }) : t("freeShipDone")}</p>
              <div className="bar"><span style={{ width: `${progress}%` }} /></div>
            </div>

            <ul className="drawer-items">
              {items.map((item) => (
                <li key={item.key} className="line-item">
                  <Link to={`/product/${item.id}`} className="li-img"><img src={item.image} alt="" /></Link>
                  <div className="li-info">
                    <Link to={`/product/${item.id}`} className="li-title">{tr(item.title)}</Link>
                    {item.options?.length > 0 && <span className="li-brand">{item.options.map(tr).join(" · ")}</span>}
                    <div className="li-actions">
                      <QtyStepper small value={item.qty} max={Math.min(item.stock || 10, 10)} onChange={(q) => setQty(item.key, q)} />
                      <button className="link-btn" onClick={() => remove(item.key)} aria-label={t("remove", { name: tr(item.title) })}>
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                  <span className="li-price">{money(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>

            <footer className="drawer-foot">
              <div className="row"><span>{t("subtotal")}</span><strong>{money(subtotal)}</strong></div>
              <p className="muted small">{t("shippingNext")}</p>
              <button className="btn btn-dark btn-block" onClick={() => navigate("/checkout")}>{t("checkout")}</button>
              <button className="btn btn-light btn-block" onClick={() => setOpen(false)}>{t("continueShopping")}</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
