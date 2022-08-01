import {
  integer,
  relationship,
  select,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { document } from "@keystone-6/fields-document";
import { list } from "@keystone-6/core";
import {
  fieldOptions,
  isAdminCreate,
  isAdminEdit,
  isNotAdmin,
  isSuperAdmin,
} from "../application/access";

export const Event = list({
  ui: {
    hideCreate: isNotAdmin,
    hideDelete: isNotAdmin,
    itemView: { defaultFieldMode: isAdminEdit },
    createView: { defaultFieldMode: isAdminCreate },
  },
  access: {
    operation: {
      query: () => true,
      create: isSuperAdmin,
      update: isSuperAdmin,
      delete: isSuperAdmin,
    },
  },
  hooks: {
    validateInput: async ({ resolvedData, context, operation, addValidationError,  }) => {
      if(new Date(resolvedData.endDate) < new Date()){
        addValidationError("End date must be in the future");
      }
    },
    resolveInput: async ({ resolvedData, context, operation }) => {
      if (operation !== "create" && operation !== "update") {
        return resolvedData;
      }
      console.log("resolveInput: ", resolvedData);
      const [category, seller, location] = await Promise.all([
        context.db.EventCategory.findOne({
          where: { id: resolvedData?.eventCategory?.connect?.id },
        }),
        context.db.Seller.findOne({
          where: { id: resolvedData?.seller?.connect?.id },
        }),
        context.db.Location.findOne({
          where: { id: resolvedData?.location?.connect?.id },
        }),
      ]);
      return {
        ...resolvedData,
        name: `${seller?.name} - ${
          category?.name
        } on ${resolvedData?.startDate?.toLocaleDateString()} to ${resolvedData?.endDate?.toLocaleDateString()} @ ${
          location?.name
        }`,
      };
    },
    afterOperation: async ({ context, operation, resolvedData }) => {
      if (operation !== "update") {
        return
      }
      await context.prisma.vehicle.updateMany({
        where: {
          event: { id: resolvedData?.id },
        },
        data: {
          bidTimeExpire: resolvedData?.endDate,
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
    seller: relationship({
      ref: "Seller.events",
      many: false,
    }),

    eventType: relationship({
      ref: "EventType.events",
      many: true,
    }),
    eventCategory: relationship({
      ref: "EventCategory.events",
    }),

    location: relationship({
      ref: "Location.events",
    }),
    vehicles: relationship({
      ref: "Vehicle.event",
      many: true,
    }),
    startDate: timestamp({
      validation: {
        isRequired: true,
      },
    }),
    endDate: timestamp({
      validation: {
        isRequired: true,
      },
    }),
    noOfBids: integer({
      validation: {
        isRequired: true,
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
      defaultValue: "active",
      ui: { displayMode: "segmented-control" },
    }),
    ExcelFile: relationship({
      ref: "ExcelUpload.event",
      many: false,
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: isAdminEdit },
      },
    }),
    termsAndConditions: document({
      links: true,
      dividers: true, 
    }),
    createdAt: timestamp({ ...fieldOptions, defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
  },
  graphql: {
    cacheHint: { maxAge: 600 },
  },
});