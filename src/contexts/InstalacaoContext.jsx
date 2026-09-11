import { createContext, useContext, useEffect, useState } from "react";

const InstalacaoContext = createContext(null);

// Verifica se o app já está rodando instalado (modo standalone), tanto no
// padrão usado pelo Chrome/Android quanto no específico do Safari/iOS.
const verificarSeJaInstalado = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

// Captura o evento "beforeinstallprompt" assim que o app carrega,
// independente de qual tela (login, cadastro, home) está montada
// no momento em que o navegador dispara o evento. O evento só é
// disparado uma vez por carregamento de página, então esse listener
// precisa existir desde o início — por isso fica aqui no topo do app,
// e não dentro da tela Home.
export function InstalacaoProvider({ children }) {
  const [eventoInstalacao, setEventoInstalacao] = useState(null);
  const [appInstalado, setAppInstalado] = useState(verificarSeJaInstalado);

  useEffect(() => {
    const capturarEventoInstalacao = (e) => {
      e.preventDefault();
      setEventoInstalacao(e);
    };

    // Disparado quando a instalação é concluída (tanto pelo nosso botão
    // quanto pelo menu nativo do navegador). Quando o app já está
    // instalado, o navegador não dispara mais o beforeinstallprompt —
    // por isso é esse evento (e a checagem de display-mode acima) que
    // nos diz que a instalação não está "indisponível", e sim já feita.
    const marcarComoInstalado = () => {
      setAppInstalado(true);
      setEventoInstalacao(null);
    };

    window.addEventListener("beforeinstallprompt", capturarEventoInstalacao);
    window.addEventListener("appinstalled", marcarComoInstalado);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        capturarEventoInstalacao
      );
      window.removeEventListener("appinstalled", marcarComoInstalado);
    };
  }, []);

  const instalarApp = async () => {
    if (!eventoInstalacao) return;

    eventoInstalacao.prompt();

    const resultado = await eventoInstalacao.userChoice;

    if (resultado.outcome === "accepted") {
      console.log("Chatames instalado!");
      setAppInstalado(true);
    }

    setEventoInstalacao(null);
  };

  return (
    <InstalacaoContext.Provider
      value={{ eventoInstalacao, instalarApp, appInstalado }}
    >
      {children}
    </InstalacaoContext.Provider>
  );
}

// Hook de conveniência pra qualquer tela consumir o evento capturado
export function useInstalacao() {
  const contexto = useContext(InstalacaoContext);

  if (!contexto) {
    throw new Error(
      "useInstalacao precisa ser usado dentro de um <InstalacaoProvider>"
    );
  }

  return contexto;
}
