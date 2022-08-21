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
        new Date(item?.bidStartTime).getTime() > new Date().getTime() &&
        new Date(item?.bidEndTime).getTime() > new Date().getTime()
      ) {
        return "completed";
      }
      if (
        new Date(item?.bidStartTime).getTime() < new Date().getTime() &&
        new Date(item?.bidEndTime).getTime() < new Date().getTime()
      ) {
        return "upcoming";
      }
      if (
        new Date(item?.bidStartTime).getTime() <= new Date().getTime() &&
        new Date(item?.bidEndTime).getTime() >= new Date().getTime()
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
