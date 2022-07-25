import {
  integer,
  relationship,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { fieldOptions, isAdminCreate, isAdminEdit, isSuperAdmin } from "../application/access";

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
      const [bidVehicle, vehicleUser] = await Promise.all([
        context.query.Vehicle.findOne({
          where: { id: resolvedData?.bidVehicle?.connect?.id },
          query: `id currentBidAmount bidTimeExpire event { startDate } `,
        }),
        context.prisma.vehicleUser.findFirst({
          where: {
            vehicle: { id: resolvedData?.vehicle?.connect?.id },
            user: { id: resolvedData?.user?.connect?.id?? context?.session?.itemId },
          },
        }),
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
      if (
        !bidVehicle.currentBidAmount ||
        bidVehicle.currentBidAmount >= amount
      ) {
        addValidationError(
          "Bid Amount smaller than current bid amount, Current Bid Amount: " +
            bidVehicle.currentBidAmount
        );
      }
      if (vehicleUser) {
        if(vehicleUser.remainingBids < 1)
        addValidationError("No Bids Left");
      }
      else{
        const newVehicleUser = await context.query.VehicleUser.createOne({
          data: {
            vehicle: { connect: { id: bidVehicle.id } },
            user: { connect: { id: context?.session?.itemId } },
          },
          query: `id remainingBids`,
        })
        if(newVehicleUser?.remainingBids < 1)
          addValidationError("No Bids Left");
        
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
          user: context?.session?.data?.role==="admin" ? resolvedData?.user : { connect: { id: context?.session?.itemId } },
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
       * 3. Update the bid time expire for the vehicle if
       *    expire time with in 2 minutes
       * 4. Update the current bid User for the vehicle
       */
      if (operation !== "create") {
        return;
      }
      const [vehicleUser, bidVehicle] = await Promise.all([
        context.prisma.vehicleUser.findFirst({
          where: {
            vehicle: { id: resolvedData?.vehicle?.connect?.id },
            user: { id: resolvedData?.user?.connect?.id },
          },
        }),
        context.query.Vehicle.findOne({
          where: { id: resolvedData?.bidVehicle?.connect?.id },
          query: `bidTimeExpire`,
        }),
      ]);
      const durationInMinutes = 2 * 60000;  // 2 minutes
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
        context.prisma.vehicleUser.update({
          where: { id: vehicleUser.id },
          data: {
            remainingBids: vehicleUser.remainingBids - 1,
          },
        }),
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
