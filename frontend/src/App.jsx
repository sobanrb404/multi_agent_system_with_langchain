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
  FileText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  SearchCheck,
  MicroscopeIcon,
  LucideMicroscope,
} from "lucide-react";

// Metadata for the 4 pipeline steps
const stepsMeta = [
  { id: 1, key: "search", label: "Web Exploration", icon: Search },
  { id: 2, key: "reader", label: "Deep Extraction", icon: BookOpen },
  { id: 3, key: "writer", label: "Report Drafting", icon: PenTool },
  { id: 4, key: "critic", label: "Quality Audit", icon: CheckCircle2 },
];

const samplePrompts = [
  "Solid-State Battery Electrolytes",
  "Post-Quantum Cryptography",
  "CRISPR in Genetic Therapies",
  "Neuromorphic Computing",
];

export default function App() {
  const [topic, setTopic] = useState("");
  const [steps, setSteps] = useState({});
  const [report, setReport] = useState("");
  const [critique, setCritique] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const hasStarted = isGenerating || Object.keys(steps).length > 0;
  const [activeTab, setActiveTab] = useState("report"); // "report" or "audit"
  const [currentPage, setCurrentPage] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false);

// Scaled for authentic tall A4 portrait sheet
const getReportPages = (text) => {
  if (!text) return [];

  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const pages = [];
  let currentPageParagraphs = [];
  let currentWordCount = 0;
  const WORDS_PER_PAGE = 320; // Fills an authentic tall A4 sheet cleanly

  for (const p of paragraphs) {
    const wordCount = p.trim().split(/\s+/).length;

    if (currentWordCount + wordCount > WORDS_PER_PAGE && currentPageParagraphs.length > 0) {
      pages.push(currentPageParagraphs.join("\n\n"));
      currentPageParagraphs = [p];
      currentWordCount = wordCount;
    } else {
      currentPageParagraphs.push(p);
      currentWordCount += wordCount;
    }
  }

  if (currentPageParagraphs.length > 0) {
    pages.push(currentPageParagraphs.join("\n\n"));
  }

  return pages.length > 0 ? pages : [text];
};

