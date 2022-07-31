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
      await context.db.VehicleUser.updateOne({
        where: {
          id: resolvedData?.vehicleUser?.connect?.id,
        },
        data: {
          remainingBids: {
            increment: resolvedData.incrementBidCount,
          },
        },
      });
    },
  },
  fields: {
    event: relationship({
      ref: "Event.bidCountUpdates",
    }),

    incrementBidCount: integer({
      defaultValue: 5,
    }),

    createdFor: relationship({
      ref: "User.bidCountUpdates",
    }),
    createdAt: timestamp({
      ...fieldOptions,
      defaultValue: { kind: "now" },
    }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});
