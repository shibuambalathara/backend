import {
      relationship,
      text,
      timestamp,
    } from "@keystone-6/core/fields";
    import { list } from "@keystone-6/core";
    import { fieldOptions, isNotAdmin, isSuperAdmin } from "../application/access";

    export const Seller = list({
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
        contactPerson: text({
          validation: {
           
          },

        }),
        GSTNumbber: text({
          validation: {
           
          },
          
        }),
       billingContactPerson: text({
          validation: {
           
          },
          
        }),
       mobile : text({
          validation: {
          
          },
          
        }),
        nationalHead: text({
          validation: {
           
          },
          
        }),
        vehicleCategory:relationship({
          ref:"EventType.seller",
          many:true
        }),
        
        events: relationship({
          ref: "Event.seller",
          many: true,
          ui: {
            createView: { fieldMode: "hidden" },
            itemView: { fieldMode: "read" },
          },
        }),

        bannedUsers: relationship({
          ref: "User.bannedSellers",
          many: true,
        }),

        createdAt: timestamp({
          ...fieldOptions,
          defaultValue: { kind: "now" },
        }),
        updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
      },
    });