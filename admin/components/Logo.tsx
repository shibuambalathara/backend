/** @jsxRuntime classic */
/** @jsx jsx */
import Link from 'next/link';
import { jsx, H2 } from '@keystone-ui/core';

export const Logo = () => {
  return (
    <H2>
      <Link href="/" passHref >
        <img width="100%" height="85px" src="/images/logo/logo_blue.png" alt="AutoBse" 
        css={{
          padding: '0.5rem 0'
        }} />
      </Link>
    </H2>
  );
};