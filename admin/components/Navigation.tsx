
   
import React from 'react';

import { ListNavItems, NavigationContainer, NavItem } from '@keystone-6/core/admin-ui/components';

import type { NavigationProps } from '@keystone-6/core/admin-ui/components';

export function Navigation({ lists, authenticatedItem }: NavigationProps) {
  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      <NavItem href="/">Dashboard</NavItem>
      {/* <NavItem href="/import">Import Vehicle List</NavItem> */}
      <ListNavItems lists={lists} />
    </NavigationContainer>
  );
}