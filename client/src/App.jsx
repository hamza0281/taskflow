import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import { SERVER_URL } from "./api";
import Cursor from "./components/Cursor";
import Landing from "./pages/Landing";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProjectBoard = lazy(() => import("./pages/ProjectBoard"));

const Loading = () => (
  <div className="loader-wrap"><div className="loader" /></div>
);

function App() {
  const { user } = useAuth();

  // wake the free server while the user is still reading the landing page
  useEffect(() => { fetch(SERVER_URL).catch(() => {}); }, []);

  return (
    <>
      <Cursor />
      <Toaster
        position="top-right"
        toastOptions={{ style: { borderRadius: 12, background: "var(--solid)", color: "var(--text)" } }}
      />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Landing />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/project/:id" element={user ? <ProjectBoard /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;