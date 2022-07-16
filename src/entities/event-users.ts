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
  isSuperAdmin,
} from "../application/access";

const ownerFilter = ({ session, context, listKey, operation }) => {
  if (session.data.role === "admin") {
    return true;
  }
  return { user: { id: { equals: session.itemId } } };
};

export const EventUser = list({
  access: {
    operation: {
      query: ({ session }) => !!session.itemId,
      create: isSuperAdmin,
      update: isSuperAdmin,
      delete: isSuperAdmin,
    },
    filter: {
      query: ownerFilter,
    },
  },
  ui: {
    hideCreate: ({ session }) => !!session.itemId || !isSuperAdmin(session),
    hideDelete: ({ session }) => !!session.itemId || !isSuperAdmin(session),
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
        remainingBids: event?.maxBids,
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
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: {
          fieldMode: isAdminEdit,
        },
      },
    }),
    bidCountUpdates: relationship({
      ref: "BidCountUpdate.eventUser",
      many: true,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: isAdminEdit },
      },
    }),

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