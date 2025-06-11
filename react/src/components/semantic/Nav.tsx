import { NavLink } from "react-router"
import styled from 'styled-components'
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import React from "react";

interface NavProps {
    links: { to: string, text: string, actions?: () => void}[];
}

export const Nav = ({ links }: NavProps) => {
    const [menuOpen, setMenuOpen] = React.useState(false);

    React.useEffect(() => {
        const handleResize = () => {
            if (menuOpen) {
                setMenuOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [menuOpen]);

    return (
        <StyledNav>
            <StyledUl>
                {links.map((link) => (
                    <li key={link.text}>
                        <StyledNavLink onClick={link.actions} to={link.to} className={({ isActive }) => (isActive ? "active" : "")}>{link.text}</StyledNavLink>
                    </li>
                ))}
            </StyledUl>
            <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenu.Trigger asChild>
                    <StyledMenuIcon aria-label="Customise options">
                        <HamburgerMenuIcon />
                    </StyledMenuIcon>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                    <StyledDropdownContent sideOffset={5}>
                        {links.map((link) => (
                            <DropdownMenu.Item key={link.text} asChild>
                                <StyledDropdownMenuItem onClick={() => {
                                    if (link.actions) link.actions();
                                    setMenuOpen(false);
                                }} to={link.to} className={({ isActive }: { isActive: boolean }) => (isActive ? "active" : "")}>
                                    {link.text}
                                </StyledDropdownMenuItem>
                            </DropdownMenu.Item>
                        ))}
                        <DropdownMenu.Arrow className="DropdownMenuArrow" />
                    </StyledDropdownContent>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </StyledNav>
    )
}

const StyledNav = styled.nav`
    display: flex;
    justify-content: flex-end;
    align-items: center;
`
const StyledUl = styled.ul`
    display: flex;
    gap: 1.5rem;
    list-style-type: none;
    margin: 0;
    padding: 0;

    @media (max-width: 768px) {
        display: none;
    }
`
const StyledNavLink = styled(NavLink)`
    text-decoration: none;
    color: ${(props) => props.theme.accent1};
    font-weight: 500;
    transition: color 0.2s ease-in-out;

    &:hover {
        color: ${(props) => props.theme.accent4};
    }

    &.active {
        color: ${(props) => props.theme.accent9};
    }
`

const StyledMenuIcon = styled.button`
    display: none; /* Hidden by default, shown on small screens */
    background: none;
    border: none;
    color: ${(props) => props.theme.accent1};
    cursor: pointer;
    padding: 0.5rem;

    @media (max-width: 768px) {
        display: block;
    }
`

const StyledDropdownContent = styled(DropdownMenu.Content)`
    background-color: ${(props) => props.theme.accent1};
    border-radius: 6px;
    padding: 5px;
    box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2);
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
`

const StyledDropdownMenuItem = styled(NavLink)`
    font-size: 13px;
    line-height: 1;
    color: ${(props) => props.theme.accent10};
    border-radius: 3px;
    display: flex;
    align-items: center;
    height: 25px;
    padding: 0 5px;
    position: relative;
    padding-left: 25px;
    user-select: none;
    outline: none;
    text-decoration: none;

    &[data-disabled] {
        color: ${(props) => props.theme.accent1};
        pointer-events: none;
    }

    &[data-highlighted] {
        background-color: ${(props) => props.theme.accent8};
        color: ${(props) => props.theme.accent1};
    }

    &.active {
        color: ${(props) => props.theme.accent9};
    }
`