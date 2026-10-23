import { useLocation, useNavigate } from "react-router-dom";

// Scrolls to a homepage section, navigating home first if needed.
// (Plain #anchors can't be used: the router already uses the URL hash.)
export function useSectionNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (id) => {
    if (pathname === "/") document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    else navigate("/", { state: { section: id } });
  };
}
