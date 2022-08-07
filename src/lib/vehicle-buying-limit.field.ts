import { graphql } from "@keystone-6/core";
import { virtual } from "@keystone-6/core/fields";
// import { User } from "@prisma/client";
export const vehicleBuyingLimitField = virtual({
  field: graphql.field({
    type: graphql.object<{
      vehicleBuyingLimit: number;
      specialVehicleBuyingLimit: number;
    }>()({
      name: "vehicleBuyingLimits",
      fields: {
        vehicleBuyingLimit: graphql.field({ type: graphql.Int }),
        specialVehicleBuyingLimit: graphql.field({ type: graphql.Int }),
      },
    }),
    async resolve(item: any, args, context) {
      const { author } = await context.query.User.findOne({
        where: { id: item.id },
        query: "author { name }",
      });
      return {
        vehicleBuyingLimit: 10,
        specialVehicleBuyingLimit: 1,
      };
    },
  }),
  ui: { query: "{ vehicleBuyingLimit specialVehicleBuyingLimit }" },
});
