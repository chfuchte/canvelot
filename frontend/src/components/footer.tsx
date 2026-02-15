import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/hooks/theme";
import { ButtonGroup } from "./ui/button-group";
import { GitHubIcon } from "./icons/github";
import { CanvelotIcon } from "./icons/canvelot";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getIsAdminQueryOptions } from "@/queries/management";
import { Separator } from "./ui/separator";

export function Footer() {
    const { data: isAdmin, isLoading, isError, error } = useQuery(getIsAdminQueryOptions);
    const { theme, setTheme } = useTheme();

    if (isError) {
        console.error("Error fetching admin status:", error);
    }

    return (
        <footer className="bg-muted text-muted-foreground flex flex-col items-center gap-2 p-4 text-sm">
            <ButtonGroup>
                <Button asChild variant="ghost" size="icon">
                    <Link to="/">
                        <CanvelotIcon />
                    </Link>
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                    {theme === "light" ? <Moon /> : <Sun />}
                </Button>

                <Button asChild variant="ghost" size="icon">
                    <a href="https://github.com/chfuchte/canvelot" target="_blank" rel="noopener noreferrer">
                        <GitHubIcon />
                    </a>
                </Button>
            </ButtonGroup>

            {isLoading ? (
                <div className="text-muted-foreground">Loading admin status...</div>
            ) : isError ? (
                <div className="text-destructive">Failed to load admin status.</div>
            ) : isAdmin ? (
                <div className="flex flex-row items-center gap-2">
                    <Link to="/manage/canvas">Manage Canvases</Link>
                    <Separator orientation="vertical" className="h-4" />
                    <Link to="/manage/users">Manage Users</Link>
                </div>
            ) : null}

            <div>&copy; {new Date().getFullYear()} Christian Fuchte. All rights reserved.</div>
        </footer>
    );
}
