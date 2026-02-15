import z from "zod";

export const canvasesSchema = z.array(
    z.object({
        id: z.string(),
        name: z.string(),
        owner: z.string(),
        lastModifiedAt: z.string(),
    }),
);

export type ManagementCanvasList = z.infer<typeof canvasesSchema>;

export const usersSchema= z.array(
    z.object({
        id: z.string(),
        name: z.string(),
        username: z.string(),
        role: z.enum(["admin", "user"]),
    }),
);

export type ManagementUsersList = z.infer<typeof usersSchema>;
