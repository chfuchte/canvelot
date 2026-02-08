import { LogOut } from "lucide-react";
import { CanvelotIcon } from "./icons/canvelot";
import { Button } from "./ui/button";

export function Header({ children }: { children?: React.ReactNode }) {
    const handleLogout = () => {
        window.location.href = "/api/logout";
    };

    return (
        <header className="flex h-16 flex-row items-center justify-between gap-2 p-4">
            <div className="flex gap-1 select-none">
                <CanvelotIcon className="size-8" />
                <h1 className="text-2xl font-bold">Canvelot</h1>
            </div>
            <div className="flex gap-2">
                {children}
                <Button variant="secondary" onClick={handleLogout}>
                    <LogOut /> Log Out
                </Button>
            </div>
        </header>
    );
}
