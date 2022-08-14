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
      const [user, specialCount, normalCount] = await Promise.all([
        context.query.User.findOne({
          where: { id: item.id },
          query: `vehicleBuyingLimit specialVehicleBuyingLimit`,
        }),
        context.query.Vehicle.count({
          where: {
            currentBidUser: { id: { equals: item.id } },
            event: {
              isSpecialEvent: { equals: true },
            },
            bidStatus: {
              in: ["pending", "approved"],
            },
          },
        }),
        context.query.Vehicle.count({
          where: {
            currentBidUser: { id: { equals: item.id } },
            event: {
              isSpecialEvent: { equals: false },
            },
            bidStatus: {
              in: ["pending", "approved"],
            },
          },
        }),
      ]);
      return {
        vehicleBuyingLimit: user.vehicleBuyingLimit - normalCount,
        specialVehicleBuyingLimit:
          user.specialVehicleBuyingLimit - specialCount,
      };
    },
  }),
  ui: {
    query: `{ vehicleBuyingLimit specialVehicleBuyingLimit }`,
  },
});
