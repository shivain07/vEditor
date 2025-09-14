import {
  MegaMenu,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import WEBLOGO from "../assets/veditlogo.png";

function HeaderComponent() {
  return (
    <MegaMenu>
      <NavbarBrand href="/">
        <img alt="Weblogo" src={WEBLOGO} className="mr-3 h-6 sm:h-9" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          vEdit
        </span>
      </NavbarBrand>
      <NavbarToggle />
      <NavbarCollapse>
        <NavbarLink href="/">Editor</NavbarLink>
        <NavbarLink href="/converter">Converter</NavbarLink>
        <NavbarLink href="/roadmap">Roadmap</NavbarLink>
      </NavbarCollapse>
    </MegaMenu>
  );
}

export default HeaderComponent;