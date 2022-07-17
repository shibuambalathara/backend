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
  if (session.data.role === "admin") {
    return true;
  }
  return {
    vehicle: {
      event: { id: { in: session.data?.userEvents?.map((e) => e.event.id) } },
    },
  };
};

export const Bid = list({
  access: {
    operation: {
      query: ({ session }) => !!session?.itemId,
      create: ({ session }) => !!session?.itemId,
      update: ({ session }) => !!session?.itemId,
      delete: isSuperAdmin,
    },
    filter: {
      query: ownerFilter,
    },
  },
  ui: {
    hideDelete: isNotAdmin,
    itemView: { defaultFieldMode: isAdminEdit },
  },
  hooks: {
    resolveInput: async ({ resolvedData, context, operation }) => {
      if (operation !== "create") {
        return resolvedData;
      }
      const vehicle = await context.query.Vehicle.findOne({
        where: { id: resolvedData?.vehicle?.connect?.id },
        query: "id reservePrice registrationNumber event { name endDate }",
      });
      
      return {
        ...resolvedData,
        name: `${vehicle?.registrationNumber} : ${vehicle?.event?.name}`,
        eventTimeExpire: vehicle?.event?.endDate,
        bidTimeExpire: vehicle?.event?.endDate,
        currentBidAmount: vehicle?.reservePrice,
        currentBidUser: isSuperAdmin(context.session)
          ? resolvedData.currentBidUser
          : { connect: { id: context?.session?.itemId } },
      };
    },
  },
  fields: {
    name: text({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    eventTimeExpire: text({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    bidTimeExpire: text({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    currentBidAmount: integer({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    currentBidUser: relationship({
      ref: "User.activeBids",
      many: false,
      ui: {
        createView: { fieldMode: isAdminCreate },
        itemView: { fieldMode: "read" },
      },
    }),
    vehicle: relationship({
      ref: "Vehicle.bids",
      many: false,
    }),

    status: select({
      type: "enum",
      defaultValue: "live",
      options: ["pending", "blocked", "live", "closed"],
      ui: {
        createView: { fieldMode: isAdminCreate },
        itemView: { fieldMode: "read" },
      },
    }),
    userBids: relationship({
      ref: "UserBid.bid",
      many: true,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    createdAt: timestamp({
      ...fieldOptions,
      defaultValue: { kind: "now" },
    }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});
