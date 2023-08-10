import { createTRPCRouter, protectedProcedure, publicProcedure } from '$/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const profileSchema = z.object({
  id: z.string()
    .optional(),
  username: z.string(),
  bio: z.string()
    .nullish(),
  image: z.string()
    .url()
    .nullish(),
  following: z.boolean()
    .nullish()
    .default(false),
})

export const profileRouter = createTRPCRouter({
  getProfileByName: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/profiles/{username}',
        protect: true,  // Usually this should be false, but swagger does not send the auth header without
        tags: ['Profile'],
        summary: 'Get a profile',
        description: 'Get a profile of a user of the system. Auth is optional',
      },
    })
    .input(z.object({ username: z.string() }))
    .output(z.object({ profile: profileSchema }))
    .query(async ({
                    input,
                    ctx,
                  }) => {
      const profile = await ctx.prisma.user.findUnique({
        where: { username: input.username },
        include: ctx.user && {
          followedByUsers: {
            select: { id: true },
            where: { id: ctx.user?.id },
          },
        },
      })
      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        })
      }
      return {
        profile: {
          ...profile,
          following: !!ctx.user && profile.followedByUsers.length > 0,
        },
      }
    }),
  followProfile: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/profiles/{username}/follow',
        protect: true,
        tags: ['Profile'],
        summary: 'Follow a user',
        description: 'Follow a user by username',
      },
    })
    .input(z.object({
      username: z.string()
        .transform(value => decodeURIComponent(value)),
    }))
    .output(z.object({ profile: profileSchema }))
    .mutation(async ({
                       input,
                       ctx,
                     }) => {
      const profile = await ctx.prisma.user.update({
        where: { username: input.username },
        data: {
          followedByUsers: {
            connect: {
              id: ctx.user.id,
            },
          },
        },
      })
      return {
        profile: {
          ...profile,
          following: true,
        },
      }
    }),
  unFollowProfile: protectedProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/profiles/{username}/follow',
        protect: true,
        tags: ['Profile'],
        summary: 'Unfollow a user',
        description: 'Unfollow a user by username',
      },
    })
    .input(z.object({
      username: z.string()
        .transform(value => decodeURIComponent(value)),
    })) // TODO Check if it makes sense to open a PR for this
    .output(z.object({ profile: profileSchema }))
    .mutation(async ({
                       input,
                       ctx,
                     }) => {
      const profile = await ctx.prisma.user.update({
        where: { username: input.username },
        data: {
          followedByUsers: {
            disconnect: {
              id: ctx.user.id,
            },
          },
        },
      })
      return {
        profile: {
          ...profile,
          following: false,
        },
      }
    }),
})