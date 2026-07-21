import { createServerFn } from "@tanstack/react-start";
import {
    createPresentationInputSchema,
    updatePresentationInputSchema,
} from "../types/schemas";
import { authMiddleware } from "#/middleware/auth";
import { prisma } from "#/lib/db";
import { generateSlug } from "random-word-slugs";
import { PresentationStatus } from "#/generated/prisma/browser";
import { inngest } from "#/inngest/client";
import { executeGeneration } from "#/inngest/functions";

// Create Presentation
export const createPresentation = createServerFn({
    method: "POST",
})
    .validator((data: unknown) =>
        createPresentationInputSchema.parse(data)
    )
    .middleware([authMiddleware])
    .handler(async ({ data, context }) => {
        const userId = context!.session.user.id;

        const presentation = await prisma.presentation.create({
            data: {
                userId,
                title: generateSlug(),
                prompt: data.prompt,
                slideCount: data.slideCount,
                style: data.style,
                tone: data.tone,
                layout: data.layout,
                status: PresentationStatus.GENERATING,
            },
        });
        try {
            await inngest.send({
                name: "presentation/generate",
                data: { presentationId: presentation.id }
            });
        } catch (e) {
            console.warn("Inngest send event failed, falling back to direct background execution:", e);
            executeGeneration(presentation.id).catch(err => {
                console.error("Direct generation failed:", err);
                prisma.presentation.update({
                    where: { id: presentation.id },
                    data: { status: PresentationStatus.FAILED }
                }).catch(() => {});
            });
        }
        return presentation;
    });

// Update Presentation
export const updatePresentation = createServerFn({
    method: "POST",
})
    .validator((data: unknown) =>
        updatePresentationInputSchema.parse(data)
    )
    .middleware([authMiddleware])
    .handler(async ({ data, context }) => {
        const userId = context!.session.user.id;

        const { id, ...patch } = data;

        const existing = await prisma.presentation.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!existing) {
            throw new Error("Presentation not found");
        }

        return prisma.presentation.update({
            where: { id },
            data: patch,
        });
    });

// Delete Presentation
export const deletePresentation = createServerFn({
    method: "POST",
})
    .validator((data: unknown) =>
        updatePresentationInputSchema.pick({ id: true }).parse(data)
    )
    .middleware([authMiddleware])
    .handler(async ({ data, context }) => {
        const userId = context!.session.user.id;

        const existing = await prisma.presentation.findFirst({
            where: {
                id: data.id,
                userId,
            },
        });

        if (!existing) {
            throw new Error("Presentation not found");
        }

        await prisma.presentation.delete({
            where: {
                id: data.id,
            },
        });

        return {
            ok: true as const,
        };
    });

// Regenerate Presentation
export const regeneratePresentation = createServerFn({
    method: "POST",
})
    .validator((data: unknown) =>
        updatePresentationInputSchema.pick({ id: true }).parse(data)
    )
    .middleware([authMiddleware])
    .handler(async ({ data, context }) => {
        const userId = context!.session.user.id;

        const existing = await prisma.presentation.findFirst({
            where: {
                id: data.id,
                userId,
            },
        });

        if (!existing) {
            throw new Error("Presentation not found");
        }

        await prisma.presentation.update({
            where: {
                id: data.id,
            },
            data: {
                status: PresentationStatus.GENERATING,
            },
        });

        try {
            await inngest.send({
                name: "presentation/generate",
                data: { presentationId: data.id }
            });
        } catch (e) {
            console.warn("Inngest send event failed on regeneration, falling back to direct background execution:", e);
            executeGeneration(data.id).catch(err => {
                console.error("Direct generation failed:", err);
                prisma.presentation.update({
                    where: { id: data.id },
                    data: { status: PresentationStatus.FAILED }
                }).catch(() => {});
            });
        }

        return {
            ok: true as const,
        };
    });