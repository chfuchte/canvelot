import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchIsAdmin, getUsersQueryOptions } from "@/queries/management";
import { useManagementStore } from "@/stores/management";
import { ErrorComponent } from "@/components/error";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/loading";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeleteUserManagementDialog } from "@/components/dialogs/delete-user-management-dialog";
import { ToggleUserRoleManagementDialog } from "@/components/dialogs/toggle-role-dialog";
import { Trash, UserStar, UserX } from "lucide-react";

export const Route = createFileRoute("/manage/users")({
    component: RouteComponent,
    beforeLoad: async () => {
        try {
            const isAdmin = await fetchIsAdmin();

            if (!isAdmin) {
                return redirect({
                    to: "/",
                });
            }
        } catch (error) {
            console.error("Error checking admin status:", error);
            return redirect({
                to: "/",
            });
        }
    },
});

function RouteComponent() {
    const { data, error, isLoading, isError } = useQuery(getUsersQueryOptions);
    const setList = useManagementStore((state) => state.setUserList);
    const list = useManagementStore((state) => state.userList);

    if (isError) {
        console.error("Error fetching user list:", error);
        return <ErrorComponent />;
    }

    useEffect(() => {
        if (data) {
            setList(data);
        }
    }, [data, setList]);

    return (
        <>
            <Header />
            <main className="min-h-[calc(100dvh-var(--spacing)*16)]">
                {isLoading ? (
                    <LoadingSpinner />
                ) : list.length > 0 ? (
                    <Table>
                        <TableCaption>List of all users</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {list.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell className="space-x-2">
                                        <ToggleUserRoleManagementDialog
                                            id={user.id}
                                            name={user.username}
                                            role={user.role}>
                                            <Button size="icon" variant="secondary">
                                                {user.role === "admin" ? <UserX /> : <UserStar />}
                                            </Button>
                                        </ToggleUserRoleManagementDialog>
                                        <DeleteUserManagementDialog id={user.id} name={user.username}>
                                            <Button size="icon" variant="destructive">
                                                <Trash />
                                            </Button>
                                        </DeleteUserManagementDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Empty className="inset-0 m-auto">
                        <EmptyHeader>
                            <EmptyTitle>There are no users</EmptyTitle>
                            <EmptyDescription>It seems that there are no users in the system.</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
            </main>
            <Footer />
        </>
    );
}
