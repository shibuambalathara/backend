import {
  image,
  password,
  relationship,
  select,
  text,
  timestamp,
  integer,
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

const ownerFilter = ({ session, context, listKey, operation }) => {
  if (session?.data?.role === "admin") {
    return true;
  }
  return { id: { equals: session?.itemId } };
};

export const User = list({
  access: {
    operation: {
      query: isSignedIn,
      create: () => true, //!session?.itemId || isSuperAdmin({ session }),
      update: isSignedIn,
      delete: isSuperAdmin,
    },
    filter: {
      query: ownerFilter,
      update: ownerFilter,
    },
  },
  ui: {
    labelField: "username",
    hideCreate: isNotAdmin,
  },
  fields: {
    firstName: text({}),
    lastName: text({}),
    email: text({
      // Indexed: "unique",
      access: {
        read: () => true,
      },
    }),
    username: text({
      isIndexed: "unique",
    }),
    phone: text({}),
    mobile: text({
      isIndexed: "unique",
      validation: {
        isRequired: true,
      },
      ui: {
        createView: { fieldMode: isAdminCreate },
        itemView: { fieldMode: isAdminEdit },
      },
    }),
    password: password({
      // validation: {
      //   isRequired: true,
      // },
    }),
    // vehicleBuyingLimit: vehicleBuyingLimitField,
    vehicleBuyingLimit: integer({
      defaultValue: 0,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    specialVehicleBuyingLimit: integer({
      defaultValue: 0,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    image: image({ storage: "local_images" }),
    pancard: image({ storage: "local_images" }),
    pancardNo: text({}),
    idProof: image({ storage: "local_images" }),
    idProofBack: image({ storage: "local_images" }),
    idProofType: select({
      type: "enum",
      options: [
        { label: "Aadhar", value: "aadhar" },
        { label: "Driving License", value: "drivingLicense" },
        { label: "Passport", value: "passport" },
      ],
    }),
    idProofNo: text({}),
    dealership: image({ storage: "local_images" }),
    country: text({}),
    state: text({}),
    city: text({}),
    role: select({
      type: "enum",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Staff", value: "staff" },
        { label: "Seller", value: "seller" },
        { label: "Dealer", value: "dealer" },
      ],
      defaultValue: "dealer",
      ui: {
        displayMode: "segmented-control",
        createView: { fieldMode: isAdminCreate },
        itemView: { fieldMode: isAdminEdit },
      },
    }),
    bidEnabledVehicles: relationship({
      ref: "VehicleUser.user",
      many: true,
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
    emdBalance: integer({
      defaultValue: 0,
    }),
    watchList: relationship({
      ref: "Vehicle.watchedBy",
      many: true,
    }),
    emdUpdates: relationship({
      ref: "EmdUpdate.user",
      many: true,
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
    payments: relationship({
      ref: "Payment.user",
      many: true,
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
    emdUpdatesByAdmin: relationship({
      ref: "EmdUpdate.createdBy",
      many: true,
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
    status: select({
      type: "enum",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Blocked", value: "blocked" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      defaultValue: "pending",
      ui: {
        displayMode: "segmented-control",
        createView: { fieldMode: isAdminCreate },
        itemView: { fieldMode: isAdminEdit },
      },
    }),
    states: relationship({
      ref: "State.users",
      many: true,
    }),
    // bidCountUpdates: relationship({
    //   ref: "BidCountUpdate.createdFor",
    //   many: true,
    //   ui: {
    //     createView: { fieldMode: "hidden" },
    //     itemView: { fieldMode: "read" },
    //   },
    // }),
    activeBids: relationship({
      ref: "Vehicle.currentBidUser",
      many: true,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    quotedBids: relationship({
      ref: "Bid.user",
      many: true,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    createdAt: timestamp({ ...fieldOptions, defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});
