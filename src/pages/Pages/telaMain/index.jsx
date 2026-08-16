import { useState, useRef, useEffect } from "react";
import api from '/src/services/api'
import { useNavigate } from "react-router-dom";

import {
  FaSearch,
  FaPaperclip,
  FaPaperPlane,
  FaSignOutAlt,
  FaUserCircle,
  FaArrowLeft,
} from "react-icons/fa";
import logo from "/src/assets/logo.png";

// ---------------------------------------------------------------------------
// MOCK DE DADOS — remover quando a API de conversas/mensagens estiver pronta
// ---------------------------------------------------------------------------
const CONTATOS_MOCK = [
  {
    id: 1,
    nome: "Fulano",
    ultimaMensagem: "Beleza, te aviso quando chegar!",
    hora: "09:41",
    naoLidas: 2,
  },
  {
    id: 2,
    nome: "Adilson Mineiro",
    ultimaMensagem: "Segue o orçamento em anexo.",
    hora: "08:15",
    naoLidas: 0,
  },
  {
    id: 3,
    nome: "Suporte Técnico",
    ultimaMensagem: "Instalação confirmada para sexta.",
    hora: "Ontem",
    naoLidas: 0,
  },
  {
    id: 4,
    nome: "Cliente - Maria",
    ultimaMensagem: "Obrigada pelo atendimento!",
    hora: "Ontem",
    naoLidas: 0,
  },
];

const MENSAGENS_MOCK = {
  1: [
    { id: 1, autor: "eles", texto: "Oi! Tudo bem?", hora: "09:30" },
    { id: 2, autor: "eu", texto: "Tudo sim, e com você?", hora: "09:32" },
    { id: 3, autor: "eles", texto: "Tudo certo por aqui.", hora: "09:33" },
    {
      id: 4,
      autor: "eles",
      texto: "Beleza, te aviso quando chegar!",
      hora: "09:41",
    },
  ],
  2: [
    { id: 1, autor: "eles", texto: "Segue o orçamento em anexo.", hora: "08:15" },
  ],
  3: [
    { id: 1, autor: "eles", texto: "Instalação confirmada para sexta.", hora: "Ontem" },
  ],
  4: [
    { id: 1, autor: "eles", texto: "Obrigada pelo atendimento!", hora: "Ontem" },
  ],
};

