import {
  integer,
  relationship,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { fieldOptions, isSuperAdmin } from "../application/access";

const ownerFilter = ({ session, context, listKey, operation }) => {
  if (session.data.role === "admin") {
    return true;
  }
  return {
    user: {
      id: { equals: session?.itemId },
    },
  };
};

export const Bid = list({
  access: {
    operation: {
      query: ({ session }) => !!session?.itemId,
      create: ({ session }) => !!session?.itemId,
      update: isSuperAdmin,
      delete: isSuperAdmin,
    },
    filter: {
      query: ownerFilter,
    },
  },
  hooks: {
    validateInput: async ({ resolvedData, context, addValidationError }) => {
      const { amount } = resolvedData;
      const bidVehicle = await context.query.Vehicle.findOne({
        where: { id: resolvedData?.bidVehicle?.connect?.id },
        query: "id currentBidAmount bidTimeExpire event { startDate } ",
      });
      console.log("bidVehicle", bidVehicle);
      console.log("resolvedData", resolvedData);
      if (!bidVehicle) {
        addValidationError("vehicle not found");
      }
      if (bidVehicle.bidTimeExpire < new Date()) {
        addValidationError("Auction has ended");
      }
      if (bidVehicle.event.startDate > new Date()) {
        addValidationError("Auction yet to start");
      }
      if (
        !bidVehicle.currentBidAmount ||
        bidVehicle.currentBidAmount >= amount
      ) {
        addValidationError(
          "Bid Amount smaller than current bid amount, Current Bid Amount: " +
            bidVehicle.currentBidAmount
        );
      }
    },
    resolveInput: async ({ resolvedData, context, operation }) => {
      if (operation !== "create") {
        return resolvedData;
      }
      const [bidVehicle, user] = await Promise.all([
        context.query.Vehicle.findOne({
          where: { id: resolvedData?.bidVehicle?.connect?.id },
          query: ` registrationNumber `,
        }),
        context.query.User.findOne({
          where: { id: resolvedData?.user?.connect?.id },
          query: ` username `,
        }),
      ]);
      return {
        ...resolvedData,
        name: `${user?.username} : ${bidVehicle?.registrationNumber}`,
      };
    },
  },
  fields: {
    name: text({
      ui: {
        createView: { fieldMode: "hidden" },
      },
    }),
    amount: integer({}),
    user: relationship({
      ref: "User.quotedBids",
      many: false,
    }),

    bidVehicle: relationship({
      ref: "Vehicle.userVehicleBids",
      many: false,
    }),
    createdAt: timestamp({
      ...fieldOptions,
      defaultValue: { kind: "now" },
    }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
});
