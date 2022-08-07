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
      const user = await context.query.User.findOne({
        where: { id: item.id },
        query: "vehicleBuyingLimit specialVehicleBuyingLimit",
      });
      return {
        vehicleBuyingLimit: user.vehicleBuyingLimit,
        specialVehicleBuyingLimit: user.specialVehicleBuyingLimit,
      };
    },
  }),
  ui: { query: "{ vehicleBuyingLimit specialVehicleBuyingLimit }" },
});
