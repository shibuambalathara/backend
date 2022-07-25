import {
  integer,
  relationship,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import {
  fieldOptions,
  isAdminEdit,
  isNotAdmin,
  isSignedIn,
  isSuperAdmin,
} from "../application/access";

const ownerFilter = ({ session, context, listKey, operation }) => {
  if (session.data.role === "admin") {
    return true;
  }
  return { user: { id: { equals: session?.itemId } } };
};

export const VehicleUser = list({
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
  ui: {
    hideCreate: isNotAdmin,
    hideDelete: isNotAdmin,
    itemView: { defaultFieldMode: isAdminEdit },
  },
  hooks: {
    validateInput: async ({ resolvedData, context, addValidationError }) => {
      const vehicleUserCount = await context.query.VehicleUser.count({
        where: {
          event: { id: { equals: resolvedData?.vehicle?.connect?.id } },
          user: { id: { equals: resolvedData?.user?.connect?.id } },
        },
      });

      if (vehicleUserCount) {
        addValidationError("Duplicate Vehicle User Entry");
      }

      const user = await context.query.user.findOne({
        where: {
          event: { id: { equals: resolvedData?.user?.connect?.id } },
          query: `endDate emdBalance`,
        },
      });
        if(user.emdBalance >= 10000 ){
          addValidationError("Insufficient EMD Balance");
        }
    },
    resolveInput: async ({ resolvedData, context, operation }) => {
      if (operation !== "create") {
        return resolvedData;
      }
      const [vehicle, user] = await Promise.all([
        context.query.Vehcle.findOne({
          where: { id: resolvedData?.vehicle?.connect?.id },
          query: "id registrationNumber events { noOfBids }",
        }),
        context.query.User.findOne({
          where: { id: resolvedData?.user?.connect?.id },
          query: `id firstName lastName username`,
        }),
      ]);
      return {
        ...resolvedData,
        name: `${user?.firstName ?? user?.username}: ${vehicle?.registrationNumber}`,
        remainingBids: vehicle?.event?.noOfBids,
      };
    },
    afterOperation: async ({ context, operation, resolvedData }) => {
      if (operation !== "create") {
        return
      }
      await context.prisma.user.update({
        where: {
          id: resolvedData?.user?.connect?.id,
        },
        data: {
          emdBalance: resolvedData?.user?.emdBalance - 10000,
        }
      })
    }
  },
  fields: {
    name: text({
      ui: {
        createView: { fieldMode: "hidden" },
      },
    }),
    vehicle: relationship({
      ref: "Vehicle.vehicleUsers",
      many: false,
    }),
    user: relationship({
      ref: "User.bidEnabledVehicles",
      many: false,
    }),
    remainingBids: integer({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: {
          fieldMode: "read",
        },
      },
      access:{
        read: isSignedIn,
        create: isSuperAdmin,
        update: isSuperAdmin,
      }
    }),
    bidCountUpdates: relationship({
      ref: "BidCountUpdate.vehicleUser",
      many: true,
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