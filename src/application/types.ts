export type Session = {
  itemId: string;
  listKey: string;
  data: {
    id: string;
    name: string;
    role?: {
      id: string;
      name: string;
      isSuperAdmin: boolean;
      canCreateTodos: boolean;
      canManageAllTodos: boolean;
      canSeeOtherPeople: boolean;
      canEditOtherPeople: boolean;
      canManagePeople: boolean;
      canManageRoles: boolean;
    };
  };
};

export type ListAccessArgs = {
  itemId?: string;
  session?: Session;
};
