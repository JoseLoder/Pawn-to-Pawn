import styled from '@emotion/styled';

const StyledHeader = styled.header`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
`

interface HeaderProps {
    title: string;
    children?: React.ReactNode;
}

export const Header = ({ title, children }: HeaderProps) => {

    return (
        <StyledHeader >
            <h1>{title}</h1>
            {children}
        </StyledHeader>
    )
}