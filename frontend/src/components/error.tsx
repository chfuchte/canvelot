import { Link } from "@tanstack/react-router";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

export function ErrorComponent() {
    return (
        <div className="grid h-dvh place-items-center">
            <Empty>
                <EmptyHeader>
                    <EmptyTitle className="flex h-8 flex-row items-center gap-2">
                        This should not have happened.
                    </EmptyTitle>
                    <EmptyDescription>An unexpected error has occurred. Please try again later.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button asChild>
                        <Link to="/">Back to Home</Link>
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
}
