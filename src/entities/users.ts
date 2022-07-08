import {
  image,
  password,
  relationship,
  select,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { fieldOptions } from "../application/access";

export const User = list({
  access: {
    operation: {
      query: () => true, //!!session.itemId,
      create: () => true, //session.itemId,
      update: ({ session }) => !!session.itemId,
      delete: ({ session }) => !!session.itemId,
    },
  },
  ui: {
    labelField: "firstName",
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
        { label: "Seller", value: "seller" },
        { label: "Dealer", value: "dealer" },
      ],
      defaultValue: "seller",
      ui: { displayMode: "segmented-control" },
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
    }),
    activeBids: relationship({
      ref: "Bid.currentBidUser",
      many: true,
    }),
    quotedBids: relationship({
      ref: "UserBid.user",
      many: true,
    }),
    createdAt: timestamp({ ...fieldOptions, defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});
