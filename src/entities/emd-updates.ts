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
    labelField: "emdNo",
  },
  hooks: {
    resolveInput: async ({ resolvedData, context, operation }) => {
      if (operation !== "create") {
        return resolvedData;
      }
      const { user } = await context.query.Payment.findOne({
        where: { id: resolvedData.payment.connect.id },
        query: `user { id }`,
      });
      return {
        ...resolvedData,
        user: {
          connect: {
            id: user.id,
          },
        },
        createdBy: {
          connect: {
            id: context?.session?.itemId,
          },
        },
      };
    },
    afterOperation: async ({ resolvedData, context, operation }) => {
      if (operation !== "create") {
        return;
      }
      console.log(resolvedData);
      await context.prisma.user.update({
        where: {
          id: resolvedData?.user?.connect?.id,
        },
        data: {
          vehicleBuyingLimit: {
            increment: resolvedData?.vehicleBuyingLimitIncrement ?? 0,
          },
          specialVehicleBuyingLimit: {
            increment: resolvedData?.specialVehicleBuyingLimitIncrement ?? 0,
          },
        },
      });
    },
  },
  fields: {
    emdNo: integer({
      isIndexed: true,
      defaultValue: {
        kind: "autoincrement",
      },
      db: {
        isNullable: false,
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        listView: { fieldMode: "read" },
      },
    }),
    vehicleBuyingLimitIncrement: integer({
      defaultValue: 1,
    }),
    specialVehicleBuyingLimitIncrement: integer({
      defaultValue: 0,
    }),
    payment: relationship({
      ref: "Payment.emdUpdate",
      many: false,
      db: { foreignKey: true },
    }),
    user: relationship({
      ref: "User.emdUpdates",
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
    }),
  },
});
