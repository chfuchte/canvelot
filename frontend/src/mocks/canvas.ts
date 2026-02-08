import type { CanvasList, UserSelection } from "@/types/canvas";

export const mockCanvasList: CanvasList = [
    {
        id: "1",
        name: "Private Canvas",
        lastModifiedAt: new Date(Date.now() - 1000 * 60 * 40),
        owner: {
            id: "1",
            username: "cfu",
        },
        is_owner: true,
        collaborators: [],
    },
    {
        id: "2",
        name: "Shared Canvas",
        lastModifiedAt: new Date(),
        owner: {
            id: "2",
            username: "alicesmith",
        },
        is_owner: false,
    },
    {
        id: "3",
        name: "Public Canvas",
        lastModifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        owner: {
            id: "1",
            username: "cfu",
        },
        is_owner: true,
        collaborators: [
            {
                id: "2",
                username: "alicesmith",
            },
        ],
    },
];

export const mockUserSelectionData: UserSelection = [
    {
        id: "1",
        username: "cfu",
    },
    {
        id: "2",
        username: "alicesmith",
    },
];
