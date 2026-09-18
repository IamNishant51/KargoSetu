import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/copilot/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) {
        throw new Error("Failed to get answer");
      }
      const data = await res.json();
      setResponse(data);
    } catch {
      setError("Insufficient verified data for this conclusion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-4">
      <CardHeader>
        <CardTitle>KargoSetu Decision Copilot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about forecast, vessel feasibility, or risks..."
            onKeyDown={(e) => e.key === "Enter" && askCopilot()}
          />
          <Button onClick={askCopilot} disabled={loading}>
            {loading ? "Thinking..." : "Ask"}
          </Button>
        </div>
        {error && (
          <div className="mt-4 p-4 text-red-600 bg-red-50 rounded border border-red-200">
            {error}
          </div>
        )}
        {response && !error && (
          <div className="mt-4 p-4 border rounded bg-blue-50/50">
            <p className="font-semibold text-sm mb-2">{response.answer}</p>
            <div className="mt-2 text-xs text-gray-500 flex flex-col space-y-1">
              <p>
                <strong>Uncertainty:</strong> {response.uncertainty}
              </p>
              <p>
                <strong>Tools utilized:</strong>{" "}
                {response.tools_used?.join(", ")}
              </p>
              <p>
                <strong>Provenance:</strong> {response.provenance?.source} (
                {response.provenance?.model_version})
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
