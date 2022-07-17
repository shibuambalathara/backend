import {
  integer,
  relationship,
  select,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { fieldOptions } from "../application/access";

export const BidCountUpdate = list({
  access: {
    operation: {
      query: ({ session }) => !!session?.itemId,
      create: ({ session }) => !!session?.itemId,
      update: ({ session }) => !!session?.itemId,
      delete: ({ session }) => !!session?.itemId,
    },
  },
  fields: {
    eventUser: relationship({
      ref: "EventUser.bidCountUpdates",
    }),

    updatedBidCount: integer({
      defaultValue: 10,
      // hooks: {
      //   resolveInput: async({ context, item }) => ,
      // },
    }),

    status: select({
      type: "enum",
      options: ["pending", "blocked", "accepted"],
    }),
    createdBy: relationship({
      ref: "User.bidCountUpdates",
    }),
    createdAt: timestamp({
      ...fieldOptions,
      defaultValue: { kind: "now" },
    }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});
