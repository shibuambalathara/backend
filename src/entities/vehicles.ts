import {
  float,
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
  isSignedIn,
  isSuperAdmin,
} from "../application/access";
import { bidRank } from "../lib/bid-rank.field";
import { vehicleEventStatus } from "../lib/vehicle-event-status.field";
import { totalBids } from "../lib/total-bids.field";

const ownerFilter = ({ session, context, listKey, operation }) => {
  if (session?.data?.status === "active") {
    return true;
  }
  return false;
};

export const Vehicle = list({
  access: {
    operation: {
      query: isSignedIn,
      create: isSuperAdmin,
      update: isSignedIn,
      delete: isSuperAdmin,
    },
    filter: {
      query: ownerFilter,
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData, context, operation, item }) => {
      if (operation === "update") {
        if (context.session?.data?.role === "admin") {
          return resolvedData;
        } else {
          console.log("resolvedData", resolvedData);
          return {
            bidAmountUpdate: resolvedData?.bidAmountUpdate,
          };
        }
      }
      if (operation !== "create") {
        return resolvedData;
      }
      const event = await context.query.Event.findOne({
        where: { id: resolvedData?.event?.connect?.id },
        query: `endDate`,
      });
      resolvedData.bidTimeExpire =
        resolvedData?.bidTimeExpire ?? event?.endDate;
      return resolvedData;
    },
  },
  ui: {
    labelField: "registrationNumber",
    hideCreate: isNotAdmin,
    hideDelete: isNotAdmin,
    itemView: { defaultFieldMode: isAdminEdit },
    createView: { defaultFieldMode: isAdminCreate },
  },
  fields: {
    vehicleIndexNo: integer({
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
    registrationNumber: text({
      validation: {
        isRequired: true,
      },
      isIndexed: true,
    }),
    bidTimeExpire: timestamp({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
      validation: { isRequired: true },
    }),
    bidStartTime: timestamp({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
      validation: { isRequired: true },
    }),
    bidAmountUpdate: integer({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: isAdminEdit },
      },
      access: {
        update: isSignedIn,
      },
    }),
    currentBidAmount: integer({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
      defaultValue: 0,
    }),
    myBidRank: bidRank,
    totalBids: totalBids,
    startBidAmount: integer({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
      defaultValue: 0,
    }),
    currentBidUser: relationship({
      ref: "User.activeBids",
      many: false,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    event: relationship({
      ref: "Event.vehicles",
      many: false,
      ui: {
        createView: { fieldMode: "edit" },
        itemView: { fieldMode: "read" },
      },
    }),
    vehicleEventStatus: vehicleEventStatus,

    bidStatus: select({
      type: "enum",
      defaultValue: "pending",
      options: ["pending", "approved", "fulfilled", "declined"],
      ui: {
        createView: { fieldMode: isAdminCreate },
        itemView: { fieldMode: "read" },
      },
    }),
    userVehicleBids: relationship({
      ref: "Bid.bidVehicle",
      many: true,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    loanAgreementNo: text({
      validation: {
        isRequired: true,
      },
    }),
    registeredOwnerName: text({}),
    make: text(),
    model: text(),
    varient: text(),
    categoty: text(),
    fuel: select({
      type: "enum",
      options: ["diesel", "petrol", "cng", "lpg", "electric"],
    }),
    type: text({}),
    rcStatus: text({}),
    yearOfManufacture: integer({}),
    ownership: integer(),
    kmReading: integer(),
    insuranceStatus: text(),
    yardLocation: text(),
    startPrice: float(),
    reservePrice: float(),
    repoDt: integer(),
    veicleLocation: text(),
    vehicleRemarks: text(),
    auctionManager: text(),
    actionManager: text(),
    sellerName: text(),
    parkingCharges: text({}),
    insurance: text(),
    insuranceValidTill: text(),
    tax: text(),
    fitness: text(),
    permit: text(),
    fitnessPermit: text({}),
    engineNo: text({}),
    chassisNo: text(),
    frontImage: text(),
    backImage: text(),
    leftImage: text({}),
    rightImage: text(),
    image5: text({}),
    image6: text({}),
    image7: text(),
    image8: text(),
    image9: text(),
    image10: text(),
    image11: text(),
    image12: text(),
    watchedBy: relationship({
      ref: "User.watchList",
      many: true,
    }),
    ExcelFile: relationship({
      ref: "ExcelUpload.vehicles",
      many: false,
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
