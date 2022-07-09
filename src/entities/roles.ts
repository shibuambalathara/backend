import {
  checkbox,
  image,
  password,
  relationship,
  select,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import {
  isSignedIn,
  permissions,
  rules,
  isSuperAdmin,
} from "../application/access";

export const Role = list({
  /*
      SPEC
      - [x] Block all public access
      - [x] Restrict edit access based on canManageRoles
      - [ ] Prevent users from deleting their own role
      - [ ] Add a pre-save hook that ensures some permissions are selected when others are:
          - [ ] when canEditOtherPeople is true, canSeeOtherPeople must be true
          - [ ] when canManagePeople is true, canEditOtherPeople and canSeeOtherPeople must be true
      - [ ] Extend the Admin UI with client-side validation based on the same set of rules
    */
  access: {
    operation: {
      create: isSignedIn, //permissions.canManageRoles,
      query: isSignedIn,
      update: isSignedIn, //permissions.canManageRoles,
      delete: isSignedIn, //permissions.canManageRoles,
    },
  },
  ui: {
    // hideCreate: (args) => !permissions.canManageRoles(args),
    // hideDelete: (args) => !permissions.canManageRoles(args),
    listView: {
      initialColumns: ["name"],
    },
    itemView: {
      defaultFieldMode: (args) =>
        permissions.canManageRoles(args) ? "edit" : "read",
    },
  },
  fields: {
    /* The name of the role */
    name: text({ validation: { isRequired: true } }),
    /* Create Events means:
         - create event (can only assign them to others with canManageAllEvent) 
         - default event status will be the pending (author can't change the status) */
    canCreateEvents: checkbox({ defaultValue: false }),
    /* Manage All Events means:
         - create new Events and assign them to someone else (with canCreateEvents)
         - update and Events not assigned to the current user */
    canManageAllEvents: checkbox({ defaultValue: false }),

    canCreateEventTypes: checkbox({ defaultValue: false }),

    canManageEventTypes: checkbox({ defaultValue: false }),

    canCreateVehicles: checkbox({ defaultValue: false }),

    canManbageVehicles: checkbox({ defaultValue: false }),

    canCreateLocations: checkbox({ defaultValue: false }),

    canManageLocations: checkbox({ defaultValue: false }),

    canCreateEventCategories: checkbox({ defaultValue: false }),

    canManageEventCategories: checkbox({ defaultValue: false }),

    canCreateEventUsers: checkbox({ defaultValue: false }),

    canManageEventUsers: checkbox({ defaultValue: false }),

    canCreateSellers: checkbox({ defaultValue: false }),

    canManageSellers: checkbox({ defaultValue: false }),

    canCreateBids: checkbox({ defaultValue: false }),

    canManageBids: checkbox({ defaultValue: false }),

    /* See Other Users means:
         - list all users in the database (users can always see themselves) */
    canSeeOtherPeople: checkbox({ defaultValue: false }),
    /* Edit Other Users means:
         - edit other users in the database (users can always edit their own item) */
    canEditOtherPeople: checkbox({ defaultValue: false }),
    /* Manage Users means:
         - change passwords (users can always change their own password)
         - assign roles to themselves and other users */
    canManagePeople: checkbox({ defaultValue: false }),
    /* Manage Roles means:
         - create, edit, and delete roles */
    canManageRoles: checkbox({ defaultValue: false }),

    /* All Permissions without restrictions */

    isSuperAdmin: checkbox({
      defaultValue: false,
      ui: {
        createView: {
          fieldMode: "hidden",
        },
        itemView: {
          fieldMode: "hidden",
        },
        listView: {
          fieldMode: "hidden",
        },
      },
      access: {
        create: isSuperAdmin,
        update: isSuperAdmin,
      },
      // hide: (args) => !permissions.isSuperAdmin(args),
    }),
    /* This list of People assigned to this role */
    assignedTo: relationship({
      ref: "User.role",
      many: true,
      ui: {
        itemView: { fieldMode: "read" },
      },
    }),
  },
});
