"use client";

export default function ConfirmDeleteButton({
  message = "이 메시지를 삭제할까요? 되돌릴 수 없습니다.",
}: {
  message?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className="rounded-full px-4 py-1.5 text-sm text-rose-500 transition hover:bg-rose-500/10"
    >
      삭제
    </button>
  );
}
