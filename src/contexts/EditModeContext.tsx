import { createContext, useContext, useEffect, useState } from "react";

type EditModeContextValue = {
  isAdmin: boolean;
  editMode: boolean;
  setEditMode: (val: boolean) => void;
};

const EditModeContext = createContext<EditModeContextValue>({
  isAdmin: false,
  editMode: false,
  setEditMode: () => {},
});

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth", { credentials: "include" })
      .then((res) => res.json())
      .then((body) => {
        if (body?.authenticated === true) {
          setIsAdmin(true);
        }
      })
      .catch(() => {
        // Not authenticated or network error — stay false
      });
  }, []);

  return (
    <EditModeContext.Provider value={{ isAdmin, editMode, setEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
