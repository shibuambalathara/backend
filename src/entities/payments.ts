import {
  integer,
  relationship,
  select,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { fieldOptions, isNotAdmin, isSuperAdmin } from "../application/access";

const ownerFilter = ({ session, context, listKey, operation }) => {
  if (session.data.role === "admin") {
    return true;
  }
  return { user: { id: { equals: session?.itemId } } };
};

export const Payment = list({
  access: {
    operation: {
      query: ({ session }) => !!session?.itemId,
      create: ({ session }) => !!session?.itemId,
      update: ({ session }) => !!session?.itemId,
      delete: ({ session }) => !!session?.itemId,
    },
    filter: {
      query: ownerFilter,
    },
  },

  ui: {
    createView: { defaultFieldMode: "edit" },
    itemView: { defaultFieldMode: "read" },
  },

  fields: {
    amount: integer({
      defaultValue: 10000,
    }),

    user: relationship({
      ref: "User.payments",
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
    createdAt: timestamp({
      ...fieldOptions,
      defaultValue: { kind: "now" },
    }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});
