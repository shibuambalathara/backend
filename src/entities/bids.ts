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
  fields: {
    eventTimeExpire: timestamp({}),
    bidTimeExpire: timestamp({}),
    currentBidAmount: integer({}),
    currentBidUser: relationship({
      ref: "User.activeBids",
      many: false,
    }),
    vehicles: relationship({
      ref: "Vehicle.bids",
      many: true,
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