const reportPages = getReportPages(report);
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
https://multi-agent-system-with-langchain.vercel.app
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

  // ── 1. Markdown File Downloader ─────────────────────────────────────
  const handleDownloadMd = () => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research_${topic.toLowerCase().replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── 2. PDF Printable Document Generator ──────────────────────────────
  const handleDownloadPdf = () => {
    const printContent = document.getElementById("full-report-print");
    if (!printContent) {
      console.error("Print container not found!");
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Research Report - ${topic}</title>
          <style>
            @page { size: A4 portrait; margin: 20mm 18mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; line-height: 1.7; margin: 0; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 28px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; font-weight: 600; }
            h1 { font-size: 24px; font-weight: 800; color: #020617; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-top: 24px; }
            h2 { font-size: 17px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-top: 24px; }
            h3 { font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 18px; }
            p { font-size: 12.5px; color: #334155; margin-bottom: 14px; text-align: justify; }
            ul, ol { padding-left: 22px; margin-bottom: 14px; }
            li { font-size: 12.5px; color: #334155; margin-bottom: 6px; }
            strong { font-weight: 700; color: #020617; }
            a { color: #4f46e5; text-decoration: underline; font-size: 11px; word-break: break-all; }
            .footer { margin-top: 36px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 9.5px; color: #94a3b8; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <span>ResearchMind Executive Briefing</span>
            <span>Verified Comprehensive Analysis</span>
          </div>
          ${printContent.innerHTML}
          <div class="footer">
            <span>Synthesized with Gemini 3.5 Flash</span>
            <span>Date: ${new Date().toLocaleDateString()}</span>
          </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 350);
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
<header className="border-b border-slate-200/80 bg-white/90 backdrop-blur sticky top-0 z-10">
  <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
    <div className="flex items-center gap-2.5 font-semibold text-sm tracking-tight text-slate-900">
      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)] animate-pulse"></span>
      ResearchMind
    </div>
  </div>
</header>
<main className="max-w-[1520px] mx-auto px-4 sm:px-8 py-8 space-y-8">  {/* Hero & Query Bar */}
  <div className="max-w-2xl mx-auto text-center space-y-3">
    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950">
      Autonomous Research Synthesis
    </h1>
    <p className="text-slate-500 text-sm">
      Watch specialized agents search, extract, synthesize, and audit reports in real time.
    </p>

    <form onSubmit={handleGenerate} className="mt-6 flex items-center gap-2">
      <input
  type="text"
  placeholder="e.g. Solid-State Battery Electrolytes"
  value={topic}
  onChange={(e) => setTopic(e.target.value)}
  className="flex-1 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-slate-800 placeholder:text-slate-400"
/>
      <button
  type="submit"
  disabled={isGenerating || !topic.trim()}
  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition flex items-center gap-2 cursor-pointer active:scale-[0.98]"
>
  {isGenerating ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : (
    <Sparkles  className="w-4 h-4" />
  )}
  Generate
</button>
    </form>

    {/* Quick Prompts */}
    <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
      <span className="text-xs text-slate-400 font-medium">Try:</span>
      {samplePrompts.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => setTopic(p)}
          className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 text-slate-600 transition shadow-sm cursor-pointer"
        >
          {p}
        </button>
      ))}
    </div>
  </div>

  {/* STRICTLY PARALLEL WORKSPACE: Pipeline (Left) & Report Workspace (Right) */}
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
   {/* LEFT: Compact Squeezed Agent Pipeline Card */}
<div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-3 sticky top-20">
  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
    <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
      Pipeline
    </h2>
    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
      {isGenerating ? "Running" : "Standby"}
    </span>
  </div>

  <div className="space-y-2">
    {stepsMeta.map(({ id, key, label, icon: Icon }) => {
      const current = steps[key];
      const isRunning = current?.status === "running";
      const isDone = current?.status === "done";

      return (
        <div
          key={id}
          className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all ${
            isRunning
              ? "bg-indigo-50/70 border-indigo-300 shadow-sm ring-1 ring-indigo-200"
              : isDone
              ? "bg-emerald-50/40 border-emerald-200"
              : "bg-slate-50/60 border-slate-200/80"
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            ) : isDone ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Icon className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className={`text-xs font-bold truncate ${
                isRunning
                  ? "text-indigo-950"
                  : isDone
                  ? "text-emerald-950"
                  : "text-slate-800"
              }`}
            >
              {label}
            </div>
            <div
              className={`text-[10px] truncate mt-0.5 ${
                isRunning
                  ? "text-indigo-600 font-medium"
                  : isDone
                  ? "text-emerald-600 font-medium"
                  : "text-slate-400"
              }`}
            >
              {current?.message || "Awaiting task..."}
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>

    {/* RIGHT: A4 Workspace */}
<div className="lg:col-span-9 space-y-4">
      {/* Tab Navigation Header (Parallel to left card top) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("report")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "report"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            Research Document
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "audit"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Quality Audit
            {critique && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>
        </div>

        {report && activeTab === "report" && (
  <div className="relative">
    {/* Main Indigo Menu Trigger Button */}
    <button
      onClick={() => setShowExportMenu(!showExportMenu)}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer active:scale-[0.98]"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Export</span>
      <ChevronDown
        className={`w-3.5 h-3.5 transition-transform duration-200 ${
          showExportMenu ? "rotate-180" : ""
        }`}
      />
    </button>

    {/* Backdrop to close menu when clicking anywhere outside */}
    {showExportMenu && (
      <div
        className="fixed inset-0 z-20"
        onClick={() => setShowExportMenu(false)}
      />
    )}

    {/* Floating Dropdown Card */}
    {showExportMenu && (
      <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Select Format
        </div>

        {/* Option 1: PDF */}
        <button
          onClick={() => {
            setShowExportMenu(false);
            handleDownloadPdf();
          }}
          className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-indigo-50/70 group transition text-left cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition text-indigo-600 mt-0.5">
            <Download className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-950">
              PDF Document
            </div>
            <div className="text-[11px] text-slate-400 group-hover:text-indigo-600">
              Executive A4 Printable
            </div>
          </div>
        </button>

        {/* Option 2: Markdown */}
        <button
          onClick={() => {
            setShowExportMenu(false);
            handleDownloadMd();
          }}
          className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 group transition text-left cursor-pointer mt-0.5"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-slate-800 group-hover:text-white transition text-slate-600 mt-0.5">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-800 group-hover:text-slate-950">
              Markdown File
            </div>
            <div className="text-[11px] text-slate-400">
              Raw plain-text (.md)
            </div>
          </div>
        </button>
      </div>
    )}
  </div>
)}
      </div>

     {/* TAB 1: FULL EXECUTIVE A4 SHEET */}
{activeTab === "report" && (
  <div>
    {report ? (
      <div className="space-y-5">
        {/* Large Grand A4 Paper Sheet */}
        <div className="bg-white border border-slate-200/90 rounded-sm shadow-[0_15px_45px_rgba(0,0,0,0.08)] min-h-[980px] p-12 md:p-18 w-full flex flex-col justify-between">
          <div>
            {/* Running Header on Paper */}
            <div className="flex items-center justify-between pb-4 mb-10 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-widest font-semibold">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                ResearchMind Executive Briefing
              </span>
              <span>Verified Comprehensive Report</span>
            </div>

            {/* Scaled-up Executive Typography */}
            <div className="prose prose-slate prose-base max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 mb-6 pb-3 border-b border-slate-200" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-8 mb-4 pb-1.5 border-b border-slate-100" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-base font-bold text-slate-900 mt-5 mb-2" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-base text-slate-700 leading-relaxed mb-5" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 mb-5 space-y-3 text-base text-slate-700" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="pl-1.5 leading-relaxed" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-slate-950" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2 break-all text-sm" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                }}
              >
                {reportPages[currentPage] || report}
              </ReactMarkdown>
            </div>
          </div>

          {/* Running Footer on Paper */}
          <div className="pt-6 mt-10 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Synthesized with Gemini 3.5 Flash</span>
            <span className="font-semibold text-slate-700 bg-slate-100/80 px-3 py-1 rounded-md border border-slate-200">
              Page {currentPage + 1} of {reportPages.length}
            </span>
          </div>
        </div>

        {/* Bottom Horizontal Page Controls */}
        {reportPages.length > 1 && (
          <div className="flex items-center justify-between px-2 pt-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 transition shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Page
            </button>

            <div className="flex items-center gap-2">
              {reportPages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    currentPage === idx
                      ? "w-8 bg-indigo-600 shadow-sm shadow-indigo-200"
                      : "w-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(reportPages.length - 1, p + 1))}
              disabled={currentPage === reportPages.length - 1}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 transition shadow-sm cursor-pointer"
            >
              Next Page
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    ) : (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)] h-[550px] flex flex-col items-center justify-center text-center text-slate-400">
        <Sparkles className="w-8 h-8 mb-3 stroke-[1.5] text-slate-300" />
        <p className="text-sm font-medium text-slate-600">No report generated yet</p>
        <p className="text-xs text-slate-400 mt-1">
          Select a sample prompt above or enter a research query.
        </p>
      </div>
    )}
  </div>
)}

      {/* TAB 2: AUDIT VIEW */}
      {activeTab === "audit" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)] min-h-[500px]">
          {critique ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold tracking-tight text-slate-900">
                    Independent Quality Audit
                  </h3>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Peer Reviewed
                </span>
              </div>

              <div className="text-slate-700 text-sm leading-relaxed">
                <ReactMarkdown
                  components={{
                    h3: ({ node, children, ...props }) => {
                      const title = String(children);
                      const isScore = title.toLowerCase().includes("score");
                      const isStrengths = title.toLowerCase().includes("strength");
                      const isImprove = title.toLowerCase().includes("improve");

                      if (isScore) {
                        return (
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold text-sm my-4 shadow-sm">
                            <span className="text-xs font-semibold uppercase text-indigo-500">Evaluation:</span>
                            {children}
                          </div>
                        );
                      }

                      return (
                        <h4
                          className={`text-sm font-bold uppercase tracking-wider mt-6 mb-3 pb-1 border-b flex items-center gap-2 ${
                            isStrengths
                              ? "text-emerald-900 border-emerald-100"
                              : isImprove
                              ? "text-amber-900 border-amber-100"
                              : "text-slate-900 border-slate-100"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isStrengths
                                ? "bg-emerald-500"
                                : isImprove
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            }`}
                          ></span>
                          {children}
                        </h4>
                      );
                    },
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-5 my-3 space-y-2.5 text-sm text-slate-700" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-5 my-3 space-y-2.5 text-sm text-slate-700" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="pl-1.5 leading-relaxed" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-3 text-sm leading-relaxed text-slate-700" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-semibold text-slate-950" {...props} />
                    ),
                  }}
                >
                  {critique
                    .replace(/(Score:\s*[\d\.]+\s*\/\s*\d+)/gi, "\n### $1\n")
                    .replace(/(^|\n)(Strengths:?)/gi, "\n### Key Strengths\n")
                    .replace(/(^|\n)(Areas to Improve:?)/gi, "\n### Areas to Improve\n")
                    .replace(/(^|\n)(One line verdict:?|Verdict:?)/gi, "\n### Overall Verdict\n")}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-center text-slate-400">
              <ShieldCheck className="w-8 h-8 mb-3 stroke-[1.5] text-slate-300" />
              <p className="text-sm font-medium text-slate-600">Audit pending</p>
              <p className="text-xs text-slate-400 mt-1">
                The Reviewer Agent will audit the research once drafting completes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
  {/* Invisible container holding the full report for PDF generation */}
      <div id="full-report-print" style={{ display: "none" }}>
        <ReactMarkdown>{report}</ReactMarkdown>
      </div>

    </main>
  </div>
);
}