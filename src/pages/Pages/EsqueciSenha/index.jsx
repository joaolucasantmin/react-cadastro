import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaWhatsapp, FaArrowLeft } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import fundo from "../../../assets/fundo.jpg";
import api from "../../../services/api";

export default function EsqueciSenha() {
  const navigate = useNavigate();
  const [identificador, setIdentificador] = useState("");
  const [telefone, setTelefone] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [toast, setToast] = useState(null);

  const mostrarToast = (tipo, mensagem) => setToast({ tipo, mensagem });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (carregando) return;

    setCarregando(true);
    try {
      const { data } = await api.post("/API/senha/solicitar-admin", {
        identificador,
        telefone,
      });
      mostrarToast("sucesso", data.message || "Solicitação enviada!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      mostrarToast(
        "erro",
        error.response?.data?.error || "Erro ao enviar solicitação."
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
            Informe seus dados e o administrador vai entrar em contato pelo
            WhatsApp com sua nova senha.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              required
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              placeholder="Seu e-mail ou nome de usuario..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none
                         focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div className="relative">
            <FaWhatsapp className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              required
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Seu telefone com DDD (WhatsApp)..."
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
            {carregando ? "Enviando..." : "Enviar solicitação"}
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
                      text-sm font-medium text-white text-center max-w-[90%] ${
                        toast.tipo === "sucesso" ? "bg-green-500" : "bg-red-500"
                      }`}
        >
          {toast.mensagem}
        </div>
      )}
    </main>
  );
}
