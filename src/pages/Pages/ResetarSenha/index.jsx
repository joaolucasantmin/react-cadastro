import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaLock, FaShieldAlt, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import fundo from "../../../assets/fundo.jpg";
import api from "../../../services/api";

export default function ResetarSenha() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [validando, setValidando] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [motivo, setMotivo] = useState("");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [toast, setToast] = useState(null);

  const mostrarToast = (tipo, mensagem) => setToast({ tipo, mensagem });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const validar = async () => {
      try {
        await api.get(`/API/senha/validar/${token}`);
        setTokenValido(true);
      } catch (error) {
        const reason = error.response?.data?.reason;
        const mensagens = {
          NOT_FOUND: "Link inválido.",
          EXPIRED: "Link expirado. Solicite um novo.",
          USED: "Este link já foi utilizado.",
        };
        setMotivo(mensagens[reason] || "Link inválido ou expirado.");
      } finally {
        setValidando(false);
      }
    };
    validar();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (carregando) return;

    if (novaSenha.length < 6) {
      mostrarToast("erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmar) {
      mostrarToast("erro", "As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    try {
      await api.post("/API/senha/resetar", { token, novaSenha });
      mostrarToast("sucesso", "Senha redefinida! Faça login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      mostrarToast(
        "erro",
        error.response?.data?.error || "Erro ao redefinir senha."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${fundo})`, backgroundPosition: "center 82%" }}
    >
      <div className="w-[450px] rounded-3xl bg-white shadow-xl px-8 py-10">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-44" />
        </div>

        {validando ? (
          <p className="text-center text-gray-400 text-sm">Validando link...</p>
        ) : !tokenValido ? (
          <div className="text-center space-y-4">
            <h1 className="text-xl font-semibold text-gray-800">Link inválido</h1>
            <p className="text-sm text-gray-500">{motivo}</p>
            <Link
              to="/esqueci-senha"
              className="inline-block rounded-xl bg-orange-500 py-3 px-6 text-white font-semibold
                         hover:bg-orange-600 transition-all"
            >
              Solicitar novo link
            </Link>
            <div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500"
              >
                <FaArrowLeft className="text-xs" /> Voltar para o login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-gray-800">Nova senha</h1>
              <p className="text-sm text-gray-500 mt-1">
                Crie uma nova senha para sua conta.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={mostrar ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Nova senha..."
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-12 outline-none
                             focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
                <button
                  type="button"
                  onClick={() => setMostrar(!mostrar)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                >
                  {mostrar ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="relative">
                <FaShieldAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="Confirme a nova senha..."
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none
                             focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-xl bg-orange-500 py-3 text-white font-semibold transition-all
                           duration-300 hover:bg-orange-600 hover:scale-[1.02] disabled:opacity-60"
              >
                {carregando ? "Salvando..." : "Redefinir senha"}
              </button>
            </form>
          </>
        )}
      </div>

      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-lg
                      text-sm font-medium text-white ${
                        toast.tipo === "sucesso" ? "bg-green-500" : "bg-red-500"
                      }`}
        >
          {toast.mensagem}
        </div>
      )}
    </main>
  );
}
