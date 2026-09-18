import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import fundo from "../../../assets/fundo.jpg";
import api from "../../../services/api";

export default function EsqueciSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [toast, setToast] = useState(null);

  const mostrarToast = (tipo, mensagem) => setToast({ tipo, mensagem });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (carregando) return;

    setCarregando(true);
    try {
      await api.post("/API/senha/solicitar", { email });
      mostrarToast("sucesso", "Link enviado! Verifique seu e-mail.");
      setTimeout(() => navigate("/login"), 2500);
    } catch (error) {
      mostrarToast(
        "erro",
        error.response?.data?.error || "Erro ao solicitar redefinição."
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

        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Esqueci minha senha</h1>
          <p className="text-sm text-gray-500 mt-1">
            Informe seu e-mail para receber o link de redefinição.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              placeholder="Digite seu email..."
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
            {carregando ? "Enviando..." : "Enviar link"}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500"
            >
              <FaArrowLeft className="text-xs" /> Voltar para o login
            </Link>
          </div>
        </form>
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
