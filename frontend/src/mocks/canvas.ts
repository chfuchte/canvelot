import type { Canvas, CanvasList, UserSelection } from "@/types/canvas";
import type { ManagementCanvasList } from "@/types/management";

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
        editable: true,
        collaborators: [],
        viewers: [
            {
                id: "2",
                username: "alicesmith",
            },
        ],
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
        editable: false,
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
        editable: true,
        collaborators: [
            {
                id: "2",
                username: "alicesmith",
            },
        ],
        viewers: [],
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

export const mockCanvas: Canvas = {
    id: "1",
    name: "Mock Canvas",
    editable: true,
    data: null,
};

export const mockManagementCanvasList: ManagementCanvasList = mockCanvasList.map((canvas) => ({
    id: canvas.id,
    name: canvas.name,
    lastModifiedAt: canvas.lastModifiedAt.toISOString(),
    owner: canvas.owner.username,
}));
