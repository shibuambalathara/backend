import {
  checkbox,
  file,
  integer,
  relationship,
  select,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { excelReportEDownload } from "../lib/report-field";
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
    resolveInput: async ({
      resolvedData,
      context,
      operation,
      item,
      inputData,
    }) => {
      if (operation === "create" && resolvedData.eventCategory === "open")
        resolvedData.bidLock = "locked";
      // for saving the pause time
      // console.log({D: new Date(item.pauseDate as Date).getTime()})
      if (
        operation === "update" &&
        item.status === "pause" &&
        resolvedData.status !== "pause"
      ) {
        const t = item.pauseDate
          ? new Date().getTime() - new Date(item.pauseDate as Date).getTime()
          : new Date().getTime();
        resolvedData.pausedTotalTime = (item.pausedTotalTime as number) + t;
      }
      // when the statuse setting to the pause set cuurent time to the pauseDate
      if (operation === "update" && resolvedData.status === "pause") {
        resolvedData.pauseDate = new Date();
      }
      return resolvedData;
    },
    afterOperation: async ({
      context,
      operation,
      resolvedData,
      originalItem,
    }) => {
      if (operation !== "update") {
        return;
      }
      if (originalItem.eventCategory !== "open") {
        return;
      }
      const event = await context.query.Event.findOne({
        where: { id: originalItem.id.toString() },
        query: `startDate pausedTotalTime vehiclesCount eventCategory vehicleLiveTimeIn gapInBetweenVehicles`,
      });
      const endDate = new Date(
        new Date(event.startDate).getTime() +
          event.pausedTotalTime +
          event.vehiclesCount * event.vehicleLiveTimeIn * 60000 +
          (event.vehiclesCount - 1) * event.gapInBetweenVehicles * 1000
      );
      await context.prisma.event.update({
        where: { id: originalItem.id.toString() },
        data: {
          endDate: endDate,
        },
      });
      if (
        operation === "update" &&
        originalItem.status === "pause" &&
        resolvedData.status !== "pause"
      ) {
        console.log({
          resolvedData,
          originalItem
        });
        const t = (originalItem.pauseDate
          ? new Date().getTime() - new Date(originalItem.pauseDate as Date).getTime()
          : new Date().getTime()) ;
          // update the vehicle end time
        await context.prisma.$executeRawUnsafe(`UPDATE "Vehicle" set "bidTimeExpire" = "bidTimeExpire" + ${t} * INTERVAL '1 MICROSECOND', "bidStartTime" = "bidStartTime" + ${t} * INTERVAL '1 MICROSECOND' WHERE "event" = '${originalItem.id}' `);
      }
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
    eventCategory: select({
      options: [
        { value: "online", label: "Online Auction" },
        { value: "open", label: "Open Auction" },
      ],
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
    pauseDate: timestamp({
      validation: {},
      ui: {
        itemView: {
          fieldMode: "read",
        },
        listView: {
          fieldMode: "read",
        },
      },
    }),
    pausedTotalTime: integer({
      defaultValue: 0,
      ui: {
        itemView: {
          fieldMode: "read",
        },
        listView: {
          fieldMode: "read",
        },
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

    Report: excelReportEDownload,
  
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
        { label: "Pause", value: "pause" },
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
    termsAndConditions: text({
      ui: {
        itemView: { fieldMode: isAdminEdit },
        displayMode: "textarea",
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
      label: "Extra time in minutes",
      defaultValue: 2,
    }),

    vehicleLiveTimeIn: integer({
      label: "Open Auction Vehicle Live Time in minutes",
      defaultValue: 0,
    }),

    gapInBetweenVehicles: integer({
      label:
        "Open Auction Gap in between vehicles in seconds / Online End Time Increase in Minuts",
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
