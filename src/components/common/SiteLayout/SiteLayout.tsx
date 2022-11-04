import React, { FC } from 'react';
import { Navbar, Button, Link, Text, Card, Radio } from "@nextui-org/react";

/*
SiteLayout is effectively a default Layout for the website.
*/

export interface SiteLayoutProps {
  children?: React.ReactNode,
}


const SiteLayout: React.FC<SiteLayoutProps> = ({children}) => {

  const collapseItems = [
    "Home",
    "Portfolio",
    "Blog",
  ];

  return (
    <>
    <div>I am Site Layout Component</div>
      <Navbar isBordered variant={"sticky"}>
          <Navbar.Brand>
            <Navbar.Toggle aria-label="toggle navigation" showIn="xs" />
            <Text b color="inherit" hideIn="xs">
              ACME
            </Text>
          </Navbar.Brand>
          <Navbar.Content hideIn="xs">
            <Navbar.Link isActive href="/">Home</Navbar.Link>
            <Navbar.Link href="#">Portfolio</Navbar.Link>
            <Navbar.Link href="#">Blog</Navbar.Link>
          </Navbar.Content>
          <Navbar.Collapse>
            {collapseItems.map((item, index) => (
            <Navbar.CollapseItem key={item}>
              <Link
                color="inherit"
                css={{
                  minWidth: "100%",
                }}
                href="#"
              >
                {item}
              </Link>
            </Navbar.CollapseItem>
            ))}
          </Navbar.Collapse>
        </Navbar>   
      <main>{children}</main>
    </>
  );
}

export default SiteLayout;