import type { CanvasList } from "@/types/canvas";
import { create } from "zustand";

export const useCanvasStore = create<{
    list: CanvasList;
    setList: (list: CanvasList) => void;
    updateCanvas: (canvas: CanvasList[number]) => void;
    removeCanvas: (id: CanvasList[number]["id"]) => void;
}>((set) => ({
    list: [],
    updateCanvas: (canvas) => {
        set((state) => {
            const index = state.list.findIndex((c) => c.id === canvas.id);
            if (index === -1) {
                return { list: [...state.list, canvas] };
            }
            const newList = [...state.list];
            newList[index] = canvas;
            return { list: newList };
        });
    },
    removeCanvas: (id) => {
        set((state) => {
            const newList = state.list.filter((c) => c.id !== id);
            return { list: newList };
        });
    },
    setList: (list) => set({ list }),
}));
