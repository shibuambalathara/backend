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
  hooks: {
    resolveInput: async ({ resolvedData, context, operation }) => {
      if (operation !== "create") {
        return resolvedData;
      }
      const [event, user] = await Promise.all([
        context.db.Event.findOne({
          where: { id: resolvedData?.event?.connect?.id },
        }),
        context.db.User.findOne({
          where: { id: resolvedData?.user?.connect?.id },
        }),
      ]);
      return {
        ...resolvedData,
        name: `${user?.name} : ${event?.name}`,
      };
    },
  },
  fields: {
    name: text({
      ui: {
        createView: { fieldMode: "hidden" },
      },
    }),
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