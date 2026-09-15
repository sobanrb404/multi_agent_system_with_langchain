import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Search,
  BookOpen,
  PenTool,
  CheckCircle2,
  Loader2,
  Sparkles,
  Download,
} from "lucide-react";

// Metadata for the 4 pipeline steps
const stepsMeta = [
  { id: 1, key: "search", label: "Web Exploration", icon: Search },
  { id: 2, key: "reader", label: "Deep Extraction", icon: BookOpen },
  { id: 3, key: "writer", label: "Report Drafting", icon: PenTool },
  { id: 4, key: "critic", label: "Quality Audit", icon: CheckCircle2 },
];

export default function App() {
  const [topic, setTopic] = useState("");
  const [steps, setSteps] = useState({});
  const [report, setReport] = useState("");
  const [critique, setCritique] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const hasStarted = isGenerating || Object.keys(steps).length > 0;

  // ── SSE Live-Stream Listener ───────────────────────────────────────
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setSteps({});
    setReport("");
    setCritique("");

    try {
     const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
     const response = await fetch(`${API_URL}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop(); // Keep unfinished chunk in buffer

        for (const part of parts) {
          const trimmed = part.trim();
          if (trimmed.startsWith("data: ")) {
            const data = JSON.parse(trimmed.replace("data: ", ""));

            setSteps((prev) => ({
              ...prev,
              [data.agent]: { status: data.status, message: data.message },
            }));

            if (data.report) setReport(data.report);
            if (data.critique) setCritique(data.critique);
          }
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research_${topic.toLowerCase().replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-zinc-900 antialiased">
      {/* Top Navbar */}
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-semibold text-sm tracking-tight">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            ResearchMind
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 font-medium">
            Multi-Agent Architecture
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Hero & Query Bar */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950">
            Autonomous Research Synthesis
          </h1>
          <p className="text-zinc-500 text-sm">
            Watch specialized agents search, extract, synthesize, and audit reports in real time.
          </p>

          <form onSubmit={handleGenerate} className="mt-6 flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Advancements in Solid State Batteries 2026"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 bg-white border border-zinc-300 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
            />
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate
            </button>
          </form>
        </div>

        {/* Split View: Manus Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Real-Time Agent Timeline */}
          <div className="md:col-span-4 bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
            <h2 className={`text-xs uppercase tracking-wider transition-colors duration-300 ${
    hasStarted ? "font-bold text-zinc-900" : "font-semibold text-zinc-400"
  }`}>
              Live Agent Activity
            </h2>

            <div className="space-y-2.5">
              {stepsMeta.map(({ id, key, label, icon: Icon }) => {
                const current = steps[key];
                const isRunning = current?.status === "running";
                const isDone = current?.status === "done";

                return (
                  <div
                    key={id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                      isRunning
                        ? "bg-blue-50/50 border-blue-200 shadow-sm"
                        : isDone
                        ? "bg-zinc-50/60 border-zinc-200"
                        : "border-transparent opacity-40"
                    }`}
                  >
                    <div className="mt-0.5">
                      {isRunning ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <Icon
                          className={`w-4 h-4 ${
                            isDone ? "text-zinc-900" : "text-zinc-400"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-zinc-900">
                        {label}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {current?.message || "Waiting to trigger..."}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Generated Report & Audit */}
          <div className="md:col-span-8 space-y-6">
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[420px]">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
                <span className={`text-xs uppercase tracking-wider transition-colors duration-300 ${
    hasStarted ? "font-bold text-zinc-900" : "font-semibold text-zinc-400"
  }`}>
                  Synthesized Report
                </span>
                {report && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download (.md)
                  </button>
                )}
              </div>

              {report ? (
                <div className="prose prose-zinc prose-sm max-w-none leading-relaxed">
                  <ReactMarkdown
  components={{
    h1: ({ node, ...props }) => (
      <h1
        className="text-2xl font-bold tracking-tight text-zinc-950 mt-8 mb-3 pb-2 border-b border-zinc-200 first:mt-0"
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h2
        className="text-lg font-semibold tracking-tight text-zinc-900 mt-6 mb-2.5 pb-1 border-b border-zinc-100"
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3
        className="text-sm font-semibold text-zinc-900 mt-4 mb-1.5"
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <p
        className="text-sm text-zinc-700 leading-relaxed mb-4"
        {...props}
      />
    ),
    ul: ({ node, ...props }) => (
      <ul
        className="list-disc pl-5 mb-4 space-y-1.5 text-sm text-zinc-700"
        {...props}
      />
    ),
    ol: ({ node, ...props }) => (
      <ol
        className="list-decimal pl-5 mb-4 space-y-1.5 text-sm text-zinc-700"
        {...props}
      />
    ),
    li: ({ node, ...props }) => (
      <li className="pl-1 leading-relaxed" {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-semibold text-zinc-950" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-2 border-zinc-300 pl-4 my-4 italic text-zinc-600 text-sm"
        {...props}
      />
    ),
    a: ({ node, ...props }) => (
      <a
        className="text-blue-600 hover:text-blue-800 underline underline-offset-2 break-all text-xs"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
  }}
>
  {report}
</ReactMarkdown>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-400">
                  <Sparkles className="w-8 h-8 mb-3 stroke-[1.5] text-zinc-300" />
                  <p className="text-sm font-medium text-zinc-500">
                    No report generated yet
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Enter a topic above to watch the agents collaborate in real-time.
                  </p>
                </div>
              )}
            </div>

            {/* Quality Audit Section */}
            {critique && (
  <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2">
    <h3 className={`text-xs uppercase tracking-wider transition-colors duration-300 ${
    hasStarted ? "font-bold text-zinc-900" : "font-semibold text-zinc-400"
  }`}>
      Quality Assurance Evaluation
    </h3>
    <div className="text-zinc-700 text-xs leading-relaxed">
      <ReactMarkdown
        components={{
          strong: ({ node, ...props }) => <strong className="font-semibold text-zinc-950" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1 text-xs" {...props} />,
          p: ({ node, ...props }) => <p className="mb-2" {...props} />
        }}
      >
        {critique}
      </ReactMarkdown>
    </div>
  </div>
)}
          </div>
        </div>
      </main>
    </div>
  );
}