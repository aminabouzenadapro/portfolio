import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { Loading } from "./components/ui.jsx";
import { useAuth } from "./auth.jsx";
import { useI18n } from "./i18n.jsx";
import Home from "./pages/Home.jsx";
import Catalog from "./pages/Catalog.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import Login from "./pages/Login.jsx";
import MyLearning from "./pages/MyLearning.jsx";
import Learn from "./pages/Learn.jsx";
import { Certificate, Verify } from "./pages/Certificate.jsx";
import Teacher from "./pages/Teacher.jsx";
import TeacherCourse from "./pages/TeacherCourse.jsx";

// Sends visitors to the sign-in page (and back afterwards) when a page needs an account
function RequireRole({ role, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="container page"><Loading /></div>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (user.role !== role) return <Navigate to={user.role === "teacher" ? "/teacher" : "/learning"} replace />;
  return children;
}

function NotFound() {
  const { t } = useI18n();
  return <div className="container page state"><h1>404</h1><p>{t("notFound")}</p></div>;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Catalog />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/certificate/:code" element={<Certificate />} />
        <Route path="/learning" element={<RequireRole role="student"><MyLearning /></RequireRole>} />
        <Route path="/learn/:slug/:lessonId?" element={<RequireRole role="student"><Learn /></RequireRole>} />
        <Route path="/teacher" element={<RequireRole role="teacher"><Teacher /></RequireRole>} />
        <Route path="/teacher/new" element={<RequireRole role="teacher"><TeacherCourse /></RequireRole>} />
        <Route path="/teacher/course/:slug" element={<RequireRole role="teacher"><TeacherCourse /></RequireRole>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
