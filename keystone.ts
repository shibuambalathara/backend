import "dotenv/config";
import { config } from "@keystone-6/core";
import { withAuth, session } from "./src/application/auth";
import { extendGraphqlSchema, lists, router } from "./src/application/schema";
import { extendHttpServer } from './src/application/graphqlRoutes/websocket';

// const baseUrl = process.env.BASE_URL || "http://localhost:3000";

export default config(
  withAuth({
    db: {
      provider: "postgresql",
      url:
        // process.env.DATABASE_URL ||
        // "postgres://postgres:postgrespw@localhost:49153/bidding2",
        "postgresql://postgres:123@localhost:5432/automax1"
    },
    lists: lists,
    ui: {
      isAccessAllowed: (context) => !!context.session?.data,
    },
    session,
    server: {
      cors: {
        origin: [
          "http://localhost:4000",
          "https://autobse-live-production-server.vercel.app",
        
          // "https://autobse-live-production-server-j35f8dqoi.vercel.app",
          
          "https://*.autobse.com",
          "https://www.autobse.com",
          "https://api-dev.autobse.com",
          "https://studio.apollographql.com",
          "https://auto-bse.vercel.app",
          "https://*.vercel.app",
          "https://autobse.vercel.app",
          "https://autobse-braineo.vercel.app",
        ],
        credentials: true,
      },
      maxFileSize: 200 * 1024 * 1024,
      healthCheck: true,
      extendExpressApp: router,
       extendHttpServer: extendHttpServer,
    },
    extendGraphqlSchema,
    graphql: {
      playground: "apollo", //process.env.NODE_ENV !== 'production' ? 'apollo' : false
      // debug: process.env.NODE_ENV !== 'production',
      // apolloConfig: {
      //   debug: true,
      // },
    },
    storage: {
      local_images: {
        kind: "local",
        type: "image",
        // The URL that is returned in the Keystone GraphQL API
        generateUrl: (path) => `/images${path}`,
        serverRoute: {
          path: "/images",
        },
        storagePath: "public/images",
      },
      local_files: {
        kind: "local",
        type: "file",
        // The URL that is returned in the Keystone GraphQL API
        generateUrl: (path) => `/files/excel${path}`,
        serverRoute: {
          path: "/files/excel",
        },
        storagePath: "public/files/excel",
      },
    },
  })
);
