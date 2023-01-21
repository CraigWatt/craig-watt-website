import React from 'react';
import { SiteNavbar, Footer } from '../index';

/*
SiteLayout is effectively a default Layout for the website.
*/

export interface SiteLayoutProps {
  children?: React.ReactNode,
}


const SiteLayout: React.FC<SiteLayoutProps> = ({children}) => {
  return (
    <>
    <div>I am Site Layout Component</div>
    <SiteNavbar/>
    <main>{children}</main>
    <Footer/>
    </>
  );
}

export default SiteLayout;
