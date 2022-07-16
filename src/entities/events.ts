import {
  integer,
  relationship,
  select,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { fieldOptions } from "../application/access";

export const Event = list({
  ui: {
    listView: {
      initialColumns: [
        "name",
        "seller",
        "eventCategory",
        "eventType",
        "location",
        "startDate",
      ],
    },
  },
  access: {
    operation: {
      query: () => true,
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
      const [category, seller, location] = await Promise.all([
        context.db.EventCategory.findOne({
          where: { id: resolvedData?.eventCategory?.connect?.id },
        }),
        context.db.Seller.findOne({
          where: { id: resolvedData?.seller?.connect?.id },
        }),
        context.db.Location.findOne({
          where: { id: resolvedData?.location?.connect?.id },
        }),
      ]);
      return {
        ...resolvedData,
        name: `${seller?.name} 
        - ${category?.name}
        on ${resolvedData?.startDate?.toDateString()}
        to ${resolvedData?.endDate?.toDateString()} 
        @ ${location?.name}`,
      };
    },
  },

  fields: {
    name: text({
      ui: {
        createView: { fieldMode: "hidden" },
      },
    }),
    seller: relationship({
      ref: "Seller.events",
      many: false,
    }),

    eventType: relationship({
      ref: "EventType.events",
    }),
    eventCategory: relationship({
      ref: "EventCategory.events",
    }),

    location: relationship({
      ref: "Location.events",
    }),
    vehicles: relationship({
      ref: "Vehicle.event",
      many: true,
    }),
    startDate: timestamp({
      validation: {
        isRequired: true,
      },
    }),
    endDate: timestamp({
      validation: {
        isRequired: true,
      },
    }),
    noOfBids: integer({
      validation: {
        isRequired: true,
      },
    }),
    status: select({
      type: "enum",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Blocked", value: "blocked" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      defaultValue: "active",
      ui: { displayMode: "segmented-control" },
    }),
    eventUsers: relationship({
      ref: "EventUser.event",
      many: true,
    }),
    bids: relationship({
      ref: "Bid.event",
      many: true,
    }),
    ExcelFile: relationship({
      ref: "ExcelUpload.event",
      many: false,
    }),
    createdAt: timestamp({ ...fieldOptions, defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
  graphql: {
    cacheHint: { maxAge: 600 },
  },
});