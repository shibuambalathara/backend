import { graphql } from "@keystone-6/core";
import { virtual } from "@keystone-6/core/fields";

export const vehicleEventStatus = virtual({
  field: graphql.field({
    type: graphql.enum({
      name: "vehicleEventStatus",
      values: graphql.enumValues(["completed", "upcoming", "live", "abnormal"]),
    }),
    async resolve(item: any) {
      if (
        new Date(item?.bidStartTime) > new Date() &&
        new Date(item?.bidEndTime) > new Date()
      ) {
        return "completed";
      }
      if (
        new Date(item?.bidStartTime) < new Date() &&
        new Date(item?.bidEndTime) < new Date()
      ) {
        return "upcoming";
      }
      if (
        new Date(item?.bidStartTime) <= new Date() &&
        new Date(item?.bidEndTime) >= new Date()
      ) {
        return "live";
      }
      return "abnormal";
    },
  }),
  // ui: {
  //   query: ` myBidRank `,
  // },
});
