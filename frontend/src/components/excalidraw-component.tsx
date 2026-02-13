import { ExternalLink, LayoutGrid, Moon, Save, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
    CaptureUpdateAction,
    Excalidraw,
    MainMenu,
    restoreAppState,
    restoreElements,
    WelcomeScreen,
} from "@excalidraw/excalidraw";
import { useTheme } from "@/hooks/theme";
import { useNavigate } from "@tanstack/react-router";
import type { BinaryFiles, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { NonDeletedExcalidrawElement, Ordered } from "@excalidraw/excalidraw/element/types";
import type { Canvas } from "@/types/canvas";
import { useMutation } from "@tanstack/react-query";
import { tryCatch } from "@/lib/utils";
import { editCanvasDataMutationOptions } from "@/queries/canvas";
import { toast } from "sonner";

import "@excalidraw/excalidraw/index.css";
import "@/styles/excalidraw.css";

export function ExcalidrawComponent({ canvas }: { canvas: Canvas }) {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

    useEffect(() => {
        // @ts-expect-error https://docs.excalidraw.com/docs/@excalidraw/excalidraw/installation#self-hosting-fonts
        window.EXCALIDRAW_ASSET_PATH = "/";
    }, []);

    const { setTheme, theme } = useTheme();
    const navigate = useNavigate();
    const editCanvasDataMutation = useMutation(editCanvasDataMutationOptions);

    const handleSaveCanvas = async () => {
        if (!excalidrawAPI) return;
        if (!canvas.editable) {
            toast.error("You don't have permission to edit this canvas");
            return;
        }

        const appState = excalidrawAPI.getAppState();
        const elements = excalidrawAPI.getSceneElements();
        const files = excalidrawAPI.getFiles();

        const data = {
            appState,
            elements,
            files: filterNonUsedFiles(files, elements),
        };

        const [success, error] = await tryCatch(editCanvasDataMutation.mutateAsync({ id: canvas.id, data }));

        if (error) {
            console.error("Failed to save canvas data", error);
            toast.error("Failed to save canvas data");
        }

        if (success) {
            toast.success("Canvas data saved successfully");
        }
    };

    const reloadOldState = () => {
        if (!canvas.data) return;

        const restoredAppState = restoreAppState(canvas.data?.appState, excalidrawAPI?.getAppState());

        const restoredElements = restoreElements(canvas.data?.elements || [], []);
        return {
            appState: { ...restoredAppState, collaborators: new Map() },
            elements: restoredElements,
            captureUpdate: CaptureUpdateAction.IMMEDIATELY,
            scrollToContent: true,
            files: canvas.data?.files || undefined,
        };
    };

    const handleBackToMenu = () => {
        void navigate({
            to: "/",
        });
    };

    return (
        <Excalidraw
            aiEnabled={false}
            viewModeEnabled={canvas.editable ? undefined : true}
            showDeprecatedFonts={false}
            handleKeyboardGlobally={false}
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            name={canvas.name}
            theme={theme}
            renderCustomStats={() => (
                <a
                    href="https://excalidraw.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1">
                    <ExternalLink className="size-3" /> Build on top of Excalidraw
                </a>
            )}
            initialData={reloadOldState()}>
            <MainMenu>
                <MainMenu.Item onSelect={handleBackToMenu}>
                    <LayoutGrid className="stroke-current" /> Back to Menu
                </MainMenu.Item>

                {canvas.editable && (
                    <MainMenu.Item
                        onSelect={(e) => {
                            e.preventDefault();
                            void handleSaveCanvas();
                        }}>
                        <Save className="stroke-current" /> Save
                    </MainMenu.Item>
                )}

                <MainMenu.Separator />

                <MainMenu.DefaultItems.LoadScene />
                <MainMenu.DefaultItems.SaveAsImage />
                <MainMenu.DefaultItems.SearchMenu />
                <MainMenu.DefaultItems.ClearCanvas />

                <MainMenu.Separator />

                <MainMenu.Item
                    shortcut="Shift+Alt+D"
                    onSelect={(e) => {
                        e.preventDefault();
                        setTheme(theme === "dark" ? "light" : "dark");
                    }}>
                    {theme === "dark" ? <Sun className="stroke-current" /> : <Moon className="stroke-current" />}{" "}
                    {theme === "dark" ? "Light Theme" : "Dark Theme"}
                </MainMenu.Item>
                <MainMenu.DefaultItems.ChangeCanvasBackground />
            </MainMenu>

            <WelcomeScreen>
                <WelcomeScreen.Center>
                    <WelcomeScreen.Hints.MenuHint />
                    <WelcomeScreen.Hints.ToolbarHint />
                    <WelcomeScreen.Center.Menu>
                        <WelcomeScreen.Center.Heading>{canvas.name}</WelcomeScreen.Center.Heading>
                    </WelcomeScreen.Center.Menu>
                </WelcomeScreen.Center>
            </WelcomeScreen>
        </Excalidraw>
    );
}

function filterNonUsedFiles(
    files: BinaryFiles,
    elements: readonly Ordered<NonDeletedExcalidrawElement>[],
): BinaryFiles {
    const usedFiles = new Set<string>();

    for (const element of elements) {
        if (element.type === "image" && element.fileId) {
            usedFiles.add(element.fileId);
        }
    }

    return Object.fromEntries(Object.entries(files).filter(([fileId]) => usedFiles.has(fileId)));
}
