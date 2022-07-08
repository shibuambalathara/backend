// admin/config.tsx
/** @jsxRuntime classic */
/** @jsx jsx */
import { AdminConfig } from '@keystone-6/core/types';
import { Logo } from './components/Logo';
import { Navigation } from './components/Navigation';

export const components: AdminConfig['components'] = {
  Logo,
  Navigation
};