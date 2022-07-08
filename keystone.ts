import "dotenv/config";
import { config } from "@keystone-6/core";
import { withAuth, session } from "./src/application/auth";
import { lists, router } from "./src/application/schema";

// const baseUrl = process.env.BASE_URL || "http://localhost:3000";

export default config(
  withAuth({
    db: {
      provider: "postgresql",
      url:
        process.env.DATABASE_URL ||
        "postgres://postgres:postgrespw@localhost:49153/bidding2",
    },
    lists: lists,
    ui: {
      isAccessAllowed: (context) => !!context.session?.data,
    },
    session,
    server: {
      cors: {
        origin: [
          "http://localhost:3000",
          "https://autobse.com",
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
    },
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
