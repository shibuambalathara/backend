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
      update: () => false,
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
    afterOperation: async ({ context, operation, resolvedData }) => {
      if (operation !== "update") {
        return;
      }
      // await context.prisma.vehicle.updateMany({
      //   where: {
      //     event: { id: resolvedData?.id },
      //   },
      //   data: {
      //     bidTimeExpire: resolvedData?.endDate,
      //   },
      // });
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
    eventCategory: relationship({
      ref: "EventCategory.events",
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
        itemView: { fieldMode: "read" },
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

    duration: integer({
      label: "Time extending before Duration in minutes",
      defaultValue: 2,
    }),

    addingBidTime: integer({
      label: "Adding bid time in minutes",
      defaultValue: 2,
    }),

    vehicleExpireTimeIncrement: integer({
      label: "Vehicle Expire Time Increment in minutes",
      defaultValue: 0,
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