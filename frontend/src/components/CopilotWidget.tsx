import { useState } from "react";

interface CopilotResponse {
  answer: string;
  uncertainty: string;
  tools_used?: string[];
  provenance?: { source: string; model_version: string };
}

export function CopilotWidget() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<CopilotResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askCopilot = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      // In production, we'd use an env var for the API URL
      const apiUrl = "";
      const res = await fetch(`${apiUrl}/api/v1/copilot/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) {
        if (res.status === 404) {
           throw new Error("Copilot backend endpoint not found. Please sync your Hugging Face Space with the latest main branch.");
        }
        throw new Error("Failed to get answer");
      }
      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || "Insufficient verified data for this conclusion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6 bg-white rounded-2xl shadow-sm border border-[#E2E6EB] overflow-hidden">
      <div className="bg-[#FAF7F1] px-6 py-5 border-b border-[#E2E6EB]">
        <h2 className="text-xl font-display font-bold text-[#0A2342]">KargoSetu Decision Copilot</h2>
        <p className="text-sm text-[#6B7D99] mt-1">Ask questions about forecasts, vessel feasibility, and risk.</p>
      </div>
      <div className="p-6">
        <div className="flex space-x-3">
          <input
            className="flex-1 rounded-xl border-[#E2E6EB] shadow-sm focus:border-[#D95D0F] focus:ring focus:ring-[#D95D0F]/20 text-[15px] p-3 border transition-all text-[#0A2342] font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about forecast, vessel feasibility, or risks..."
            onKeyDown={(e) => e.key === "Enter" && askCopilot()}
          />
          <button 
            onClick={askCopilot} 
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-[#0A2342] px-6 py-3 text-[15px] font-bold text-white hover:bg-[#14315C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_3px_0_#051528]"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>
        {error && (
          <div className="mt-5 p-4 text-[#C5221F] bg-[#FCE8E6] rounded-xl border border-[#FAD2CF] font-medium text-[14px]">
            {error}
          </div>
        )}
        {response && !error && (
          <div className="mt-5 p-5 border border-[#E2E6EB] rounded-xl bg-[#FAF7F1]">
            <p className="font-semibold text-[15px] text-[#0A2342] mb-3 leading-relaxed">{response.answer}</p>
            <div className="mt-4 pt-4 border-t border-black/5 text-[13px] text-[#3D4F68] flex flex-col space-y-1.5 font-mono">
              <p>
                <span className="opacity-70 uppercase tracking-widest text-[10px]">Uncertainty:</span> {response.uncertainty}
              </p>
              <p>
                <span className="opacity-70 uppercase tracking-widest text-[10px]">Tools Utilized:</span>{" "}
                {response.tools_used?.join(", ")}
              </p>
              <p>
                <span className="opacity-70 uppercase tracking-widest text-[10px]">Provenance:</span> {response.provenance?.source} (
                {response.provenance?.model_version})
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
