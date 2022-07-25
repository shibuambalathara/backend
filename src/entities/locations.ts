import {
      relationship,
      select,
      text,
      timestamp,
    } from "@keystone-6/core/fields";
    import { list } from "@keystone-6/core";
    import { fieldOptions, isNotAdmin, isSuperAdmin } from "../application/access";

    export const Location = list({
      access: {
        operation: {
          query: () => true,
          create: isSuperAdmin,
          update: isSuperAdmin,
          delete: isSuperAdmin,
        },
      },
      ui: {
        isHidden: isNotAdmin,
      },
      fields: {
        name: text({
          validation: {
            isRequired: true,
          },
        }),
        country: text({}),
        state: relationship({
          ref: "State.locations",
          many: false,
        }),
        city: text({}),
        events: relationship({
          ref: "Event.location",
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