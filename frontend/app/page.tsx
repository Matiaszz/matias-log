"use client";

import { useEffect, useState } from "react";
import { Api } from "@/lib/api";
import { ApiResponse } from "@/types/api.types";

interface HealthCheckData {
  message: string;
}

export default function Home() {
  const [response, setResponse] = useState<ApiResponse<HealthCheckData> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchApiStatus = async () => {
    setLoading(true);
    const res = await Api.get<HealthCheckData>("/");
    setResponse(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchApiStatus();
  }, []);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-950 text-zinc-100 font-sans p-6">
      <main className="w-full max-w-xl flex flex-col gap-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${loading ? "bg-amber-400 animate-ping" : response?.success ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            <h1 className="text-xl font-bold tracking-tight text-white">API Health Check</h1>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
            GET /
          </span>
        </div>

        <p className="text-sm text-zinc-400">
          Endpoint: <code className="text-emerald-400 font-mono">https://api-bpb3enu4rq-uc.a.run.app/</code>
        </p>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 font-mono text-sm overflow-x-auto min-h-[160px] flex flex-col justify-center">
          {loading ? (
            <div className="flex items-center gap-2 text-zinc-400">
              <svg className="animate-spin h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Chamando Api.get(&quot;/&quot;)...
            </div>
          ) : (
            <pre className="text-emerald-300">
              {JSON.stringify(response, null, 2)}
            </pre>
          )}
        </div>

        <button
          onClick={fetchApiStatus}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] font-medium text-sm text-white transition-all shadow-lg shadow-emerald-950 disabled:opacity-50"
        >
          {loading ? "Requisitando..." : "Testar Requisição Novamente"}
        </button>
      </main>
    </div>
  );
}
