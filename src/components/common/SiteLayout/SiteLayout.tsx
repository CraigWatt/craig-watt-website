import React, { FC } from 'react';

/*
SiteLayout is effectively a default Layout for the website.
*/


export interface SiteLayoutProps {
  children?: React.ReactNode
}

export const SiteLayout: FC<SiteLayoutProps> = ({
  children
}) => {

  const navBarLinks = "unknown";

  return (
    <>
    <div> I am Site Layout Component</div>
    <main>{children}</main>
    </>
  );
}

