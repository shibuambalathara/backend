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
      const [bidVehicle, eventUser] = await Promise.all([
        context.query.Vehicle.findOne({
          where: { id: resolvedData?.bidVehicle?.connect?.id },
          query: "id currentBidAmount bidTimeExpire event { startDate } ",
        }),
        context.prisma.eventUser.findFirst({
          where: {
            event: { id: resolvedData?.event?.connect?.id },
            user: { id: resolvedData?.user?.connect?.id },
          },
        }),
      ]);
      if (eventUser.remainingBids <= 0) {
        addValidationError("No Bids Remaining");
      }
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
    afterOperation: async ({
      listKey,
      operation,
      inputData,
      originalItem,
      item,
      resolvedData,
      context,
    }) => {
      /**
       * 1. Update the remaining bids for the event User
       * 2 .Update the current bid amount for the vehicle
       * 3. Update the bid time expire for the vehicle if expire time with in 2 minutes
       */
      if (operation !== "create") {
        return;
      }
      const [eventUser, bidVehicle] = await Promise.all([
        context.prisma.eventUser.findFirst({
          where: {
            event: { id: resolvedData?.event?.connect?.id },
            user: { id: resolvedData?.user?.connect?.id },
          },
        }),
        context.query.Vehicle.findOne({
          where: { id: resolvedData?.bidVehicle?.connect?.id },
        }),
      ]);
      const durationInMinutes = 2; // 2 minutes
      const bidTimeExpire =
        bidVehicle.bidTimeExpire >=
        new Date(new Date().setMinutes(-durationInMinutes))
          ? new Date(bidVehicle.bidTimeExpire.setMinutes(durationInMinutes))
          : bidVehicle.bidTimeExpire;
      await Promise.all([
        context.prisma.eventUser.update({
          where: { id: eventUser.id },
          data: {
            remainingBids: eventUser.remainingBids - 1,
          },
        }),
        context.prisma.Vehicle.update({
          where: { id: resolvedData?.bidVehicle?.connect?.id },
          data: {
            currentBidAmount: resolvedData?.amount,
            bidTimeExpire: bidTimeExpire,
          },
        }),
      ]);
    },
  },
  fields: {
    name: text({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
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
