import {
  integer,
  relationship,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import {
  fieldOptions,
  isAdminCreate,
  isAdminEdit,
  isSuperAdmin,
} from "../application/access";

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
      try {
        const { amount } = resolvedData;
        const userId =
          context.session.data.role === "admin"
            ? resolvedData.user.connect.id
            : context.session.itemId;
        const [bidVehicle, bidCount, emdBalance] = await Promise.all([
          context.query.Vehicle.findOne({
            where: { id: resolvedData?.bidVehicle?.connect?.id },
            query: `id currentBidAmount bidTimeExpire event { startDate emdAmountPerBidVehicle noOfBids } `,
          }),
          context.query.Bid.count({
            where: {
              bidVehicle: {
                id: { equals: resolvedData?.bidVehicle?.connect?.id },
              },
              user: { id: { equals: userId } },
            },
          }),
          context.query.User.findOne({
            where: { id: userId },
            query: `emdBalance`,
          }),
          // context.prisma.bid.groupBy({
          //   by: ["bidVehicleId"],
          //   where: {
          //     userId: resolvedData.user.connect.id,
          //   },
          //   _count: true,
          // }),
        ]);

        if (!bidVehicle) {
          addValidationError("vehicle not found");
        }
        if (new Date(bidVehicle.bidTimeExpire) < new Date()) {
          addValidationError("Auction has ended");
        }
        if (new Date(bidVehicle.event.startDate) > new Date()) {
          addValidationError("Auction yet to start");
        }
        if (bidCount >= bidVehicle.event.noOfBids) {
          addValidationError("No Bids Left");
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

        if (
          !bidCount &&
          bidVehicle.event.emdAmountPerBidVehicle > emdBalance?.emdBalance
        ) {
          addValidationError(
            "Insufficient EMD Balance, minimum required EMD Balance: " +
              bidVehicle.event.emdAmountPerBidVehicle
          );
        }
      } catch (e) {
        console.log("e: ", e);
        addValidationError(e.message);
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
          where: {
            id: resolvedData?.user?.connect?.id ?? context?.session?.itemId,
          },
          query: ` username `,
        }),
      ]);
      resolvedData.name = `${user?.username} : ${bidVehicle?.registrationNumber}`
      if (context?.session?.data?.role !== "admin") {
        resolvedData.user = { connect: { id: context?.session?.itemId } }
      }
      return resolvedData
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
       * 1. Update user emdBalance via emd updates if it is first bid //
       * 2 .Update the current bid amount for the vehicle
       * 3. Update the bid time expire for the vehicle if
       *    expire time with in 2 minutes
       * 4. Update the current bid User for the vehicle
       */
      if (operation !== "create") {
        return;
      }
      const [bidVehicle] = await Promise.all([
        // context.prisma.vehicleUser.findFirst({
        //   where: {
        //     vehicle: { id: resolvedData?.vehicle?.connect?.id },
        //     user: { id: resolvedData?.user?.connect?.id },
        //   },
        // }),
        context.query.Vehicle.findOne({
          where: { id: resolvedData?.bidVehicle?.connect?.id },
          query: `bidTimeExpire`,
        }),
      ]);
      const durationInMinutes = 2 * 60000; // 2 minutes
      const bidTimeExpire =
        new Date(bidVehicle.bidTimeExpire).getTime() - durationInMinutes <=
        new Date().getTime()
          ? new Date(
              new Date(bidVehicle.bidTimeExpire).getTime() + durationInMinutes
            )
          : new Date(bidVehicle.bidTimeExpire);
      console.log("bidTimeExpire:", bidTimeExpire);
      console.log("bidTimeExpire Old :", bidVehicle.bidTimeExpire);
      await Promise.all([
        // context.prisma.vehicleUser.update({
        //   where: { id: vehicleUser.id },
        //   data: {
        //     remainingBids: vehicleUser.remainingBids - 1,
        //   },
        // }),
        context.prisma.vehicle.update({
          where: { id: resolvedData?.bidVehicle?.connect?.id },
          data: {
            currentBidAmount: resolvedData?.amount,
            bidTimeExpire: bidTimeExpire,
            currentBidUser: {
              connect: { id: resolvedData?.user?.connect?.id },
            },
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
      ui: {
        createView: { fieldMode: isAdminCreate },
        itemView: { fieldMode: isAdminEdit },
      },
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
