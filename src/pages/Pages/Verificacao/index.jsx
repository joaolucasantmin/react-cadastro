import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaArrowLeft, FaRedo } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import fundo from "../../../assets/fundo.jpg";
import api from "../../../services/api";

export default function Verificacao() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  // Se o usuário cair direto nessa URL sem e-mail, volta pro cadastro
  useEffect(() => {
    if (!email) {
      navigate("/cadastro", { replace: true });
    }
  }, [email, navigate]);

  const [digitos, setDigitos] = useState(["", "", "", "", "", ""]);
  const [carregando, setCarregando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [segundosReenvio, setSegundosReenvio] = useState(60);
  const [toast, setToast] = useState(null);

  const inputsRef = useRef([]);

  // Toast
  const mostrarToast = (tipo, mensagem) => setToast({ tipo, mensagem });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Contador regressivo para reenvio
  useEffect(() => {
    if (segundosReenvio <= 0) return;
    const timer = setInterval(() => {
      setSegundosReenvio((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [segundosReenvio]);

  // Foca o primeiro input ao montar
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Atualiza um dígito específico e avança o foco automaticamente
  const handleChange = (index, valor) => {
    // Aceita só números
    if (!/^\d*$/.test(valor)) return;

    const novos = [...digitos];
    // Se colar mais de um dígito, distribui nos campos seguintes
    const caracteres = valor.split("");
    for (let i = 0; i < caracteres.length && index + i < 6; i++) {
      novos[index + i] = caracteres[i];
    }
    setDigitos(novos);

    // Foca o próximo campo vazio
    const proximoVazio = novos.findIndex((d) => d === "");
    if (proximoVazio !== -1) {
      inputsRef.current[proximoVazio]?.focus();
    } else {
      inputsRef.current[5]?.focus();
    }
  };

  // Backspace em campo vazio volta o foco
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digitos[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const texto = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!texto) return;

    const novos = ["", "", "", "", "", ""];
    for (let i = 0; i < texto.length; i++) {
      novos[i] = texto[i];
    }
    setDigitos(novos);

    // Foca o último campo preenchido
    inputsRef.current[Math.min(texto.length, 5)]?.focus();
  };

  // Envia a verificação
  const handleVerificar = async (e) => {
    e.preventDefault();
    if (carregando) return;

    const codigo = digitos.join("");
    if (codigo.length !== 6) {
      mostrarToast("erro", "Digite os 6 dígitos do código.");
      return;
    }

    setCarregando(true);

    try {
      await api.post("/API/otp/verify", { email, code: codigo });

      mostrarToast("sucesso", "E-mail verificado!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.mensagem ||
        "Código inválido ou expirado.";

      mostrarToast("erro", msg);

      // Limpa os campos e volta o foco pro primeiro
      setDigitos(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setCarregando(false);
    }
  };

  // Reenvia o código
  const handleReenviar = async () => {
    if (reenviando || segundosReenvio > 0) return;

    setReenviando(true);

    try {
      await api.post("/API/otp/send", { email });

      mostrarToast("sucesso", "Novo código enviado!");
      setSegundosReenvio(60);
      setDigitos(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        "Não foi possível reenviar. Tente novamente.";

      mostrarToast("erro", msg);
    } finally {
      setReenviando(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url(${fundo})`,
        backgroundPosition: "center 82%",
      }}
    >
      <div className="w-[450px] rounded-3xl bg-white shadow-xl px-8 py-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-44" />
        </div>

        {/* Título */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Verifique seu e-mail
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enviamos um código de 6 dígitos para
          </p>
          <p className="text-sm font-medium text-gray-700 break-all">
            {email}
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleVerificar} className="space-y-6">
          {/* Inputs dos 6 dígitos */}
          <div className="flex justify-center gap-2">
            {digitos.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-semibold rounded-xl border border-gray-200 outline-none
                           focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            ))}
          </div>

          {/* Botão Verificar */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-xl bg-orange-500 py-3 text-white font-semibold transition-all duration-300
                       hover:bg-orange-600 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            {carregando ? "Verificando..." : "Verificar"}
          </button>

          {/* Reenviar */}
          <div className="text-center text-sm text-gray-500">
            Não recebeu o código?{" "}
            {segundosReenvio > 0 ? (
              <span className="text-gray-400">
                Reenviar em {segundosReenvio}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleReenviar}
                disabled={reenviando}
                className="font-medium text-orange-500 hover:underline disabled:opacity-60"
              >
                {reenviando ? "Enviando..." : "Reenviar código"}
              </button>
            )}
          </div>

          {/* Voltar */}
          <div className="text-center">
            <Link
              to="/cadastro"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500 transition-colors"
            >
              <FaArrowLeft className="text-xs" />
              Voltar para o cadastro
            </Link>
          </div>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-lg
                      text-sm font-medium text-white ${
                        toast.tipo === "sucesso"
                          ? "bg-green-500"
                          : toast.tipo === "erro"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
        >
          {toast.mensagem}
        </div>
      )}
    </main>
  );
}