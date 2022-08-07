import {
  integer,
  relationship,
  select,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import {
  fieldOptions,
  isAdminCreate,
  isAdminEdit,
  isNotAdmin,
  isSuperAdmin,
} from "../application/access";

const ownerFilter = ({ session, context, listKey, operation }) => {
  if (session?.data?.role === "admin") {
    return true;
  }
  return { user: { id: { equals: session?.itemId } } };
};

export const EventUser = list({
  access: {
    operation: {
      query: ({ session }) => !!session?.itemId,
      create: ({ session }) => !!session?.itemId,
      update: isSuperAdmin,
      delete: isSuperAdmin,
    },
    filter: {
      query: ownerFilter,
    },
  },
  ui: {
    hideCreate: isNotAdmin,
    hideDelete: isNotAdmin,
    itemView: { defaultFieldMode: isAdminEdit },
  },
  hooks: {
    validateInput: async ({ resolvedData, context, addValidationError }) => {
      const eventUserCount = await context.query.EventUser.count({
        where: {
          event: { id: { equals: resolvedData?.event?.connect?.id } },
          user: { id: { equals: resolvedData?.user?.connect?.id } },
        },
      });

      if (eventUserCount) {
        addValidationError("Duplicate Event User Entry");
      }
    },
    resolveInput: async ({ resolvedData, context, operation }) => {
      if (operation !== "create") {
        return resolvedData;
      }
      const [event, user] = await Promise.all([
        context.query.Event.findOne({
          where: { id: resolvedData?.event?.connect?.id },
          query: "id name noOfBids",
        }),
        context.query.User.findOne({
          where: { id: resolvedData?.user?.connect?.id },
          query: `id firstName lastName username`,
        }),
      ]);
      return {
        ...resolvedData,
        name: `${user?.firstName ?? user?.username}: ${event?.name}`,
        remainingBids: event?.noOfBids,
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
    // remainingBids: integer({
    //   ui: {
    //     createView: { fieldMode: "hidden" },
    //     itemView: {
    //       fieldMode: "read",
    //     },
    //   },
    // }),
    // bidCountUpdates: relationship({
    //   ref: "BidCountUpdate.eventUser",
    //   many: true,
    //   ui: {
    //     createView: { fieldMode: "hidden" },
    //     itemView: { fieldMode: "read" },
    //   },
    // }),

    status: select({
      type: "enum",
      defaultValue: "pending",
      options: ["pending", "blocked", "accepted"],
      ui: {
        createView: { fieldMode: isAdminCreate },
        itemView: { fieldMode: isAdminEdit },
      },
    }),
    createdAt: timestamp({
      ...fieldOptions,
      defaultValue: { kind: "now" },
    }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});