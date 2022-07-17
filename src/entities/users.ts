import {
  image,
  password,
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

const ownerFilter = ({ session, context, listKey, operation }) => {
  if (session.data.role === "admin") {
    return true;
  }
  return { id: { equals: session?.itemId } };
};

export const User = list({
  access: {
    operation: {
      query: () => true, //!!session?.itemId,
      create: ({ session }) => !session?.itemId || isSuperAdmin(session),
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
      access: {
        read: isSignedIn,
        create: isSuperAdmin,
        update: isSuperAdmin,
      },
    }),
    password: password({
      // validation: {
      //   isRequired: true,
      // },
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
      access: {
        read: isSignedIn,
        create: isSuperAdmin,
        update: isSuperAdmin,
      },
    }),

    // role: relationship({
    //   ref: "Role.assignedTo",
    //   many: false,
    //   access: {
    //     read: isSignedIn,
    //     create: isSuperAdmin,
    //     update: isSuperAdmin,
    //   },
    //   ui: {
    //     itemView: {
    //       fieldMode: (args) => (isSuperAdmin(args) ? "edit" : "read"),
    //     },
    //   },
    // }),
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
      access: {
        read: isSignedIn,
        create: isSuperAdmin,
        update: isSuperAdmin,
      },
    }),
    userEvents: relationship({
      ref: "EventUser.user",
      many: true,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    bidCountUpdates: relationship({
      ref: "BidCountUpdate.createdBy",
      many: true,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    activeBids: relationship({
      ref: "Bid.currentBidUser",
      many: true,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    quotedBids: relationship({
      ref: "UserBid.user",
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
