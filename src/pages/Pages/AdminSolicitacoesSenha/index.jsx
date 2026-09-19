import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaWhatsapp, FaKey, FaTrash } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import api from "../../../services/api";

export default function AdminSolicitacoesSenha() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(true);

  const [idSelecionado, setIdSelecionado] = useState(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [toast, setToast] = useState(null);
  const mostrarToast = (tipo, mensagem) => setToast({ tipo, mensagem });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const token = localStorage.getItem("token");

  // Confirma que quem está aqui é realmente um admin
  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const { data } = await api.get("/API/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuario(data);
        if (data.cargo !== "admin") {
          navigate("/home");
        }
      } catch (error) {
        navigate("/login");
      } finally {
        setCarregandoPerfil(false);
      }
    };
    carregarPerfil();
  }, [navigate, token]);

  const carregarSolicitacoes = useCallback(async () => {
    setCarregandoLista(true);
    try {
      const { data } = await api.get("/API/admin/solicitacoes-senha", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSolicitacoes(data.solicitacoes || []);
    } catch (error) {
      mostrarToast(
        "erro",
        error.response?.data?.error || "Erro ao carregar solicitações."
      );
    } finally {
      setCarregandoLista(false);
    }
  }, [token]);

  useEffect(() => {
    if (usuario?.cargo === "admin") {
      carregarSolicitacoes();
    }
  }, [usuario, carregarSolicitacoes]);

  const handleDefinirSenha = async (e) => {
    e.preventDefault();
    if (enviando || !idSelecionado) return;

    if (novaSenha.length < 6) {
      mostrarToast("erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      await api.put(
        `/API/admin/solicitacoes-senha/${idSelecionado}`,
        { novaSenha },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      mostrarToast("sucesso", "Senha atualizada! Agora é só avisar o usuário pelo WhatsApp.");
      setIdSelecionado(null);
      setNovaSenha("");
      carregarSolicitacoes();
    } catch (error) {
      mostrarToast(
        "erro",
        error.response?.data?.error || "Erro ao definir a nova senha."
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleDescartar = async (id) => {
    try {
      await api.delete(`/API/admin/solicitacoes-senha/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      mostrarToast("sucesso", "Solicitação descartada.");
      carregarSolicitacoes();
    } catch (error) {
      mostrarToast(
        "erro",
        error.response?.data?.error || "Erro ao descartar solicitação."
      );
    }
  };

  if (carregandoPerfil) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f7f7f8]">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors"
          >
            <FaArrowLeft /> Voltar
          </button>
          <img src={logo} alt="Logo" className="h-8" />
        </div>

        <h1 className="text-xl font-semibold text-gray-800 mb-1">
          Solicitações de troca de senha
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Defina a nova senha do usuário e avise ele pelo WhatsApp informado.
        </p>

        {carregandoLista ? (
          <p className="text-sm text-gray-400">Carregando solicitações...</p>
        ) : solicitacoes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
            Nenhuma solicitação pendente no momento.
          </div>
        ) : (
          <div className="space-y-3">
            {solicitacoes.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-800">
                      {s.usuarios?.nome_usuario || "Usuário"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {s.usuarios?.email_usuario}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-green-600 mt-1">
                      <FaWhatsapp /> {s.telefone}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Solicitado em{" "}
                      {new Date(s.criado_em).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIdSelecionado(s.id);
                        setNovaSenha("");
                      }}
                      className="flex items-center gap-2 text-sm bg-orange-500 text-white px-3 py-2 rounded-xl hover:bg-orange-600 transition-colors"
                    >
                      <FaKey /> Definir senha
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDescartar(s.id)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 px-3 py-2 transition-colors"
                    >
                      <FaTrash /> Descartar
                    </button>
                  </div>
                </div>

                {idSelecionado === s.id && (
                  <form
                    onSubmit={handleDefinirSenha}
                    className="mt-4 pt-4 border-t border-gray-100 flex gap-2"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Nova senha (mín. 6 caracteres)"
                      className="flex-1 rounded-xl border border-gray-200 py-2 px-3 text-sm outline-none
                                 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                    <button
                      type="submit"
                      disabled={enviando}
                      className="rounded-xl bg-green-500 text-white text-sm px-4 py-2 font-medium hover:bg-green-600 transition-colors disabled:opacity-60"
                    >
                      {enviando ? "Salvando..." : "Confirmar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIdSelecionado(null)}
                      className="rounded-xl border border-gray-200 text-sm px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
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
