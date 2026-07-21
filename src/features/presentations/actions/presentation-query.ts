import { createServerFn } from '@tanstack/react-start'
import { presentationIdInputSchema } from '../types/schemas'
import { authMiddleware } from '#/middleware/auth'
import { prisma } from '#/lib/db'

export const getPresentationWithSlides = createServerFn({
  method: 'GET',
})
  .validator((data: unknown) => presentationIdInputSchema.parse(data))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context?.session?.user?.id

    if (!userId) {
      throw new Error('Unauthorized')
    }

    const presentation = await prisma.presentation.findFirst({
      where: {
        id: data.id,
        userId,
      },
      include: {
        slides: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!presentation) {
      throw new Error('Presentation not found')
    }

    return presentation
  })

export const listPresentations = createServerFn({
  method: 'GET',
})
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context?.session?.user?.id

    if (!userId) {
      throw new Error('Unauthorized')
    }

    return prisma.presentation.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  })