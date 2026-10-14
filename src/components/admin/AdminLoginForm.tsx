"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="glass-panel mx-auto flex max-w-sm flex-col gap-4 p-7">
      <h1 className="text-center text-lg font-extrabold">관리자 로그인</h1>
      <input
        type="password"
        name="password"
        required
        autoComplete="current-password"
        placeholder="비밀번호"
        aria-label="비밀번호"
        className="glass-input"
      />
      {state.error && (
        <p role="alert" className="text-sm text-rose-500">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="glass-button">
        {pending ? "확인 중…" : "로그인"}
      </button>
    </form>
  );
}
