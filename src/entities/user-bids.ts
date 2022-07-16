import {
  integer,
  relationship,
  select,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { fieldOptions } from "../application/access";

export const UserBid = list({
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
      const [bid, user] = await Promise.all([
        context.db.Bid.findOne({
          where: { id: resolvedData?.bid?.connect?.id },
        }),
        context.db.User.findOne({
          where: { id: resolvedData?.user?.connect?.id },
        }),
      ]);
      return {
        ...resolvedData,
        name: `${user?.name} : ${bid?.name}`,
      };
    },
  },
  fields: {
    name: text({
      ui: {
        createView: { fieldMode: "hidden" },
      },
    }),
    amount: integer({}),
    user: relationship({
      ref: "User.quotedBids",
      many: false,
    }),

    bid: relationship({
      ref: "Bid.userBids",
      many: false,
    }),

    status: select({
      type: "enum",
      options: ["pending", "blocked", "live", "closed", "accepted"],
    }),
    createdAt: timestamp({
      ...fieldOptions,
      defaultValue: { kind: "now" },
    }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});
