import {
  integer,
  relationship,
  select,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { fieldOptions, isNotAdmin, isSuperAdmin } from "../application/access";

export const EmdUpdate = list({
  access: {
    operation: {
      query: ({ session }) => !!session?.itemId,
      create: isSuperAdmin,
      update: () => false,
      delete: () => false,
    },
  },
  ui: {
    isHidden: isNotAdmin,
    createView: { defaultFieldMode: "edit" },
    itemView: { defaultFieldMode: "read" },
    hideDelete: true,
  },
  hooks: {
    afterOperation: async ({ resolvedData, context, operation }) => {
      if (operation !== "create") {
        return;
      }
      await context.db.User.updateOne({
        where: {
          id: resolvedData?.User?.connect?.id,
        },
        data: {
          remainingBids: {
            increment: resolvedData?.incrementEmdAmount,
          },
        },
      });
    },
  },
  fields: {
    incrementEmdAmount: integer({
      defaultValue: 10000,
    }),

    user: relationship({
      ref: "User.emdUpdates",
      many: false,
    }),
    createdAt: timestamp({
      ...fieldOptions,
      defaultValue: { kind: "now" },
    }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
    createdBy: relationship({
      ref: "User.emdUpdatesByAdmin",
      many: false,
      ui: {
        listView: {
          fieldMode: "read",
        },
        itemView: {
          fieldMode: "read",
        },
        createView: {
          fieldMode: "hidden",
        },
      },
      hooks: {
        resolveInput: ({ resolvedData, context }) => {
          resolvedData.createdBy = {
            connect: {
              id: context?.session?.ItemId,
            },
          };
          return resolvedData;
        },
      },
    }),
  },
});
