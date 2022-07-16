import {
  integer,
  relationship,
  select,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { fieldOptions } from "../application/access";

export const Bid = list({
  access: {
    operation: {
      query: ({ session }) => !!session.itemId,
      create: ({ session }) => !!session.itemId,
      update: ({ session }) => !!session.itemId,
      delete: ({ session }) => !!session.itemId,
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData, context, operation }) => {
      if (operation !== "create") {
        return resolvedData;
      }
      const [event, vehicle] = await Promise.all([
        context.db.Event.findOne({
          where: { id: resolvedData?.event?.connect?.id },
        }),
        context.db.Vehicle.findOne({
          where: { id: resolvedData?.vehicle?.connect?.id },
        }),
      ]);
      return {
        ...resolvedData,
        name: `${vehicle?.registrationNumber} : ${event?.name}`,
      };
    },
  },
  fields: {
    name: text({
      ui: {
        createView: { fieldMode: "hidden" },
      },
    }),
    eventTimeExpire: timestamp({}),
    bidTimeExpire: timestamp({}),
    currentBidAmount: integer({}),
    currentBidUser: relationship({
      ref: "User.activeBids",
      many: false,
    }),
    vehicle: relationship({
      ref: "Vehicle.bids",
      many: false,
    }),
    event: relationship({
      ref: "Event.bids",
      many: false,
    }),

    status: select({
      type: "enum",
      options: ["pending", "blocked", "live", "closed"],
    }),
    userBids: relationship({
      ref: "UserBid.bid",
      many: true,
    }),
    createdAt: timestamp({
      ...fieldOptions,
      defaultValue: { kind: "now" },
    }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});
