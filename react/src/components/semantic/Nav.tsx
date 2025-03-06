import { NavLink } from "react-router"
import styled from '@emotion/styled'

const StyledNav = styled.nav`
    display: flex;
    justify-content: flex-start;
    align-items: center;

    ul {
        display: flex;
        gap: 1rem;
        list-style-type: none;
    }
    a {
        text-decoration: none;
    }
`

interface NavProps {
    links: { to: string, text: string }[];
}

export const Nav = ({ links }: NavProps) => {
    return (
        <StyledNav>
            <ul>
                {links.map((link) => (
                    <li key={link.text}>
                        <NavLink to={link.to} style={({ isActive }: { isActive: boolean }) => ({
                            color: isActive ? "red" : "black",
                        })}>{link.text}</NavLink>
                    </li>
                ))}
            </ul>
        </StyledNav>
    )
}