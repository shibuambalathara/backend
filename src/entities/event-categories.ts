import {
      relationship,
      text,
      timestamp,
    } from "@keystone-6/core/fields";
    import { list } from "@keystone-6/core";
    import { fieldOptions } from "../application/access";
    
    export const EventCategory = list({
      access: {
        operation: {
          query:  ()=>true,
          create: ({ session }) => !!session.itemId,
          update: ({ session }) => !!session.itemId,
          delete: ({ session }) => !!session.itemId,
        },
      },
      fields: {
        name : text({
            validation: {
                isRequired: true,
            }
        }),
        events: relationship({
            ref: "Event.eventCategory",
            many: true,
            ui:{
              createView :{ fieldMode : "hidden"},
              itemView :{ fieldMode: "read"},
            }
        }),
        
        createdAt: timestamp({ ...fieldOptions, defaultValue: { kind: "now" } }),
        updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
      },
    });