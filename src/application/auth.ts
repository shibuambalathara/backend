/*
Welcome to the auth file! Here we have put a config to do basic auth in Keystone.

`createAuth` is an implementation for an email-password login out of the box.
`statelessSessions` is a base implementation of session logic.

For more on auth, check out: https://keystonejs.com/docs/apis/auth#authentication-api
*/

import https from 'https';
import { createAuth } from "k6-auth-otp"; //'../lib/auth';

// See https://keystonejs.com/docs/apis/session#session-api for the session docs
import { statelessSessions } from '@keystone-6/core/session';

let sessionSecret = process.env.SESSION_SECRET;

// Here is a best practice! It's fine to not have provided a session secret in dev,
// however it should always be there in production.
if (!sessionSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'The SESSION_SECRET environment variable must be set in production'
    );
  } else {
    sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
  }
}

// Here we define how auth relates to our schemas.
// What we are saying here is that we want to use the list `User`, and to log in
// we will need their email and password.
const { withAuth } = createAuth({
  listKey: "User",
  identityField: "mobile",
  sessionData: `
    id
    firstName
    lastName
    email
    mobile
    role
    userEvents{
      id
      event{
        id
      }
    }`,
  secretField: "password",
  initFirstItem: {
    // If there are no items in the database, keystone will ask you to create
    // a new user, filling in these fields.
    fields: ["firstName", "lastName", "mobile", "password"],
    itemData: {
      /*
        This creates a related role with full permissions, so that when the first user signs in
        they have complete access to the system (without this, you couldn't do anything)
      */
      role: "admin",
      // role: {
      //   create: {
      //     name: "Admin Role",
      //     isSuperAdmin: true,
      //   },
      // },
    },
    skipKeystoneWelcome: true,
  },
  magicAuthLink: {
    sendToken: async ({ identity, token }) => {
      const options = {
        hostname: "sms.textspeed.in",
        port: 443,
        path: `/vb/apikey.php?apikey=XJ66EJdlNH3GFxvZ&senderid=AUTBSE&templateid=1007762888385738662&number=${identity}&message=Use%20${token}%20as%20one-time%20password%20(OTP)%20to%20login%20into%20AUTOBSE.com.%20Please%20do%20not%20share%20this%20OTP%20with%20anyone%20to%20ensure%20account%27s%20security.`,
        method: "GET",
      };

      const req = https.request(options, (res) => {
        // console.log(`statusCode: ${res.statusCode}`)
        // res.on('data', d => {
        //   process.stdout.write(d)
        // })
      });
      req.on("error", (error) => {
        console.error(error);
      });

      req.end();
      /* ... */
    },
    tokensValidForMins: 10,
  },
});

// This defines how long people will remain logged in for.
// This will get refreshed when they log back in.
let sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

// This defines how sessions should work. For more details, check out: https://keystonejs.com/docs/apis/session#session-api
const session = statelessSessions({
  maxAge: sessionMaxAge,
  secret: sessionSecret!,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
});

export { withAuth, session };
