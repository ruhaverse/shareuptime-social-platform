"use client";

import React, { useEffect, useState } from "react";
import { backendService } from "@/services/backendService";

export const HealthBadge: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading");

  const check = async () => {
    try {
      const ok = await backendService.healthCheck();
      setStatus(ok ? "ok" : "fail");
    } catch {
      setStatus("fail");
    }
  };

  useEffect(() => {
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  const color = status === "ok" ? "bg-green-500" : status === "fail" ? "bg-red-500" : "bg-gray-400";
  const label = status === "ok" ? "Backend OK" : status === "fail" ? "Backend Hata" : "Yoklanıyor";

  return (
    <div className="fixed bottom-20 right-4 md:bottom-4 md:right-4 z-50 pointer-events-none">
      <div className="flex items-center gap-2 rounded-full bg-white/80 text-[#044566] px-3 py-1 shadow-md backdrop-blur-sm border border-white/60">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-xs font-medium">{label}</span>
      </div>
    </div>
  );
};
