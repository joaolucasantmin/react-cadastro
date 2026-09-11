import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Cadastro from "./pages/Pages/Cadastro";
import Login from "./pages/Pages/Login";
import TelaMain from "./pages/Pages/telaMain";
import { InstalacaoProvider } from "./contexts/InstalacaoContext";

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
    // O InstalacaoProvider fica aqui fora, no nível mais alto do app,
    // para escutar o "beforeinstallprompt" desde o primeiro carregamento
    // da página, seja qual for a rota inicial (login, cadastro, home).
    <InstalacaoProvider>
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
    </InstalacaoProvider>
  );
}

export default App;
