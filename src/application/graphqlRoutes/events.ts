import { gql, graphQLSchemaExtension } from "@keystone-6/core";
import { Context } from ".keystone/types";
const graphql = String.raw;
export const extendGraphqlSchema = graphQLSchemaExtension<Context>({
  typeDefs: graphql`
    type Query {
      """
      Return all posts for a user from the last <days> days
      """
      liveEvents(
        where: EventWhereInput
        orderBy: [EventOrderByInput] = [{ createdAt: desc }]
        take: Int! = 10
        skip: Int! = 0
      ): [Event]
      """
      Compute statistics for a user
      """
      upcomingEvents(
        where: EventWhereInput
        orderBy: [EventOrderByInput] = [{ startDate: asc }]
        take: Int! = 10
        skip: Int! = 0
      ): [Event]
    }
  `,
  resolvers: {
    Query: {
      liveEvents: (root, { where, orderBy, skip, take }, context) => {
        // Note we use `context.db.Post` here as we have a return type
        // of [Post], and this API provides results in the correct format.
        // If you accidentally use `context.query.Post` here you can expect problems
        // when accessing the fields in your GraphQL client.
        return context.db.Event.findMany({
          where: {
            ...where,
            startDate: { lte: new Date().toISOString() },
            endDate: { gte: new Date().toISOString() },
            status: {
              equals: "active",
            },
          },
          orderBy,
          skip,
          take,
        });
      },
      upcomingEvents: (root, { where, orderBy, skip, take }, context) => {
        // Note we use `context.db.Post` here as we have a return type
        // of [Post], and this API provides results in the correct format.
        // If you accidentally use `context.query.Post` here you can expect problems
        // when accessing the fields in your GraphQL client.
        return context.db.Event.findMany({
          where: {
            ...where,
            startDate: { gt: new Date().toISOString() },
            status: {
              equals: "active",
            },
          },
          orderBy,
          skip,
          take,
        });
      },
    },
  },
});
