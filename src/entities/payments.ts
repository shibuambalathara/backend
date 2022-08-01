import {
  integer,
  relationship,
  select,
  timestamp,
  text,
  image,
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
      update: ownerFilter,
    },
  },
  hooks: {
    resolveInput: ({ resolvedData, context, operation }) => {
      if (operation !== "create") {
        return resolvedData;
      }

      return {
        ...resolvedData,
        user: {
          connect: {
            id: context?.session?.itemId,
          },
        },
      };
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
    paymentFor: select({
      validation: {
        isRequired: true,
      },
      options: [
        { value: "registrations", label: "Registrations" },
        { value: "emd", label: "EMD" },
        { value: "refund", label: "Refund" },
      ],
    }),
    description: text(),
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
    }),
    image: image({ storage: "local_images" }),
    createdAt: timestamp({
      ...fieldOptions,
      defaultValue: { kind: "now" },
    }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});
