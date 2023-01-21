import React from 'react';
// import { Navbar, Button, Link, Text, Card, Radio } from "@nextui-org/react";

export interface FooterProps {
  children?: React.ReactNode,
}


const Footer: React.FC<FooterProps> = ({children}) => {
  return (
    <>
    <div>I am Footer Component</div>
      <main>{children}</main>
    </>
  );
}

export default Footer;
