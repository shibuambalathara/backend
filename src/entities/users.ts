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
} from "../application/access";
import { vehicleBuyingLimitField } from "../lib/vehicle-buying-limit.field";

const ownerFilter = ({ session, context, listKey, operation }) => {
  if (session?.data?.role === "admin") {
    return true;
  }
  return { id: { equals: session?.itemId } };
};

export const User = list({
  access: {
    operation: {
      query: ({ session }) => !!session,
      create: () => true, //!session?.itemId || isSuperAdmin({ session }),
      update: ({ session }) => !!session,
      delete: ({ session }) => !!session,
    },
    filter: {
      query: ownerFilter,
      update: ownerFilter,
      delete: ownerFilter,
    },
  },
  ui: {
    labelField: "username",
    hideCreate: isNotAdmin,
    listView: {
      initialColumns: [
        "mobile",
        "dealerId",
        "status",
        "firstName",
        "lastName",
        "email",
        "createdAt",
      ],
      initialSort: { field: "createdAt", direction: "DESC" },
    },
  },
  fields: {
    idNo: integer({
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
    dealerId: text({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        listView: { fieldMode: "read" },
      },
    }),
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
    businessName: text({}),
    category: relationship({
      ref: "EventType.users",
      many: true,
    }),
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
    currentVehicleBuyingLimit: vehicleBuyingLimitField,
    vehicleBuyingLimit: integer({
      defaultValue: 0,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" },
        listView: { fieldMode: "hidden" },
      },
    }),
    specialVehicleBuyingLimit: integer({
      defaultValue: 0,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" },
        listView: { fieldMode: "hidden" },
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
    state: text({}),
    states: relationship({
      ref: "State.users",
      many: true,
    }),
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
    bannedSellers: relationship({
      ref: "Seller.bannedUsers",
      many: true,
    }),
    createdAt: timestamp({ ...fieldOptions, defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});
