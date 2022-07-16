import { TimestampFieldConfig } from "@keystone-6/core/fields";
import { BaseListTypeInfo } from "@keystone-6/core/types";
import { ListAccessArgs } from "./types";

export const isAdminEdit = ({ session }: ListAccessArgs) =>
  isSuperAdmin({ session }) ? "edit" : "read";

export const isAdminCreate = ({ session }: ListAccessArgs) =>
  isSuperAdmin({ session }) ? "edit" : "hidden";

export const fieldOptions: TimestampFieldConfig<BaseListTypeInfo> = {
  access: {
    read: () => true,
    create: () => false,
    update: () => false,
  },
  ui: {
    createView: {
      fieldMode: "hidden",
    },
    itemView: {
      fieldMode: "read",
    },
  },
  graphql: { omit: ["update", "create"] },
};

/*
  The basic level of access to the system is being signed in as a valid user. This gives you access
  to the Admin UI, access to your own User and Todo items, and read access to roles.
*/
export const isSignedIn = ({ session }: ListAccessArgs) => {
  return !!session;
};

export const isOwner =
  (ownerId: string) =>
  ({ session }: ListAccessArgs) => {
    return session?.itemId === ownerId;
  };

export const isSuperAdmin = ({ session }: ListAccessArgs) => {
  return !!session?.data?.role?.isSuperAdmin;
};

/*
  Permissions are shorthand functions for checking that the current user's role has the specified
  permission boolean set to true
*/
export const permissions = {
  canCreateEvents: ({ session }: ListAccessArgs) =>
    !!session?.data.role?.canCreateTodos,
  canManageAllEvents: ({ session }: ListAccessArgs) =>
    !!session?.data.role?.canManageAllTodos,
  canManagePeople: ({ session }: ListAccessArgs) =>
    !!session?.data.role?.canManagePeople,
  canManageRoles: ({ session }: ListAccessArgs) =>
    !!session?.data.role?.canManageRoles,
};

/*
  Rules are logical functions that can be used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items
*/
export const rules = {
  canReadEvents: ({ session }: ListAccessArgs) => {
    if (!session) {
      // No session? No todos.
      return false;
    } else if (session.data.role?.canManageAllTodos) {
      // Can see all todos that are: assigned to them, or not private
      return {
        OR: [
          { assignedTo: { id: { equals: session.itemId } } },
          { assignedTo: null, isPrivate: { equals: true } },
          { NOT: { isPrivate: { equals: true } } },
        ],
      };
    } else {
      // Can only see their own todos
      return { assignedTo: { id: { equals: session.itemId } } };
    }
  },
  canManageEvents: ({ session }: ListAccessArgs) => {
    if (!session) {
      // No session? No todos.
      return false;
    } else if (session.data.role?.canManageAllTodos) {
      // Can manage todos? go for it
      return true;
    } else {
      // Can only manage their own todos
      return { assignedTo: { id: { equals: session.itemId } } };
    }
  },
  canReadPeople: ({ session }: ListAccessArgs) => {
    if (!session) {
      // No session? No people.
      return false;
    } else if (session.data.role?.canSeeOtherPeople) {
      // Can see everyone
      return true;
    } else {
      // Can only see yourself
      return { id: { equals: session.itemId } };
    }
  },
  canUpdatePeople: ({ session }: ListAccessArgs) => {
    if (!session) {
      // No session? No people.
      return false;
    } else if (session.data.role?.canEditOtherPeople) {
      // Can update everyone
      return true;
    } else {
      // Can update yourself
      return { id: { equals: session.itemId } };
    }
  },
};