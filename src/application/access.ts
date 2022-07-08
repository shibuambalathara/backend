import { TimestampFieldConfig } from "@keystone-6/core/fields";
import { BaseListTypeInfo } from "@keystone-6/core/types";

export const fieldOptions: TimestampFieldConfig<BaseListTypeInfo> = {
  access: {
    read: () => true,
    create: () => false,
    update: () => false,
  },
  ui: {
    createView: {
      fieldMode: "hidden",
    },
    itemView: {
      fieldMode: "read",
    },
  },
  graphql: { omit: ["update", "create"] },
};