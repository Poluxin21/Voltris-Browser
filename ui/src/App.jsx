import { useState, useCallback, memo, useMemo } from "react";
const Tab = memo(({ tab, isActive, onClick, onClose }) => {
  const handleClose = useCallback(
    (e) => {
      e.stopPropagation();
      onClose(tab.id);
    },
    [tab.id, onClose],
  );

  return (
    <div
      onClick={() => onClick(tab.id)}
      className={`
        group flex items-center gap-2 px-4 py-2.5 rounded-t-lg cursor-pointer
        transition-all duration-150 min-w-[180px] max-w-[240px]
        ${
          isActive
            ? "bg-opera-bg text-white shadow-lg"
            : "bg-opera-surface2 text-gray-300 hover:bg-opera-hover"
        }
      `}
    >
      <span className="text-sm flex-shrink-0">
        {tab.loading ? (
          <span className="inline-block animate-spin">⟳</span>
        ) : (
          "🌐"
        )}
      </span>

      <span className="flex-1 text-sm truncate font-medium">{tab.title}</span>

      <button
        onClick={handleClose}
        className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center
                 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-white/10
                 transition-all text-lg"
        aria-label="Fechar aba"
      >
        ×
      </button>
    </div>
  );
});

Tab.displayName = "Tab";

function App() {
  const [tabs, setTabs] = useState([
    {
      id: 0,
      url: "https://www.google.com",
      title: "Google",
      history: ["https://www.google.com"],
      historyIndex: 0,
      loading: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(0);
  const [nextTabId, setNextTabId] = useState(1);
  const [urlInput, setUrlInput] = useState("https://www.google.com");

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId),
    [tabs, activeTabId],
  );

  useState(() => {
    if (activeTab) {
      setUrlInput(activeTab.url);
    }
  }, [activeTab?.url]);

  const sendToRust = useCallback((message) => {
    if (window.ipc) {
      window.ipc.postMessage(message);
    }
  }, []);

  const extractTitle = useCallback((url) => {
    try {
      const urlObj = new URL(url);
      let hostname = urlObj.hostname.replace("www.", "");
      return hostname.charAt(0).toUpperCase() + hostname.slice(1);
    } catch {
      return "Nova aba";
    }
  }, []);

  const normalizeUrl = useCallback((input) => {
    input = input.trim();

    if (input.startsWith("http://")) {
      return input;
    }

    if (!input.includes(".") || input.includes(" ")) {
      return "https://www.google.com/search?q=" + encodeURIComponent(input);
    }

    if (!input.startsWith("http://") && !input.startsWith("https://")) {
      input = "https://" + input;
    }

    return input;
  }, []);

  // Resolvido no Rust
  const createNewTab = useCallback(() => {
    const newTab = {
      id: nextTabId,
      url: "https://www.google.com",
      title: "Nova aba",
      history: ["https://www.google.com"],
      historyIndex: 0,
      loading: false,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId((prev) => prev + 1);
    setUrlInput("https://www.google.com");
    sendToRust("create:https://www.google.com");
  }, [nextTabId, sendToRust]);

  // TODO: FAZER APÓS SWITCH
  const closeTab = useCallback(
    (tabId) => {
      if (tabs.length === 1) return;

      setTabs((prev) => {
        const newTabs = prev.filter((tab) => tab.id !== tabId);

        if (tabId === activeTabId) {
          const tabIndex = prev.findIndex((tab) => tab.id === tabId);
          const newActiveIndex = Math.max(0, tabIndex - 1);
          const newActiveTab = newTabs[newActiveIndex];
          setActiveTabId(newActiveTab.id);
          setUrlInput(newActiveTab.url);
          sendToRust("navigate:" + tabId);
        }

        return newTabs;
      });
    },
    [tabs.length, activeTabId, sendToRust],
  );

  // TODO: EM IMPLEMENTAÇÃO
  const switchTab = useCallback(
    (tabId) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab) {
        setActiveTabId(tabId);
        setUrlInput(tab.url);
        sendToRust("navigate:" + tabId);
      }
    },
    [tabs, sendToRust],
  );

  // TODO: REMOVER/MELHORAR
  const navigate = useCallback(
    (e) => {
      e?.preventDefault();
      const normalizedUrl = normalizeUrl(urlInput);

      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id !== activeTabId) return tab;

          const newHistory = tab.history.slice(0, tab.historyIndex + 1);
          return {
            ...tab,
            url: normalizedUrl,
            title: extractTitle(normalizedUrl),
            history: [...newHistory, normalizedUrl],
            historyIndex: newHistory.length,
            loading: true,
          };
        }),
      );

      setUrlInput(normalizedUrl);
      sendToRust("navigate:" + normalizedUrl);
    },
    [urlInput, activeTabId, normalizeUrl, extractTitle, sendToRust],
  );

  const goBack = useCallback(() => {
    if (!activeTab || activeTab.historyIndex <= 0) return;

    const newIndex = activeTab.historyIndex - 1;
    const newUrl = activeTab.history[newIndex];

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, url: newUrl, historyIndex: newIndex, loading: true }
          : tab,
      ),
    );

    setUrlInput(newUrl);
    sendToRust("navigate:" + newUrl);
  }, [activeTab, activeTabId, sendToRust]);

  const goForward = useCallback(() => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1)
      return;

    const newIndex = activeTab.historyIndex + 1;
    const newUrl = activeTab.history[newIndex];

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, url: newUrl, historyIndex: newIndex, loading: true }
          : tab,
      ),
    );

    setUrlInput(newUrl);
    sendToRust("navigate:" + newUrl);
  }, [activeTab, activeTabId, sendToRust]);

  const reload = useCallback(() => {
    if (!activeTab) return;

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId ? { ...tab, loading: true } : tab,
      ),
    );

    sendToRust("navigate:" + activeTab.url);
  }, [activeTab, activeTabId, sendToRust]);

  const canGoBack = activeTab && activeTab.historyIndex > 0;
  const canGoForward =
    activeTab && activeTab.historyIndex < activeTab.history.length - 1;

  return (
    <div className="h-screen flex flex-col bg-opera-bg text-white select-none">
      <div className="flex items-center bg-opera-surface px-2 pt-2 gap-0.5 border-b border-opera-bg">
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onClick={switchTab}
              onClose={closeTab}
            />
          ))}
        </div>

        <button
          onClick={createNewTab}
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
                   hover:bg-white/10 transition-colors text-xl font-light"
          aria-label="Nova aba"
        >
          +
        </button>
      </div>

      <div className="flex items-center gap-2 p-3 bg-opera-bg border-b border-opera-surface">
        <div className="flex items-center gap-1">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className="w-9 h-9 rounded-lg flex items-center justify-center
                     transition-all text-lg font-bold
                     disabled:opacity-30 disabled:cursor-not-allowed
                     enabled:hover:bg-white/10 enabled:active:scale-95"
            aria-label="Voltar"
          >
            ←
          </button>

          <button
            onClick={goForward}
            disabled={!canGoForward}
            className="w-9 h-9 rounded-lg flex items-center justify-center
                     transition-all text-lg font-bold
                     disabled:opacity-30 disabled:cursor-not-allowed
                     enabled:hover:bg-white/10 enabled:active:scale-95"
            aria-label="Avançar"
          >
            →
          </button>

          <button
            onClick={reload}
            className="w-9 h-9 rounded-lg flex items-center justify-center
                     hover:bg-white/10 active:scale-95 transition-all text-lg"
            aria-label="Recarregar"
          >
            ⟳
          </button>
        </div>

        <form onSubmit={navigate} className="flex-1 flex items-center gap-2">
          <div
            className="flex-1 flex items-center bg-opera-surface rounded-xl px-4 h-10
                        transition-all focus-within:bg-opera-surface2
                        focus-within:ring-2 focus-within:ring-opera-primary/40
                        hover:bg-opera-surface2/50"
          >
            <span className="text-gray-400 mr-2 text-sm">🔒</span>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Pesquise ou digite um endereço"
              className="flex-1 bg-transparent outline-none text-sm text-white
                       placeholder-gray-500"
            />
          </div>
        </form>

        <div className="min-w-[80px] text-center">
          {activeTab?.loading ? (
            <span className="text-xs text-blue-400 flex items-center justify-center gap-1.5 font-medium">
              <span className="inline-block animate-spin">⟳</span>
              <span>Carregando</span>
            </span>
          ) : (
            <span className="text-xs text-green-400 font-medium">✓ Pronto</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
