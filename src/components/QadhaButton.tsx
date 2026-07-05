"use client";

import { useState } from "react";
import { submitQadha } from "@/app/actions/qadha";
import { Loader2 } from "lucide-react";

export function QadhaButton({ ticketId }: { ticketId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    const result = await submitQadha(ticketId);
    if (!result.success) {
      alert("Gagal mengajukan Qadha: " + result.error);
      setIsLoading(false);
    }
    // If successful, the server action revalidates the path, so the UI will update and this component unmounts.
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors border border-slate-600 flex items-center gap-2"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {isLoading ? "Mengajukan..." : "Ajukan Qadha"}
    </button>
  );
}
