import { graphql } from "@keystone-6/core";
import { virtual } from "@keystone-6/core/fields";

export const vvv = virtual({
  field: graphql.field({
    type: graphql.JSON,
    async resolve(item: any, args, context) {
      const vehicle = await context.query.Vehicle.findOne({
        where: { id:  item.id },
        query: ''
      });
      // console.log(Vehicle);
      // console.log(context?.session?.itemId);
      return vehicle;
    },
  }),
  ui: {
     views: require.resolve('./report-field-view.tsx')
  },
});
