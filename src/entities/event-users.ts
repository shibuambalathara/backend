import {
  integer,
  relationship,
  select,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { fieldOptions } from "../application/access";

export const EventUser = list({
  access: {
    operation: {
      query: ({ session }) => !!session.itemId,
      create: ({ session }) => !!session.itemId,
      update: ({ session }) => !!session.itemId,
      delete: ({ session }) => !!session.itemId,
    },
  },
  fields: {
    event: relationship({
      ref: "Event.eventUsers",
      many: false,
    }),
    user: relationship({
      ref: "User.userEvents",
      many: false,
    }),
    remainingBids: integer({
      ui: { createView: { fieldMode: "hidden" } },
      defaultValue: 10,
      // hooks: {
      //   resolveInput: async({ context, item }) => ,
      // },
    }),
    bidCountUpdates: relationship({
      ref: "BidCountUpdate.eventUser",
      many: true,
    }),

    status: select({
      type: "enum",
      options: ["pending", "blocked", "accepted"],
    }),
    createdAt: timestamp({
      ...fieldOptions,
      defaultValue: { kind: "now" },
    }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});