import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useI18n } from "../i18n.jsx";
import { originalPrice } from "../format.js";
import Rating from "./Rating.jsx";
import { PlusIcon } from "./Icons.jsx";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const { t, tr, money } = useI18n();
  const was = originalPrice(product.price, product.discount);
  const soldOut = product.stock === 0;
  const title = tr(product.title);
  const hasOptions = product.options?.length > 0;

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="pc-media">
        <img src={product.image} alt={title} loading="lazy" />
        {was ? <span className="badge badge-sale">−{product.discount}%</span>
          : product.bestseller && <span className="badge badge-best">{t("bestseller")}</span>}
        {soldOut
          ? <span className="badge badge-low">{t("soldOut")}</span>
          : product.stock <= 5 && <span className="badge badge-low">{t("onlyLeft", { n: product.stock })}</span>}
      </Link>
      <div className="pc-body">
        {product.brand && <span className="pc-region">{product.brand}</span>}
        <h3 className="pc-title">
          <Link to={`/product/${product.id}`}>{title}</Link>
        </h3>
        <Rating value={product.rating} />
        <div className="pc-foot">
          <div className="price">
            <span className="price-now">{money(product.price)}</span>
            {was && <span className="price-was">{money(was)}</span>}
          </div>
          {/* Products with options open the product page so the shopper can choose */}
          {hasOptions ? (
            <Link to={`/product/${product.id}`} className="icon-btn add-btn" aria-label={t("addNamed", { name: title })} title={t("addToCart")}>
              <PlusIcon size={18} />
            </Link>
          ) : (
            <button
              className="icon-btn add-btn"
              onClick={() => add(product)}
              disabled={soldOut}
              aria-label={soldOut ? t("soldOut") : t("addNamed", { name: title })}
              title={soldOut ? t("soldOut") : t("addToCart")}
            >
              <PlusIcon size={18} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
