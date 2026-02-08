import { Skeleton } from "./ui/skeleton";
import { Spinner } from "./ui/spinner";

export function LoadingSpinner() {
    return (
        <div className="inline-flex items-center gap-2">
            <Spinner className="size-4" /> Loading
        </div>
    );
}

export function ItemLoading() {
    return <Skeleton className="h-full min-h-30 w-full rounded-md" />;
}

export function FullPageLoading() {
    return (
        <div className="grid h-dvh w-full place-items-center">
            <LoadingSpinner />
        </div>
    );
}
