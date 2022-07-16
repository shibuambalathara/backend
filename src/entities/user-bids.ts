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
      update: ({ session }) => false,
      delete: ({ session }) => false,
    },
  },
  hooks: {
    validateInput: async ({ resolvedData, context, addValidationError }) => {
      const { amount } = resolvedData;
      const bid = await context.db.Bid.findOne({
        where: { id: resolvedData?.bid?.connect?.id },
      });
      if (!bid.currentBidAmount || bid.currentBidAmount <= amount) {
        addValidationError(
          "Bid Amount smaller than current bid amount, Current Bid Amount: " +
            bid.currentBidAmount
        );
      }
    },
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
