import { Link } from "@tanstack/react-router";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function NotFound() {
    return (
        <div className="grid h-dvh place-items-center">
            <Empty>
                <EmptyHeader>
                    <EmptyTitle className="flex h-8 flex-row items-center gap-2">
                        404 <Separator orientation="vertical" /> Not Found
                    </EmptyTitle>
                    <EmptyDescription>Die angeforderte Seite oder Ressource wurde nicht gefunden.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button asChild>
                        <Link to="/">Zurück zur Startseite</Link>
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
}
