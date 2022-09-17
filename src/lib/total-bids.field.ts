import { graphql } from "@keystone-6/core";
import { virtual } from "@keystone-6/core/fields";

export const totalBids = virtual({
  field: graphql.field({
    type: graphql.Int,
    async resolve(item: any, args, context) {
      const count = await context.prisma.bid.count({
        where: { bidVehicle: { id: { equals: item.id } } },
      });
      return count;
    },
  }),
  ui: {
    query: ` totalBids `,
  },
});
