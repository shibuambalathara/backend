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
  isSignedIn,
  isSuperAdmin,
} from "../application/access";

const ownerFilter = ({ session, context, listKey, operation }) => {
  if (session?.data?.role === "admin") {
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
      query: isSignedIn,
      create: isSignedIn,
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
          context?.session?.data?.role === "admin" && !! resolvedData?.user?.connect?.id
            ? resolvedData.user.connect.id
            : context?.session?.itemId;
        const [bidVehicle, bidCount, user, myBidMaxAmount] = await Promise.all([
          context.query.Vehicle.findOne({
            where: { id: resolvedData?.bidVehicle?.connect?.id },
            query: `id currentBidAmount startBidAmount bidTimeExpire currentBidUser { id } event { startDate status noOfBids seller { id name } isSpecialEvent bidLock location { state { name } } }`,
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
            query: `status currentVehicleBuyingLimit { vehicleBuyingLimit specialVehicleBuyingLimit } states { id name } bannedSellers { id }`,
          }),
          context.prisma.bid.findFirst({
            where: {
              bidVehicle: {
                id: { equals: resolvedData?.bidVehicle?.connect?.id },
              },
              user: { id: { equals: userId } },
            },
            orderBy: {
              amount: "desc",
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
        if (bidVehicle.event.status !== "active") {
          addValidationError("Auction not active");
        }
        if (bidCount >= bidVehicle.event.noOfBids) {
          addValidationError("No Bids Left");
        }
        if (
          !user?.states
            ?.map((s: { name: string }) => s?.name)
            ?.includes(bidVehicle?.event?.location?.state?.name)
        ) {
          addValidationError(
            "You are not allowed to bid on this vehicle in the state: " +
              bidVehicle?.event?.location?.state?.name
          );
        }
        if (Number(bidVehicle.startBidAmount) >= amount) {
          addValidationError(
            "Bid Amount smaller than start bid amount, Start Bid Amount: " +
              bidVehicle.startBidAmount
          );
        }
        if (
          user?.bannedSellers?.some((s) => s?.id === bidVehicle?.seller?.id)
        ) {
          addValidationError(
            "You are banned from bidding on this vehicle seller: " +
              bidVehicle?.seller?.name
          );
        }
        if (myBidMaxAmount && myBidMaxAmount?.amount >= amount) {
          addValidationError(
            "Bid Amount smaller than your previous bid amount: " +
              myBidMaxAmount?.amount
          );
        }
        
        if (
          bidVehicle.event.bidLock === "locked" &&
          bidVehicle.currentBidAmount >= amount
        ) {
          addValidationError(
            "Bid Amount smaller than current bid amount, Current Bid Amount: " +
              bidVehicle.currentBidAmount
          );
        }
        if (
          bidVehicle.currentBidUser?.id !== userId &&
          bidVehicle.event.isSpecialEvent &&
          user?.currentVehicleBuyingLimit?.specialVehicleBuyingLimit <= 0
        ) {
          addValidationError("Insufficient Buying Limit for Special Event");
        }
        if (
          bidVehicle.currentBidUser?.id !== userId &&
          !bidVehicle.event.isSpecialEvent &&
          user?.currentVehicleBuyingLimit?.vehicleBuyingLimit <= 0
        ) {
          addValidationError("Insufficient Buying Limit");
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
      resolvedData.name = `${user?.username} : ${bidVehicle?.registrationNumber}`;
      if (context?.session?.data?.role !== "admin") {
        resolvedData.user = { connect: { id: context?.session?.itemId } };
      }
      return resolvedData;
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
      if (operation === "delete") {
        /**
         * Note: We could'nt update the expire time on delete
         * replace the current bid user and amount with the
         * previous bid user and amount
         */
        console.log("originalItem: ", originalItem);
        console.log("item: ", item);
        console.log("resolvedData: ", resolvedData);
        const bid = await context.prisma.bid.findFirst({
          where: {
            user: {
              status: { equals: "active" },
            },
            bidVehicle: {
              id: { equals: originalItem?.bidVehicleId },
            },
          },
          select: {
            id: true,
            userId: true,
            amount: true,
          },
          orderBy: { amount: "desc" },
        });

        const userConnection = bid?.userId
          ? {
              connect: {
                id: bid?.userId,
              },
            }
          : {
              disconnect: true,
            };
        await context.prisma.vehicle.update({
          where: { id: originalItem?.bidVehicleId },
          data: {
            currentBidAmount: bid?.amount ?? 0,
            currentBidUser: userConnection,
          },
        });
      }
      if (operation === "create") {
        /**
         * 1. if the bid is higher than the current bid amount then
         *   i .Update the current bid amount for the vehicle
         *   ii. Update the bid time expire for the vehicle if
         *    expire time with in given minutes
         *   iii. Update the current bid User for the vehicle
         */
        const bidVehicle = await context.query.Vehicle.findOne({
          where: { id: resolvedData?.bidVehicle?.connect?.id },
          query: `bidTimeExpire currentBidAmount event { id extraTime isSpecialEvent extraTimeTrigerIn eventCategory } `,
        });

        if (bidVehicle.currentBidAmount < resolvedData.amount) {
          const durationInMinutes = (bidVehicle?.event?.extraTimeTrigerIn ?? 2) * 60000; // 2 minutes
          const addBidTime = (bidVehicle?.event?.extraTime ?? 2) * 60000; // 2 minutes
          const bidTimeExpire =
            (new Date(bidVehicle.bidTimeExpire).getTime() - durationInMinutes <=
              new Date().getTime() && bidVehicle.event.eventCategory !== "open")
              ? new Date(
                  new Date(bidVehicle.bidTimeExpire).getTime() + addBidTime
                )
              : new Date(bidVehicle.bidTimeExpire);
          
          await context.prisma.vehicle.update({
            where: { id: resolvedData?.bidVehicle?.connect?.id },
            data: {
              currentBidAmount: resolvedData?.amount,
              bidTimeExpire: bidTimeExpire,
              currentBidUser: {
                connect: { id: resolvedData?.user?.connect?.id },
              },
            },
          });
          if(new Date(bidVehicle.bidTimeExpire).getTime() - durationInMinutes <=
          new Date().getTime() && bidVehicle.event.eventCategory === "open"){
            await Promise.all([
              context.prisma.$executeRaw(`UPDATE "Vehicle" set "bidTimeExpire" = "bidTimeExpire" + ${bidVehicle?.event?.extraTime} * INTERVAL '1 MINUTE' WHERE event = '${bidVehicle.event.id}' AND AND "bidTimeExpire" > NOW()`),
              context.prisma.$executeRaw(`UPDATE "Event" set "endDate" = "endDate" + ${bidVehicle?.event?.extraTime} * INTERVAL '1 MINUTE' WHERE id = '${bidVehicle.event.id}'`)
            ]) 
          }
        }
      }
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