export default function Home() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const [contatos, setContatos] = useState([]);
const [contatoSelecionado, setContatoSelecionado] = useState(null);
const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");

  // No mobile só um painel aparece por vez: lista de conversas OU chat aberto.
  // A partir do breakpoint md, os dois painéis ficam sempre visíveis lado a lado.
  const [chatAberto, setChatAberto] = useState(false);

  const scrollRef = useRef(null);

  // -------------------------------------------------------------------------
  // Verificação de login + busca do perfil (mesma lógica do TelaMain antigo)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const buscarUsuario = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await api.get("/API/perfil", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsuario(response.data);
      } catch (error) {
        console.log(error);
        // Token inválido ou expirado -> volta pro login
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setCarregando(false);
      }
    };

    buscarUsuario();
    
  }, [navigate]);

    const carregarContatos = async () =>{
      try{
        const token = localStorage.getItem("token");

        const response = await api.get("/API/usuarios", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        //Remove o proprio usuario da lista
        const lista = response.data.usuarios.filter(
          (u) => u.id !== usuario?.id
        );

        setContatos(lista);

        if(lista.length > 0 && !contatoSelecionado) {
          setContatoSelecionado(lista[0]);
        }

      }catch(erro){
        console.log("Erro ao carregar contatos: ",erro);
      }
    };

    const carregarMensagens = async (idContato) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get(`/API/mensagens/${idContato}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setMensagens(response.data);

  } catch (erro) {
    console.log("Erro ao carregar mensagens:", erro);
  }
};



    useEffect(() => {
      if (usuario) {
        carregarContatos();
      }
    }, [usuario]);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const handleSelecionarContato = async (contato) => {
  setContatoSelecionado(contato);
  setChatAberto(true);

  await carregarMensagens(contato.id);
  };

  const handleVoltarParaLista = () => {
    setChatAberto(false);
  };

  const handleEnviarMensagem = async (e) => {
    e.preventDefault();
    if (!texto.trim() || !contatoSelecionado) return;

    try{
      const token = localStorage.getItem("token");

      await api.post("/API/mensagens",
        {
          destinatario: contatoSelecionado.id,
          mensagem: texto.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTexto("");

      //Recarrega as mensagens da conversa
      await carregarMensagens(contatoSelecionado.id);

    }catch(erro){
      console.log("Erro ao enviar mensagem: ", erro);
    }
  };

  

  const handleSair = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const contatosFiltrados = contatos.filter((c) =>
    c.nome_usuario.toLowerCase().includes(busca.toLowerCase())
  );

  // Enquanto verifica o token / busca o perfil, evita piscar a tela
  if (carregando) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }




  return (
    <main className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Corpo principal: sidebar + chat */}
      <div className="flex flex-1 min-h-0">
        {/* ---------------- SIDEBAR ---------------- */}
        <aside
          className={`${
            chatAberto ? "hidden" : "flex"
          } md:flex w-full md:w-[380px] shrink-0 border-r border-gray-200 bg-white flex-col`}
        >
          {/* Pesquisa */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar conversa..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-11 pr-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          {/* Lista de contatos */}
          <div className="flex-1 overflow-y-auto">
            {contatosFiltrados.length === 0 && (
              <p className="text-center text-sm text-gray-400 mt-6">
                Nenhuma conversa encontrada.
              </p>
            )}

            {contatosFiltrados.map((contato) => {
              const ativo = contato.id === contatoSelecionado?.id;
              return (
                <button
                  key={contato.id}
                  onClick={() => handleSelecionarContato(contato)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 ${
                    ativo ? "bg-orange-50" : "hover:bg-gray-50"
                  }`}
                >
                  <FaUserCircle className="text-4xl text-gray-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-gray-800 truncate">
                        {contato.nome_usuario}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">
                        Horas
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 truncate">
                        ultimaMensagem
                      </span>
                      {contato.naoLidas > 0 && (
                        <span className="ml-2 shrink-0 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          naoLidas
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Rodapé sidebar: Sair */}
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaUserCircle className="text-2xl text-gray-300" />
              <span className="text-sm font-medium text-gray-600">
                {usuario?.nome_usuario || "Minha conta"}
              </span>
            </div>
            <button
              onClick={handleSair}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors"
            >
              <FaSignOutAlt />
              Sair
            </button>
          </div>
        </aside>

        {/* ---------------- ÁREA DO CHAT ---------------- */}
        <section
          className={`${
            chatAberto ? "flex" : "hidden"
          } md:flex flex-1 flex-col min-w-0`}
        >
          {/* Header do chat */}
          <div className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handleVoltarParaLista}
                className="md:hidden text-gray-500 hover:text-orange-500 transition-colors text-lg shrink-0"
                title="Voltar"
              >
                <FaArrowLeft />
              </button>
              <FaUserCircle className="text-3xl text-gray-300 shrink-0" />
              <span className="font-semibold text-gray-800 truncate">
                {contatoSelecionado?.nome_usuario || "Selecione uma conversa"}
              </span>
            </div>
            <img src={logo} alt="Logo" className="h-10 hidden sm:block shrink-0" />
          </div>

          {/* Mensagens */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-2 bg-[#f7f7f8]"
          >
            {mensagens.map((msg) => (
              <div
                key={msg.cod_mensagem}
                className={`flex ${
                  msg.cod_remetente === usuario.id 
                  ? "justify-end" 
                  : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[60%] rounded-xl px-4 py-2 shadow-sm ${
                    msg.cod_remetente === usuario.id
                      ? "bg-orange-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.mensagem}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      msg.cod_remetente === usuario.id
                      ? "text-orange-100" 
                      : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.data_envio).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {mensagens.length === 0 && (
              <p className="text-center text-sm text-gray-400 mt-10">
                Nenhuma mensagem ainda. Diga oi 👋
              </p>
            )}
          </div>

          {/* Campo de digitar */}
          <form
            onSubmit={handleEnviarMensagem}
            className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 flex items-center gap-3"
          >
            <button
              type="button"
              className="text-gray-400 hover:text-orange-500 transition-colors text-xl"
              title="Anexar arquivo"
            >
              <FaPaperclip />
            </button>

            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-1 rounded-xl border border-gray-200 py-2.5 px-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />

            <button
              type="submit"
              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white h-10 w-10 flex items-center justify-center transition-colors"
              title="Enviar"
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
