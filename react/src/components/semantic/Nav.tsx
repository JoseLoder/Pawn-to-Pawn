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
    links: { to: string, text: string, actions?: () => void}[];
}

export const Nav = ({ links }: NavProps) => {
    return (
        <StyledNav>
            <ul>
                {links.map((link) => (
                    <li key={link.text}>
                        <NavLink onClick={link.actions} to={link.to} style={({ isActive }: { isActive: boolean }) => ({
                            color: isActive ? "green" : "white",
                        })}>{link.text}</NavLink>
                    </li>
                ))}
            </ul>
        </StyledNav>
    )
}