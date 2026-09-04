import { useState, useRef, useEffect } from "react";
import api from '/src/services/api'
import { useNavigate } from "react-router-dom";
import supabase from "/src/services/supabase";

import {
  FaSearch,
  FaPaperclip,
  FaPaperPlane,
  FaSignOutAlt,
  FaUserCircle,
  FaArrowLeft,
  FaEllipsisV,
  FaUserPlus,
  FaTimes,
  FaCamera,
  FaEye,
  FaEyeSlash,
  FaTrash,
} from "react-icons/fa";
import logo from "/src/assets/logo.png";

//TEMPORARIO PARA TESTE
//console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
//console.log("KEY:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);


export default function Home() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);
  const [salvandoAlteracoes, setSalvandoAlteracoes] = useState(false);

  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [contatos, setContatos] = useState([]);
  const [pedidosAmizade, setPedidosAmizade] = useState([]);
  const [contatoSelecionado, setContatoSelecionado] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [mensagemSelecionada, setMensagemSelecionada] = useState(null);
  const [erroArquivo, setErroArquivo] = useState("");
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");

  // Toast de feedback (sucesso / erro / info), substitui os alert()
  const [toast, setToast] = useState(null); // { tipo: "sucesso" | "erro" | "info", mensagem }

  // No mobile só um painel aparece por vez: lista de conversas OU chat aberto.
  // A partir do breakpoint md, os dois painéis ficam sempre visíveis lado a lado.
  const [chatAberto, setChatAberto] = useState(false);

  // ---------------------------------------------------------------------
  // Menu de opções do contato (3 pontinhos), modal de configurações,
  // bloqueados e adicionar amigo
  // ---------------------------------------------------------------------
  const [menuOpcoesAberto, setMenuOpcoesAberto] = useState(false);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [abaConfig, setAbaConfig] = useState("perfil");
  const [usuariosBloqueados, setUsuariosBloqueados] = useState([]);

  const [mostrarAdicionarAmigo, setMostrarAdicionarAmigo] = useState(false);
  const [nomeAmigoBusca, setNomeAmigoBusca] = useState("");

  // Campos do formulário de perfil (aba "Perfil" do modal de configurações)
  const [novoNomeUsuario, setNovoNomeUsuario] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [fotoPreview, setFotoPreview] = useState(null);
  const [arquivoFoto, setArquivoFoto] = useState(null);

  const scrollRef = useRef(null);

  // Mostra um toast e some sozinho depois de alguns segundos
  const mostrarToast = (tipo, mensagem) => {
    setToast({ tipo, mensagem });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Verificação de login + busca do perfil
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

  // Preenche o formulário de perfil quando o usuário é carregado
  useEffect(() => {
    if (usuario) {
      setNovoNomeUsuario(usuario.nome_usuario || "");
      if (usuario.foto_perfil) {
        setFotoPreview(usuario.foto_perfil);
      }
    }
  }, [usuario]);

    const carregarContatos = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/API/amizades", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const amigos = response.data.amigos;

        // Busca a última mensagem de cada conversa
        const lista = await Promise.all(
          amigos.map(async (contato) => {
            try {
              const conversa = await api.get(`/API/mensagens/${contato.id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const mensagens = conversa.data;

              if (mensagens.length === 0) {
                return {
                  ...contato,
                  ultimaMensagem: "",
                  hora: "",
                  ultimaData: null,
                };
              }

              const ultima = mensagens[mensagens.length - 1];

              return {
                ...contato,
                ultimaMensagem:
                  ultima.mensagem || (ultima.arquivo_url ? "📎 Anexo" : ""),
                hora: new Date(ultima.data_envio).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "America/Sao_Paulo",
                }),
                ultimaData: ultima.data_envio,
              };
            } catch {
              return {
                ...contato,
                ultimaMensagem: "",
                hora: "",
                ultimaData: null,
              };
            }
          })
        );

        // Ordena pela conversa mais recente
        lista.sort((a, b) => {
          if (!a.ultimaData) return 1;
          if (!b.ultimaData) return -1;
          return new Date(b.ultimaData) - new Date(a.ultimaData);
        });

        setContatos(lista);

      } catch (erro) {
        console.log("Erro ao carregar contatos:", erro);
      }
    };




    const carregarPedidosAmizade = async () => {
      try{
        const token = localStorage.getItem("token");

        const response = await api.get("/API/amizades/pedidos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPedidosAmizade(response.data.pedidos);

      } catch(erro) {
        console.log("Erro ao carregar pedidos de amizade: ", erro);
      }
    };



    //ACEITAR AMIZADE
    const handleAceitarAmizade = async (idAmizade) => {
      try {
        const token = localStorage.getItem("token");

        await api.put(
          `/API/amizades/${idAmizade}/aceitar`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        //Remove o pedido da lista
        setPedidosAmizade((prev) => 
          prev.filter((pedido) => pedido.id !== idAmizade)
        );

        //Atualiza a lista de amigos
        await carregarContatos();

        
      } catch (erro) {
        console.log("Erro ao aceitar pedido de amizade: ", erro);
        mostrarToast(
          "erro",
          erro.response?.data?.mensagem || "Erro ao aceitar pedido de amizade."
        );
      }
    };


    //RECUSAR AMIZADE
    const handleRecusarAmizade = async (idAmizade) => {
      try {
        const token = localStorage.getItem("token");

        await api.put(
          `/API/amizades/${idAmizade}/recusar`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        //Remove o pedido da lista
        setPedidosAmizade((prev) => 
          prev.filter((pedido) => pedido.id !== idAmizade)
        );


      } catch (erro) {
        console.log("Erro ao recusar pedido de amizade: ", erro);
        mostrarToast(
          "erro",
          erro.response?.data?.mensagem || "Erro ao recusar pedido de amizade."
        );
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
      if (!usuario) return;

      const intervalo = setInterval(() => {
        carregarContatos();
        carregarPedidosAmizade();
      }, 5000); //5 Segundos  
        
      return() => clearInterval(intervalo);
    }, [usuario]);  


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);


    //REALTIME
    useEffect(() => {
  if (!contatoSelecionado || !usuario) return;

  const canal = supabase
    .channel("chat-tempo-real")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "mensagens",
      },
      (payload) => {
        const msg = payload.new;

        const ehDaConversa =
          (msg.cod_remetente === usuario.id &&
            msg.cod_destinatario === contatoSelecionado.id) ||
          (msg.cod_remetente === contatoSelecionado.id &&
            msg.cod_destinatario === usuario.id);

        if (ehDaConversa) {
          setMensagens((prev) => [...prev, msg]);

          const outroId =
            msg.cod_remetente === usuario.id
              ? msg.cod_destinatario
              : msg.cod_remetente;

          atualizarContatoNoTopo(
            outroId,
            msg.mensagem,
            new Date(msg.data_envio).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/Sao_Paulo",
            })
          );
        }
      }
    )
    .subscribe((status) => {
      console.log("Realtime status: ", status);
    });

  return () => {
    supabase.removeChannel(canal);
  };
}, [contatoSelecionado, usuario]);



  // -----------------------------------------------------------------------
  // Intercepta o botão/gesto "voltar" do celular: se o modal de configurações
  // ou o chat estiverem abertos, fecha eles em vez de deixar o navegador
  // sair da página (o que levava direto pra tela de login).
  // -----------------------------------------------------------------------
  useEffect(() => {
    const handlePopState = () => {
      if (modalConfigAberto) {
        setModalConfigAberto(false);
        return;
      }
      if (chatAberto) {
        setChatAberto(false);
        setMenuOpcoesAberto(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [chatAberto, modalConfigAberto]);


  
  // Atualiza a última mensagem e move a conversa para o topo
  const atualizarContatoNoTopo = (idContato, ultimaMensagem, hora) => {
  setContatos((prev) => {
    const lista = [...prev];
    const index = lista.findIndex((c) => c.id === idContato);

    if (index === -1) return prev;

    const contato = {
      ...lista[index],
      ultimaMensagem,
      hora,
    };

    lista.splice(index, 1);
    lista.unshift(contato);

    return lista;
  });
};

const handleSelecionarContato = async (contato) => {
  setContatoSelecionado(contato);
  setChatAberto(true);
  setMenuOpcoesAberto(false);

  // Cria uma entrada extra no histórico: assim o botão "voltar" do celular
  // fecha o chat em vez de sair direto da página
  window.history.pushState({ chatAberto: true }, "");

  await carregarMensagens(contato.id);
  };

  const handleVoltarParaLista = () => {
    window.history.back();
  };



  const handleEnviarMensagem = async (e) => {
    e.preventDefault();

    if(enviandoMensagem) return;

    if (!contatoSelecionado) return;

    // Não envia se não tiver texto nem arquivo
    if (!texto.trim() && !arquivoSelecionado) return;

    setEnviandoMensagem(true);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("destinatario", contatoSelecionado.id);

      // Adiciona o texto somente se existir
      if (texto.trim()) {
        formData.append("mensagem", texto.trim());
      }

      // Adiciona o arquivo somente se existir
      if (arquivoSelecionado) {
        formData.append("arquivo", arquivoSelecionado);
      }

      const response = await api.post(
        "/API/mensagens",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Limpa o campo de texto
      setTexto("");

      // Limpa o arquivo selecionado
      setArquivoSelecionado(null);

      // Limpa erro de arquivo
      setErroArquivo("");

      // Limpa o input de arquivo
      const inputArquivo = document.getElementById("input-arquivo");

      if (inputArquivo) {
        inputArquivo.value = "";
      }

      // Atualiza a mensagem no topo do contato
      atualizarContatoNoTopo(
        contatoSelecionado.id,
        response.data.mensagem || response.data.nome_arquivo || "📎 Anexo",
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo",
        })
      );

    } catch (erro) {

      console.log("Erro ao enviar mensagem: ", erro);

      if (erro.response?.status === 413) {
        setErroArquivo("O arquivo não pode ultrapassar 10 MB.");
        return;
      }

      mostrarToast(
        "erro",
        erro.response?.data?.mensagem || "Erro ao enviar mensagem."
      );

    } finally{

      setEnviandoMensagem(false);
    }
  };




  const handleExcluirMensagem = async (idMensagem) => {
    
    try {
    const token = localStorage.getItem("token");

    await api.delete(`/API/mensagens/${idMensagem}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Remove a mensagem da tela
    setMensagens((mensagensAtuais) =>
      mensagensAtuais.filter(
        (msg) => msg.cod_mensagem !== idMensagem
      )
    );

    // Cancela a seleção
    setMensagemSelecionada(null);

  } catch (erro) {
    console.log("Erro ao excluir mensagem:", erro);
  }

  };




  const handleSair = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ---------------------------------------------------------------------
  // Opções do menu de 3 pontinhos: remover amizade, bloquear e (admin) excluir
  // ---------------------------------------------------------------------
  const handleRemoverAmizade = async (contato) => {
    if (!contato) return;

    try {
      const token = localStorage.getItem("token");
      // Remove apenas da lista de contatos. O usuário continua podendo
      // ser encontrado na pesquisa e uma nova amizade pode ser criada depois.
      // await api.delete(`/API/amizades/${contato.id}`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      setContatos((prev) => prev.filter((c) => c.id !== contato.id));

      if (contatoSelecionado?.id === contato.id) {
        setContatoSelecionado(null);
        setChatAberto(false);
      }
    } catch (erro) {
      console.log("Erro ao remover amizade:", erro);
    } finally {
      setMenuOpcoesAberto(false);
    }
  };

  const handleBloquearUsuario = async (contato) => {
    if (!contato) return;

    const confirmar = window.confirm(
      `Bloquear ${contato.nome_usuario}? Vocês não poderão mais trocar mensagens.`
    );
    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");
      // Bloqueio impede novas mensagens e some da lista de contatos.
      // await api.post(`/API/usuarios/${contato.id}/bloquear`, {}, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      setContatos((prev) => prev.filter((c) => c.id !== contato.id));
      setUsuariosBloqueados((prev) =>
        prev.some((u) => u.id === contato.id) ? prev : [...prev, contato]
      );

      if (contatoSelecionado?.id === contato.id) {
        setContatoSelecionado(null);
        setChatAberto(false);
      }
    } catch (erro) {
      console.log("Erro ao bloquear usuário:", erro);
    } finally {
      setMenuOpcoesAberto(false);
    }
  };

  const handleExcluirUsuario = async (contato) => {
    if (!contato) return;

    const confirmar = window.confirm(
      `Excluir o usuário ${contato.nome_usuario}? As mensagens serão mantidas, mas o nome dele passará a ser "Usuário excluído".`
    );
    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");
      // Ação exclusiva de admin: o backend deve manter as mensagens e trocar
      // o nome do usuário para "Usuário excluído" em vez de apagar tudo.
      // await api.delete(`/API/usuarios/${contato.id}`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      setContatos((prev) => prev.filter((c) => c.id !== contato.id));

      if (contatoSelecionado?.id === contato.id) {
        setContatoSelecionado(null);
        setChatAberto(false);
      }
    } catch (erro) {
      console.log("Erro ao excluir usuário:", erro);
    } finally {
      setMenuOpcoesAberto(false);
    }
  };

  const handleDesbloquearUsuario = async (contato) => {
    try {
      const token = localStorage.getItem("token");
      // await api.delete(`/API/usuarios/${contato.id}/bloquear`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      setUsuariosBloqueados((prev) => prev.filter((u) => u.id !== contato.id));
    } catch (erro) {
      console.log("Erro ao desbloquear usuário:", erro);
    }
  };




  // -------------------------------------------------------
  // Adicionar amigo 
  // -------------------------------------------------------
  const handleEnviarPedidoAmizade = async () => {
    if (!nomeAmigoBusca.trim()) return;

    try {

    const token = localStorage.getItem("token");

    // Primeiro busca os usuários pelo nome
    const response = await api.get("/API/usuarios", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const usuarioEncontrado = response.data.usuarios.find(
      (u) =>
        u.nome_usuario.toLowerCase() ===
        nomeAmigoBusca.trim().toLowerCase()
    );

    if (!usuarioEncontrado) {
      mostrarToast("erro", "Usuário não encontrado.");
      return;
    }

    // Envia o pedido
    await api.post(
      "/API/amizades",
      {
        destinatario: usuarioEncontrado.id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    mostrarToast("sucesso", "Pedido de amizade enviado!");
    setNomeAmigoBusca("");
    setMostrarAdicionarAmigo(false);

    } catch (erro) {

    console.log("Erro ao enviar pedido de amizade:", erro);

    mostrarToast(
      "erro",
      erro.response?.data?.mensagem || "Erro ao enviar pedido de amizade."
    );
  }

  };





  // ---------------------------------------------------------------------
  // Configurações de perfil (nome, senha, foto)
  // ---------------------------------------------------------------------
  
  // Libera a URL temporária da foto para evitar vazamento de memória
  useEffect(() => {
    return () => {
      if (fotoPreview && fotoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(fotoPreview);
      }
    };
  }, [fotoPreview]);

const handleSelecionarFoto = (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setArquivoFoto(arquivo);
    setFotoPreview(URL.createObjectURL(arquivo));
  };


const handleSalvarPerfil = async (e) => {
    e.preventDefault();

    if (salvandoAlteracoes) return;

    // Verifica se algo realmente mudou antes de disparar a requisição
    const nomeAlterado = novoNomeUsuario.trim() !== (usuario?.nome_usuario || "");
    const senhaAlterada = !!novaSenha;
    const fotoAlterada = !!arquivoFoto;

    if (!nomeAlterado && !senhaAlterada && !fotoAlterada) {
      mostrarToast("info", "Nenhuma alteração feita.");
      return;
    }

    if (novaSenha && novaSenha !== confirmarSenha) {
      mostrarToast("erro", "As senhas não coincidem.");
      return;
    }

    setSalvandoAlteracoes(true);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("nome_usuario", novoNomeUsuario);

      if (novaSenha){ 
        formData.append("senha", novaSenha);
      }

      if (arquivoFoto){ 
        formData.append("foto_perfil", arquivoFoto);
      }

      const response = await api.put("/API/perfil", formData, {
        headers:{
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUsuario(response.data);
      setFotoPreview(response.data.foto_perfil);
      setNovaSenha("");
      setConfirmarSenha("");
      setArquivoFoto(null);

      mostrarToast("sucesso", "Perfil atualizado!");

    } catch (erro) {
      if(erro.response?.status === 409){
        mostrarToast("erro", erro.response.data.mensagem);
        return;
      }

      console.log("Erro ao atualizar perfil:", erro);
      mostrarToast("erro", "Erro ao atualizar perfil.");

    } finally {
      setSalvandoAlteracoes(false);
    }
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
    <main className="h-dvh w-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Corpo principal: sidebar + chat */}
      <div className="flex flex-1 min-h-0">
        {/* ---------------- SIDEBAR ---------------- */}
        <aside
          className={`${
            chatAberto ? "hidden" : "flex"
          } md:flex w-full md:w-[380px] shrink-0 border-r border-gray-200 bg-white flex-col`}
        >
          {/* Pesquisa + adicionar amigo */}
          <div className="p-4 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Pesquisar conversa..."
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-11 pr-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <button
                type="button"
                onClick={() => setMostrarAdicionarAmigo((v) => !v)}
                title="Adicionar amigo"
                className={`shrink-0 h-11 w-11 rounded-xl border flex items-center justify-center transition-colors ${
                  mostrarAdicionarAmigo
                    ? "border-orange-500 text-orange-500 bg-orange-50"
                    : "border-gray-200 text-gray-400 hover:text-orange-500 hover:border-orange-500"
                }`}
              >
                <FaUserPlus />
              </button>
            </div>

            {mostrarAdicionarAmigo && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={nomeAmigoBusca}
                  onChange={(e) => setNomeAmigoBusca(e.target.value)}
                  placeholder="Digite o nome do usuário..."
                  className="flex-1 rounded-xl border border-gray-200 py-2 px-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
                <button
                  type="button"
                  onClick={handleEnviarPedidoAmizade}
                  className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-2 transition-colors"
                >
                  Enviar
                </button>
              </div>
            )}
          </div>

          {/* Lista de contatos */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
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

                  {contato.foto_perfil ? (
                    <img
                      src={contato.foto_perfil}
                      alt={contato.nome_usuario}
                      className="h-12 w-12 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <FaUserCircle className="text-4xl text-gray-300 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-gray-800 truncate">
                        {contato.nome_usuario}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">
                        {contato.hora || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 truncate">
                        {contato.ultimaMensagem || "Iniciar conversa"}
                      </span>
                      {contato.naoLidas && contato.naoLidas > 0 && (
                        <span className="ml-2 shrink-0 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {contato.naoLidas}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Rodapé sidebar: perfil (abre configurações) + Sair */}
          <div className="p-4 border-t border-gray-200 flex justify-between items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setAbaConfig("perfil");
                setModalConfigAberto(true);
                // Cria uma entrada extra no histórico: assim o botão "voltar"
                // do celular fecha o modal em vez de sair da página
                window.history.pushState({ modalAberto: true }, "");
              }}
              className="flex items-center gap-2 text-left"
              title="Abrir configurações"
            >
              {usuario?.foto_perfil || fotoPreview ? (
                <img
                  src={fotoPreview || usuario?.foto_perfil}
                  alt="Foto de perfil"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="text-2xl text-gray-300" />
              )}
              <span className="text-sm font-medium text-gray-600">
                {usuario?.nome_usuario || "Minha conta"}
              </span>
            </button>
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

           {contatoSelecionado?.foto_perfil ? (
              <img
                src={contatoSelecionado.foto_perfil}
                alt={contatoSelecionado.nome_usuario}
                className="h-10 w-10 rounded-full object-cover shrink-0 border border-gray-200"
              />
            ) : (
              <FaUserCircle className="text-3xl text-gray-300 shrink-0" />
            )}

              <span className="font-semibold text-gray-800 truncate">
                {contatoSelecionado?.nome_usuario || "Selecione uma conversa"}
              </span>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {contatoSelecionado && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpcoesAberto((v) => !v)}
                    className="text-gray-400 hover:text-orange-500 transition-colors text-lg p-1"
                    title="Opções"
                  >
                    <FaEllipsisV />
                  </button>

                  {menuOpcoesAberto && (
                    <>
                      {/* Fundo invisível para fechar o menu ao clicar fora */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpcoesAberto(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-20">
                        <button
                          type="button"
                          onClick={() => handleRemoverAmizade(contatoSelecionado)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Remover amizade
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBloquearUsuario(contatoSelecionado)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Bloquear usuário
                        </button>
                        {usuario?.cargo === "admin" && (
                          <button
                            type="button"
                            onClick={() => handleExcluirUsuario(contatoSelecionado)}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                          >
                            Excluir usuário
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              <img src={logo} alt="Logo" className="h-10 hidden sm:block" />
            </div>
          </div>

          {/* Mensagens */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-2 bg-[#f7f7f8]"
          >
            {!contatoSelecionado ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-center text-sm text-gray-400">
                  Comece a conversar
                </p>
              </div>
            ) : (
              <>
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
                      onDoubleClick={() =>
                        setMensagemSelecionada(
                          mensagemSelecionada === msg.cod_mensagem
                            ? null
                            : msg.cod_mensagem
                        )
                      }
                      className={`relative max-w-[85%] md:max-w-[60%] rounded-xl px-4 py-2 shadow-sm cursor-pointer transition-all ${
                        msg.cod_remetente === usuario.id
                          ? "bg-orange-500 text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none"
                      } ${
                        mensagemSelecionada === msg.cod_mensagem
                          ? "ring-2 ring-orange-300"
                          : ""
                      }`}
                    >

                      {/* Botão de excluir */}
                      {mensagemSelecionada === msg.cod_mensagem &&
                        msg.cod_remetente === usuario.id && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExcluirMensagem(msg.cod_mensagem);
                            }}
                            className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-colors"
                            title="Excluir mensagem"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        )}

                      {/* Texto da mensagem */}
                      {msg.mensagem && (
                        <p className="text-sm">
                          {msg.mensagem}
                        </p>
                      )}

                      {/* Anexo */}
                      {msg.arquivo_url && (
                        <div className={msg.mensagem ? "mt-2" : ""}>

                          {/* Imagem */}
                            {msg.tipo_arquivo?.startsWith("image/") ? (
                              <a
                                href={msg.arquivo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <img
                                  src={msg.arquivo_url}
                                  alt={msg.nome_arquivo}
                                  className="max-w-full max-h-60 rounded-lg object-contain cursor-pointer"
                                />
                              </a>
                            ) : (

                            /* Outros arquivos */
                            <a
                              href={msg.arquivo_url}
                              download={msg.nome_arquivo}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 underline"
                            >
                              <FaPaperclip />

                              <span className="text-sm truncate">
                                {msg.nome_arquivo}
                              </span>

                              <span className="text-xs opacity-70">
                                Baixar
                              </span>

                            </a>
                          )}

                        </div>
                      )}

                      {/* Horário */}
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
                          timeZone: "America/Sao_Paulo",
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
              </>
            )}
          </div>



          {/* Campo de digitar */}
          <form
            onSubmit={handleEnviarMensagem}
            className="relative shrink-0 border-t border-gray-200 bg-white px-4 py-3 flex items-center gap-3"
          >
            <label
              htmlFor="input-arquivo"
              className={`text-gray-400 hover:text-orange-500 transition-colors text-xl cursor-pointer ${
                !contatoSelecionado ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Anexar arquivo"
            >
              <FaPaperclip />

              <input
                id="input-arquivo"
                type="file"
                className="hidden"
                disabled={!contatoSelecionado}
                onChange={(e) => {
                  const arquivo = e.target.files[0];

                  if (!arquivo) return;

                  setErroArquivo("");

                  // Limite de 10 MB
                  if (arquivo.size > 10 * 1024 * 1024) {
                    setErroArquivo("O arquivo não pode ultrapassar 10 MB.");
                    e.target.value = "";
                    setArquivoSelecionado(null);
                    return;
                  }

                  setArquivoSelecionado(arquivo);
                }}
              />
            </label>


            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={contatoSelecionado ? "Digite uma mensagem..." : "Selecione uma conversa..."}
              disabled={!contatoSelecionado}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 px-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />

            <button
              type="submit"
              disabled={enviandoMensagem}
              className={`rounded-xl text-white h-10 w-10 flex items-center justify-center transition-colors ${
                enviandoMensagem
                  ? "bg-orange-300 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
              title={enviandoMensagem ? "Enviando..." : "Enviar"}
            >
              {enviandoMensagem ? (
                <span className="text-sm">...</span>
              ) : (
                <FaPaperPlane className="text-sm" />
              )}
            </button>

             {/*Mostra o Arquivo Selecionado para envio*/}     
             {arquivoSelecionado && (
              <div className="absolute bottom-16 left-4 bg-gray-100 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                <FaPaperclip className="text-orange-500" />

                <span className="max-w-50 truncate">
                  {arquivoSelecionado.name}
                </span>

                <button
                  type="button"
                  onClick={() => {
                  setArquivoSelecionado(null);
                  setErroArquivo("");
                }}
                  className="text-gray-400 hover:text-red-500"
                  title="Remover anexo"
                >
                  ×
                </button>
              </div>
            )}

            {/*Mostra erro do arquivo exceder o limite máximo*/} 
            {erroArquivo && (
              <div className="absolute bottom-16 left-4 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                {erroArquivo}
              </div>
            )}

          </form>
        </section>
      </div>



      {/* ---------------- MODAL DE CONFIGURAÇÕES ---------------- */}
      {modalConfigAberto && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => window.history.back()}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800 text-lg">Configurações</h2>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                <FaTimes />
              </button>
            </div>

            {/* Abas */}
            <div className="flex border-b border-gray-200">
              {[
                { id: "perfil", label: "Perfil" },
                { id: "bloqueados", label: "Bloqueados" },
                { id: "amizades", label: "Amizades" },
              ].map((aba) => (
                <button
                  key={aba.id}
                  type="button"
                  onClick={() => setAbaConfig(aba.id)}
                  className={`flex-1 flex items-center justify-center py-3 text-sm font-medium transition-colors ${
                    abaConfig === aba.id
                      ? "text-orange-500 border-b-2 border-orange-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className="flex items-center justfity-center gap-2"> 
                  {aba.label}
                    
                  {/*Contador de pedidos de amizade*/}
                  {aba.id === "amizades" && pedidosAmizade.length > 0 &&(
                    <span className="flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold">
                      {pedidosAmizade.length}
                    </span>
                  )}
                  </span>
                </button>
              ))}
            </div>
            

            <div className="p-6">
              {/* -------- Aba Perfil -------- */}
              {abaConfig === "perfil" && (
                <form onSubmit={handleSalvarPerfil} className="space-y-5">
                  <div className="flex flex-col items-center gap-2">
                    <label className="cursor-pointer relative">
                      {fotoPreview ? (
                        <img
                          src={fotoPreview}
                          alt="Foto de perfil"
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="h-24 w-24 text-gray-300" />
                      )}
                      <span className="absolute bottom-0 right-0 bg-orange-500 text-white text-xs rounded-full h-7 w-7 flex items-center justify-center">
                        <FaCamera />
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSelecionarFoto}
                      />
                    </label>
                    <span className="text-xs text-gray-400">
                      Clique na foto para trocar
                    </span>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      Nome de usuário
                    </label>
                    <input
                      type="text"
                      value={novoNomeUsuario}
                      onChange={(e) => setNovoNomeUsuario(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 py-2.5 px-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      Nova senha
                    </label>
                   <div className="relative"> 
                    <input
                      type={mostrarNovaSenha ? "text" : "password"}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Deixe em branco para não alterar"
                      className="w-full rounded-xl border border-gray-200 py-2.5 px-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />

                    <button
                      type="button"
                      onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                    >
                      {mostrarNovaSenha ? <FaEyeSlash/> : <FaEye />}
                    </button>
                  </div>
                 </div>

                  {novaSenha && (
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">
                        Confirmar nova senha
                      </label>

                      <div className="relative">
                        <input
                          type={mostrarConfirmarSenha ? "text" : "password"}
                          value={confirmarSenha}
                          onChange={(e) => setConfirmarSenha(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 py-2.5 px-4 pr-12 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />

                        <button
                          type="button"
                          onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                        >
                          {mostrarConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={salvandoAlteracoes}
                    className={`w-full rounded-xl py-2.5 text-white font-semibold transition-colors ${
                      salvandoAlteracoes
                        ? "bg-orange-300 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                  >
                    {salvandoAlteracoes ? "Carregando..." : "Salvar alterações"}
                  </button>
                </form>
              )}

              {/* -------- Aba Bloqueados -------- */}
              {abaConfig === "bloqueados" && (
                <div className="space-y-2">
                  {usuariosBloqueados.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">
                      Nenhum usuário bloqueado.
                    </p>
                  )}
                  {usuariosBloqueados.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3">

                      {contatoSelecionado?.foto_perfil ?(
                        <img
                          src={contatoSelecionado.foto_perfil}
                          alt={contatoSelecionado.nome_usuario}
                          className="h-10 w-10 rounded-full object-cover shrink-0"
                          />
                      ) : (
                        <FaUserCircle className="text-3xl text-gray-300" />
                        )}
                        <span className="font-medium text-gray-700">
                          {u.nome_usuario}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDesbloquearUsuario(u)}
                        className="text-sm text-orange-500 hover:underline"
                      >
                        Desbloquear
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* -------- Aba Amizades (solicitações pendentes) -------- */}
              {abaConfig === "amizades" && (
                <div className="space-y-4">

                  {pedidosAmizade.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                      Nenhuma solicitação de amizade pendente.
                    </p>
                  ) : (
                    pedidosAmizade.map((pedido) => (
                      <div
                        key={pedido.id}
                        className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3"
                      >

                        {/* Foto */}
                        {pedido.usuarios?.foto_perfil ? (
                          <img
                            src={pedido.usuarios.foto_perfil}
                            alt={pedido.usuarios.nome_usuario}
                            className="h-12 w-12 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <FaUserCircle className="text-4xl text-gray-300 shrink-0" />
                        )}

                        {/* Informações */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-700 truncate">
                            {pedido.usuarios?.nome_usuario || "Usuário"}
                          </p>

                          <p className="text-xs text-gray-400">
                            Enviou uma solicitação de amizade
                          </p>

                          {/* Botões */}
                          <div className="flex gap-2 mt-2">

                            <button
                              type="button"
                              onClick={() => handleAceitarAmizade(pedido.id)}
                              className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 transition-colors"
                            >
                              Aceitar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRecusarAmizade(pedido.id)}
                              className="rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 transition-colors"
                            >
                              Recusar
                            </button>

                          </div>
                        </div>

                      </div>
                    ))
                  )}

                </div>
              )}


            </div>
          </div>
        </div>
      )}

      {/* ---------------- TOAST ---------------- */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
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
