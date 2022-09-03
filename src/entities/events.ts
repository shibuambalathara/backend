import {
  checkbox,
  file,
  integer,
  relationship,
  select,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { document } from "@keystone-6/fields-document";
import { list } from "@keystone-6/core";
import {
  fieldOptions,
  isAdminCreate,
  isAdminEdit,
  isNotAdmin,
  isSuperAdmin,
} from "../application/access";

export const Event = list({
  ui: {
    hideCreate: isNotAdmin,
    hideDelete: isNotAdmin,
    itemView: { defaultFieldMode: "read" },
    createView: { defaultFieldMode: isAdminCreate },
    labelField: "eventNo",
  },
  access: {
    operation: {
      query: () => true,
      create: isSuperAdmin,
      update: isSuperAdmin,
      delete: isSuperAdmin,
    },
  },
  hooks: {
    validateInput: async ({
      resolvedData,
      context,
      operation,
      addValidationError,
    }) => {
      if (new Date(resolvedData.endDate) < new Date()) {
        addValidationError("End date must be in the future");
      }
    },
    resolveInput: async ({ resolvedData, context, operation }) => {
      if (operation === "create" && resolvedData.eventCategory === "open")
        resolvedData.bidLock = "locked";
      return resolvedData;
    },
    afterOperation: async ({ context, operation, resolvedData, originalItem }) => {
      if (operation !== "update") {
        return;
      }
      if(originalItem.eventCategory !== "open"){
        return;
      }
      const event = await context.query.Event.findOne({
        where: { id: originalItem.id.toString() },
        query: `startDate vehiclesCount eventCategory vehicleLiveTimeIn gapInBetweenVehicles` 
      });
      const endDate = new Date(new Date(event.startDate).getTime()+ 
          event.vehiclesCount *  (event.vehicleLiveTimeIn + event.gapInBetweenVehicles) * 60000)
      await context.prisma.event.update({
        where: {id: originalItem.id.toString()},
        data: {
          endDate: endDate,
        },
      });
    },
  },

  fields: {
    eventNo: integer({
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
    seller: relationship({
      ref: "Seller.events",
      many: false,
      ui: {
        itemView: { fieldMode: isAdminEdit },
      },
    }),

    eventType: relationship({
      ref: "EventType.events",
      many: true,
      ui: {
        itemView: { fieldMode: isAdminEdit },
      },
    }),
    eventCategory: select({
      options: [
        { value: "online", label: "Online Auction" },
        { value: "open", label: "Open Auction" },
      ],
    }),

    location: relationship({
      ref: "Location.events",
      ui: {
        itemView: { fieldMode: isAdminEdit },
      },
    }),
    vehicles: relationship({
      ref: "Vehicle.event",
      many: true,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
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
        { label: "Stop", value: "stop" },
      ],
      defaultValue: "active",
      ui: {
        displayMode: "segmented-control",
        itemView: { fieldMode: isAdminEdit },
      },
    }),
    ExcelFile: relationship({
      ref: "ExcelUpload.event",
      many: false,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: isAdminEdit },
      },
    }),
    downloadableFile: file({
      storage: "local_files",
      ui: {
        itemView: { fieldMode: isAdminEdit },
      },
    }),
    termsAndConditions: document({
      links: true,
      dividers: true,
      ui: {
        itemView: { fieldMode: isAdminEdit },
      },
    }),
    createdAt: timestamp({ ...fieldOptions, defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
    /**
     * Bellow items for define the behavior of the event
     */
    bidLock: select({
      label: "Bids on Amount Smaller than the Winning bid amount is",
      type: "enum",
      defaultValue: "unlocked",
      options: ["locked", "unlocked"],
    }),
    isSpecialEvent: checkbox({
      defaultValue: false,
      label: "Is this a special event?",
    }),

    extraTimeTrigerIn: integer({
      label: "Extra time triger in minutes",
      defaultValue: 2,
    }),

    extraTime: integer({
      label: "Extra time triger in minutes",
      defaultValue: 2,
    }),

    vehicleLiveTimeIn: integer({
      label: "Open Auction Vehicle Live Time in minutes",
      defaultValue: 0,
    }),

    gapInBetweenVehicles: integer({
      label: "Open Auction Gap in between vehicles in seconds / Online End Time Increase",
      defaultValue: 0
    }),

    // specialEventBuyingLimitReducer: integer({
    //   defaultValue: 10000,
    //   validation: {
    //     isRequired: true,
    //   },
    // }),
  },
  graphql: {
    cacheHint: { maxAge: 600 },
  },
});