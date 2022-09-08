import { gql, graphQLSchemaExtension } from "@keystone-6/core";
import { Context } from ".keystone/types";
import { pubSub } from './websocket';
const graphql = String.raw;
export const extendGraphqlSchema = graphQLSchemaExtension<Context>({
  typeDefs: graphql`
    type Query {
      """
      Live Events
      """
      liveEvents(
        where: EventWhereInput
        orderBy: [EventOrderByInput] = [{ createdAt: desc }]
        take: Int! = 10
        skip: Int! = 0
      ): [Event]
      """
      Upcoming Events
      """
      upcomingEvents(
        where: EventWhereInput
        orderBy: [EventOrderByInput] = [{ startDate: asc }]
        take: Int! = 10
        skip: Int! = 0
      ): [Event]

      """
      complied Events
      """
      compliedEvents(
        where: EventWhereInput
        orderBy: [EventOrderByInput] = [{ startDate: asc }]
        take: Int! = 10
        skip: Int! = 0
      ): [Event]

      """
      Server Time
      """
      time: String

      """
      User Pan Cards Count
      """
      sudoUsersCount(
        where: UserWhereInput
      ): Int

      """
      Bid History for open auction
      """
      sudoBids(
        where: BidWhereInput
        orderBy: [BidOrderByInput] = [{ createdAt: desc }]
        take: Int! = 10
        skip: Int! = 0
      ): [BidHistory]
    }
    """ A custom Bid History for Vehicle """
    type BidHistory {
      id: ID!
      name: String
      amount: Int
      userId: String
      createdAt: DateTime
    }
    type Time {
      iso: String!
    }
    type Subscription {
      time: Time
      """
      New Live Bids
      """
      liveBid(id: ID!): Bid
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
            // endDate: { gte: new Date().toISOString() },
            status: {
              equals: "active",
            },
            OR: [
              {
                endDate: { gte: new Date().toISOString() },
                eventCategory: { equals: "open" },
              },
              {
                vehicles: {
                  some: {
                    bidTimeExpire: { gte: new Date().toISOString() },
                  },
                },
              },
            ],
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
      compliedEvents: (root, { where, orderBy, skip, take }, context) => {
        // Note we use `context.db.Post` here as we have a return type
        // of [Post], and this API provides results in the correct format.
        // If you accidentally use `context.query.Post` here you can expect problems
        // when accessing the fields in your GraphQL client.
        return context.db.Event.findMany({
          where: {
            ...where,
            endDate: { lt: new Date().toISOString() },
            status: {
              equals: "active",
            },
          },
          orderBy,
          skip,
          take,
        });
      },
      time: () => {
        return new Date().toISOString();
      },
      sudoBids: async (root, { where, orderBy, skip, take }, context) => {
        const sudoContext = context.sudo();
        const bids = await sudoContext.query.Bid.findMany({
          where: {
            ...where,
            bidVehicle: {
              ...where?.bidVehicle,
              event: {
                ...where?.bidVehicle?.event,
                eventCategory: {
                  equals: "open"
                }
              }
            }
          },
          orderBy,
          skip,
          take,
          query : `id 
          name
          amount
          createdAt
          user {
            dealerId
            username
          }`
        });
        return bids.map(bid => ({
          id: bid.id,
          amount: bid.amount,
          name: bid.name,
          userId: bid.user.dealerId ?? bid.user.username,
          createdAt: new Date(bid.createdAt) 
        }))
      },
      sudoUsersCount: (root, params, context) => {
        const sudoContext = context.sudo();
        return sudoContext.db.User.count(params);
      },
    },
    Subscription: {
      liveBid: (root, { id }, context) => {
        return context.db.Bid.findOne({
          where: {
            id: id,
          },
        });
      },
      time: {
        // @ts-ignore
        subscribe: () => pubSub.asyncIterator(['TIME']),
      },
    },
  },
});
