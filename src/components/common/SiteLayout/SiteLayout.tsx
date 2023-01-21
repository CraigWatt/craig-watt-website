import React, { FC } from 'react';
import { SiteNavbar } from '@components/common'
import { Footer } from '@components/common'



import { Navbar, Button, Link, Text, Card, Radio } from "@nextui-org/react";

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
