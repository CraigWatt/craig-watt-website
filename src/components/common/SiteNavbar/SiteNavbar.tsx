import React from 'react';
import { Navbar, Button, Link, Text, Card, Radio } from "@nextui-org/react";

export interface SiteNavbarProps {
  children?: React.ReactNode,
}


const SiteNavbar: React.FC<SiteNavbarProps> = ({children}) => {
  return (
    <>
    <div>I am Site Navbar Component</div>
      <Navbar isBordered variant={"static"}>
          <Navbar.Brand>
            <Text b color="inherit" hideIn="xs">
              ACME
            </Text>
          </Navbar.Brand>
          <Navbar.Content hideIn="xs">
            <Navbar.Link href="#">Features</Navbar.Link>
            <Navbar.Link isActive href="#">Customers</Navbar.Link>
            <Navbar.Link href="#">Pricing</Navbar.Link>
            <Navbar.Link href="#">Company</Navbar.Link>
          </Navbar.Content>
          <Navbar.Content>
            <Navbar.Link color="inherit" href="#">
              Login
            </Navbar.Link>
            <Navbar.Item>
              <Button auto flat as={Link} href="#">
                Sign Up
              </Button>
            </Navbar.Item>
          </Navbar.Content>
        </Navbar>   
      <main>{children}</main>
    </>
  );
}

export default SiteNavbar;
