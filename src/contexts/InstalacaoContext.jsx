import { createContext, useContext, useEffect, useState } from "react";

const InstalacaoContext = createContext(null);

// Captura o evento "beforeinstallprompt" assim que o app carrega,
// independente de qual tela (login, cadastro, home) está montada
// no momento em que o navegador dispara o evento. O evento só é
// disparado uma vez por carregamento de página, então esse listener
// precisa existir desde o início — por isso fica aqui no topo do app,
// e não dentro da tela Home.
export function InstalacaoProvider({ children }) {
  const [eventoInstalacao, setEventoInstalacao] = useState(null);

  useEffect(() => {
    const capturarEventoInstalacao = (e) => {
      e.preventDefault();
      setEventoInstalacao(e);
    };

    window.addEventListener("beforeinstallprompt", capturarEventoInstalacao);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        capturarEventoInstalacao
      );
    };
  }, []);

  const instalarApp = async () => {
    if (!eventoInstalacao) return;

    eventoInstalacao.prompt();

    const resultado = await eventoInstalacao.userChoice;

    if (resultado.outcome === "accepted") {
      console.log("Chatames instalado!");
    }

    setEventoInstalacao(null);
  };

  return (
    <InstalacaoContext.Provider value={{ eventoInstalacao, instalarApp }}>
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
