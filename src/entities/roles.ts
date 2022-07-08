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
import { isSignedIn, permissions, rules } from "../application/access";

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
      create: permissions.canManageRoles,
      query: isSignedIn,
      update: permissions.canManageRoles,
      delete: permissions.canManageRoles,
    },
  },
  ui: {
    hideCreate: (args) => !permissions.canManageRoles(args),
    hideDelete: (args) => !permissions.canManageRoles(args),
    listView: {
      initialColumns: ["name", "assignedTo"],
    },
    itemView: {
      defaultFieldMode: (args) =>
        permissions.canManageRoles(args) ? "edit" : "read",
    },
  },
  fields: {
    /* The name of the role */
    name: text({ validation: { isRequired: true } }),
    /* Create Todos means:
         - create todos (can only assign them to others with canManageAllTodos) */
    canCreateEvents: checkbox({ defaultValue: false }),
    /* Manage All Todos means:
         - create new Todo items and assign them to someone else (with canCreateTodos)
         - update and delete Todo items not assigned to the current user */
    canManageAllTodos: checkbox({ defaultValue: false }),
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
    /* This list of People assigned to this role */
    assignedTo: relationship({
      ref: "Person.role",
      many: true,
      ui: {
        itemView: { fieldMode: "read" },
      },
    }),
  },
});
