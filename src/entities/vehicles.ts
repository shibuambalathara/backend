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
    startBidAmount: float({
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
        itemView: { fieldMode: isAdminEdit },
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
    quoteIncreament: integer({
      defaultValue: 1000,
    }),
    make: text(),
    model: text(),
    varient: text(),
    categoty: text(),
    fuel: text(),
    type: text({}),
    rcStatus: text({}),
    yearOfManufacture: integer({}),
    ownership: integer(),
    mileage: integer(),
    kmReading: integer(),
    insuranceStatus: text(),
    yardLocation: text(),
    startPrice: float(),
    reservePrice: float(),
    repoDt: timestamp(),
    veicleLocation: text(),
    vehicleRemarks: text(),
    auctionManager: text(),
    parkingCharges: text({}),
    insurance: text(),
    insuranceValidTill: timestamp(),
    tax: text(),
    taxValidityDate: timestamp(),
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
    inspectionLink: text(),
    autobseContact: text(),
    autobse_contact_person: text(),
    vehicleCondition: text(),
    powerSteering: text(),
    shape: text(),
    color: text(),
    state: text(),
    city: text(),
    area: text(),
    paymentTerms: text(),
    dateOfRegistration: timestamp(),
    hypothication: text(),
    climateControl: text(),
    doorCount: integer(),
    gearBox: text(),
    buyerFees: text(),
    rtoFine: text(),
    parkingRate: text(),
    approxParkingCharges: text(),
    clientContactPerson: text(),
    clientContactNo: text(),
    additionalRemarks: text(),
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
