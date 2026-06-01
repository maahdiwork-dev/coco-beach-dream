import { useEditMode } from "@/contexts/EditModeContext";

export default function EditModeToggle() {
  const { isAdmin, editMode, setEditMode } = useEditMode();

  if (!isAdmin) return null;

  return (
    <button
      type="button"
      onClick={() => setEditMode(!editMode)}
      className={`fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg transition-all duration-200 ${
        editMode
          ? "bg-[#0a3d62] text-white ring-2 ring-[#0a3d62]/40 ring-offset-2"
          : "bg-white text-[#0a3d62] border border-[#0a3d62]/30 hover:bg-[#0a3d62]/5"
      }`}
    >
      <span>✏️</span>
      <span>Mode édition</span>
      <span
        className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
          editMode
            ? "bg-white/20 text-white"
            : "bg-[#0a3d62]/10 text-[#0a3d62]"
        }`}
      >
        {editMode ? "ON" : "OFF"}
      </span>
    </button>
  );
}
