import styled from 'styled-components';


interface HeaderProps {
    title: string;
    children?: React.ReactNode;
}

export const Header = ({ title, children }: HeaderProps) => {
    
    return (
        <StyledHeader >
            <StyledH1>{title}</StyledH1>
            {children}
        </StyledHeader>
    )
}
const StyledHeader = styled.header`
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background-color: ${(props) => props.theme.accent12};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
`
const StyledH1 = styled.h1`
    color: ${(props) => props.theme.accent1};
    margin: 0;
`