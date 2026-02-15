import type { ManagementCanvasList, ManagementUsersList } from "@/types/management";
import { create } from "zustand";

export const useManagementStore = create<{
    canvasList: ManagementCanvasList;
    userList: ManagementUsersList;
    setCanvasList: (list: ManagementCanvasList) => void;
    setUserList: (list: ManagementUsersList) => void;
    updateUserRole: (id: ManagementUsersList[number]["id"], newRole: "admin" | "user") => void;
    deleteCanvas: (id: ManagementCanvasList[number]["id"]) => void;
    deleteUser: (id: ManagementUsersList[number]["id"]) => void;
}>((set) => ({
    userList: [],
    canvasList: [],
    setUserList: (list) => set({ userList: list }),
    setCanvasList: (list) => set({ canvasList: list }),
    deleteCanvas: (id) => {
        set((state) => {
            const newList = state.canvasList.filter((c) => c.id !== id);
            return { canvasList: newList };
        });
    },
    deleteUser: (id) => {
        set((state) => {
            const newList = state.userList.filter((u) => u.id !== id);
            return { userList: newList };
        });
    },
    updateUserRole: (id, newRole) => {
        set((state) => {
            const newList = state.userList.map((u) => {
                if (u.id === id) {
                    return { ...u, role: newRole };
                }
                return u;
            });
            return { userList: newList };
        });
    },
}));
