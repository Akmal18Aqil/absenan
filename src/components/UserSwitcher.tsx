"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function UserSwitcher({ users, currentNim }: { users: { nim: string, name: string }[], currentNim: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">Ganti Santri:</span>
      <select
        value={currentNim}
        onChange={(e) => router.push(`/mahasantri?nim=${e.target.value}`)}
        className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
      >
        {users.map((u) => (
          <option key={u.nim} value={u.nim}>
            {u.nim} - {u.name}
          </option>
        ))}
      </select>
    </div>
  );
}
