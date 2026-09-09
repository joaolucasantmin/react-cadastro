import { useEffect, useState } from "react";

export default function BotaoInstalar() {
    const [eventoInstalacao, setEventoInstalacao] = useState(null);

    useEffect(() => {
        const capturarEvento = (e) => {
            e.preventDefault();
            setEventoInstalacao(e);
        };

        window.addEventListener("beforeinstallprompt", capturarEvento);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                capturarEvento
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

    // Se o navegador não permitir instalação, não mostra o botão
    if (!eventoInstalacao) return null;

    return (
        <button
            onClick={instalarApp}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition"
        >
            📱 Instalar Chatames
        </button>
    );
}