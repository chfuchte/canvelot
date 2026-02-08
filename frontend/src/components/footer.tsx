import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/hooks/theme";
import { ButtonGroup } from "./ui/button-group";
import { GitHubIcon } from "./icons/github";
import { CanvelotIcon } from "./icons/canvelot";
import { Link } from "@tanstack/react-router";

export function Footer() {
    const { theme, setTheme } = useTheme();

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

            <div>&copy; {new Date().getFullYear()} Christian Fuchte. All rights reserved.</div>
        </footer>
    );
}
