import { Link } from "@tanstack/react-router";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

export function Error() {
    return (
        <div className="grid h-dvh place-items-center">
            <Empty>
                <EmptyHeader>
                    <EmptyTitle className="flex h-8 flex-row items-center gap-2">
                        This should not have happened.
                    </EmptyTitle>
                    <EmptyDescription>
                        Bitte versuche es später erneut oder kehre zur Startseite zurück.
                    </EmptyDescription>
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
