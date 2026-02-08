import type { CanvasList } from "@/types/canvas";

export const mockCanvasList: CanvasList = [
    {
        id: "1",
        name: "Private Canvas",
        lastModifiedAt: new Date(Date.now() - 1000 * 60 * 60),
        owner: {
            id: "1",
            username: "cfu",
        },
        is_shared: false,
        sharedWith: [],
    },
    {
        id: "2",
        name: "Shared Canvas",
        lastModifiedAt: new Date(),
        owner: {
            id: "2",
            username: "alicesmith",
        },
        is_shared: true,
    },
    {
        id: "3",
        name: "Public Canvas",
        lastModifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        owner: {
            id: "1",
            username: "cfu",
        },
        is_shared: false,
        sharedWith: [
            {
                id: "2",
                username: "alicesmith",
            },
        ],
    },
];
