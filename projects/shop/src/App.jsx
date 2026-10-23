import { useEffect } from "react";
import { Link, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import { EmptyState } from "./components/States.jsx";
import { useI18n } from "./i18n.jsx";
import { BUSINESS } from "./config/business.js";
import Home from "./pages/Home.jsx";
import Product from "./pages/Product.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import AdminApp from "./admin/AdminApp.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Header, footer and cart around every shop page
function ShopLayout() {
  const { pathname } = useLocation();
  const { tr, shopName } = useI18n();
  useEffect(() => {
    if (pathname === "/") document.title = `${shopName} · ${tr(BUSINESS.tagline)}`;
  }, [pathname, shopName, tr]);
  return (
    <>
      <Header />
      <main className="main"><Outlet /></main>
      <Footer />
      <CartDrawer />
    </>
  );
}

function NotFound() {
  const { t } = useI18n();
  return (
    <div className="container">
      <EmptyState title={t("notFound")} text={t("notFoundText")} action={<Link className="btn btn-dark" to="/">{t("backToShop")}</Link>} />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route element={<ShopLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:orderId" element={<OrderSuccess />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
