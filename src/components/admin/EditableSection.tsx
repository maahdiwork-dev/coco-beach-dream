import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEditMode } from "@/contexts/EditModeContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type EditableSectionProps = {
  title: string;
  children: React.ReactNode;
  editor: React.ReactNode;
};

export default function EditableSection({
  title,
  children,
  editor,
}: EditableSectionProps) {
  const { editMode } = useEditMode();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      // Invalidate so the live section re-fetches updated content
      void queryClient.invalidateQueries({ queryKey: ["content"] });
    }
  };

  if (!editMode) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative">
        {/* Inset outline — avoids disrupting full-bleed sections */}
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-lg"
          style={{
            outline: "2px dashed rgba(10,61,98,0.45)",
            outlineOffset: "-3px",
          }}
        />

        {/* Edit button — top-right of the section */}
        <div className="absolute top-3 right-3 z-30">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#0a3d62] px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-opacity hover:opacity-90"
          >
            <span>✏️</span>
            <span>Modifier {title}</span>
          </button>
        </div>

        {children}
      </div>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <span>✏️</span>
              <span>{title}</span>
            </SheetTitle>
          </SheetHeader>
          {editor}
        </SheetContent>
      </Sheet>
    </>
  );
}
