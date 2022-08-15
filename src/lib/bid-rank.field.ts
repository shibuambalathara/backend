import { graphql } from "@keystone-6/core";
import { virtual } from "@keystone-6/core/fields";

export const bidRank = virtual({
  field: graphql.field({
    type: graphql.Int,
    async resolve(item: any, args, context) {
      const rank = await context.prisma.bid.findMany({
        distinct: ["userId"],
        where: { vehicle: { id: item.id } },
        orderBy: {
          bidAmount: "desc",
        },
        skip: 0,
        take: 10,
      });
      return rank.findIndex((x) => x?.userId === context?.session?.itemId) + 1;
    },
  }),
  ui: {
    query: ` bidRank `,
  },
});
