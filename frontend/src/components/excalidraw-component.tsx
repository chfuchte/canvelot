import { ExternalLink, LayoutGrid, Moon, Save, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
    Excalidraw,
    MainMenu,
    WelcomeScreen,
    CaptureUpdateAction,
    restoreAppState,
    restoreElements,
    Footer,
} from "@excalidraw/excalidraw";
import { useTheme } from "@/hooks/theme";
import { useNavigate } from "@tanstack/react-router";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { Canvas } from "@/types/canvas";
import { useMutation } from "@tanstack/react-query";
import { saveCanvasMutationOptions } from "@/queries/canvas";
import { toast } from "sonner";

import "@excalidraw/excalidraw/index.css";
import "@/styles/excalidraw.css";
import type { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export function ExcalidrawComponent({ canvas }: { canvas: Canvas }) {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

    useEffect(() => {
        // @ts-expect-error https://docs.excalidraw.com/docs/@excalidraw/excalidraw/installation#self-hosting-fonts
        window.EXCALIDRAW_ASSET_PATH = "/";
    }, []);

    const { setTheme, theme } = useTheme();
    const navigate = useNavigate();
    const saveMutation = useMutation(saveCanvasMutationOptions);

    const handleSaveCanvas = async () => {
        if (!excalidrawAPI) return;

        const appState = excalidrawAPI.getAppState();
        const elements = excalidrawAPI.getSceneElements();
        const files = excalidrawAPI.getFiles();

        const saveResult = await saveMutation.mutateAsync({
            _id: canvas._id,
            name: canvas.name,
            data: {
                appState,
                elements: elements as NonDeletedExcalidrawElement[],
                files,
            },
        });

        if (saveResult) {
            toast.success("Canvas saved successfully!");
        } else {
            toast.error("Failed to save canvas.");
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
        };
    };

    return (
        <Excalidraw
            aiEnabled={false}
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
                <MainMenu.Item
                    onSelect={() =>
                        void navigate({
                            to: "/",
                        })
                    }>
                    <LayoutGrid className="stroke-current" /> Back to Menu
                </MainMenu.Item>
                <MainMenu.Item
                    onSelect={(e) => {
                        e.preventDefault();
                        void handleSaveCanvas();
                    }}>
                    <Save className="stroke-current" /> Save
                </MainMenu.Item>

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
                        <WelcomeScreen.Center.Heading>Welcome back!</WelcomeScreen.Center.Heading>
                    </WelcomeScreen.Center.Menu>
                </WelcomeScreen.Center>
            </WelcomeScreen>

            <Footer>
                <div className="text-muted-foreground flex h-full w-full flex-row items-center justify-center gap-2">
                    <p>&copy; {new Date().getFullYear()} Christian Fuchte</p>
                </div>
            </Footer>
        </Excalidraw>
    );
}
