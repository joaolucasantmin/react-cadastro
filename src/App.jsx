import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Cadastro from "./pages/Pages/Cadastro";
import Login from "./pages/Pages/Login";
import TelaMain from "./pages/Pages/telaMain";

function RotaInicial() {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/home" replace />;
  }

  return <Navigate to="/login" replace />;
}

function RotaProtegida({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Página inicial */}
        <Route path="/" element={<RotaInicial />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Cadastro */}
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Home protegida */}
        <Route
          path="/home"
          element={
            <RotaProtegida>
              <TelaMain />
            </RotaProtegida>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;