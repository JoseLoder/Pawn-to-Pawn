import { TableInputs } from "@pawn-to-pawn/shared";
import styled from "styled-components";

export function Table({ columns, items, actions }: TableInputs) {
  return (
    <StyledTableContainer>
      <StyledTable>
        <StyledTableHead>
          <tr>
            {columns.map((column) => (
              <StyledTh
                key={column.path}>
                {column.name}
              </StyledTh>
            ))}
          </tr>
        </StyledTableHead>
        <tbody>
          {items ? items.map((item) => (
            <StyledTableRow key={item.id}>
              {columns.map((column) => (
                <StyledTableCell key={column.id ? item[column.id] : column.path}
                  id={column.id ? item[column.id] : column.path}>
                  {column.path === "actions" ? (
                    <>
                      {actions?.map((action) => (
                        <StyledActionButton key={action.name} onClick={() => action.action(item.id)}>
                          {action.name}
                        </StyledActionButton>
                      ))}
                    </>
                  ) : (
                    item[column.path] + (column.unit ? ` ${column.unit}` : "")
                  )}
                </StyledTableCell>
              ))}
            </StyledTableRow>
          )) :
            <tr>
              <StyledTableCell colSpan={columns.length}>No data</StyledTableCell>
            </tr>
          }
        </tbody>
      </StyledTable>
    </StyledTableContainer>
  );
}

const StyledTableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: ${(props) => props.theme.accent4};
  border-radius: 8px;
  overflow: hidden;
`;

const StyledTableHead = styled.thead`
  background-color: ${(props) => props.theme.accent6};
  color: ${(props) => props.theme.accent12};
`;

const StyledTh = styled.th`
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid ${(props) => props.theme.accent7};
`;

const StyledTableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${(props) => props.theme.accent3};
  }
  &:hover {
    background-color: ${(props) => props.theme.accent5};
  }
`;

const StyledTableCell = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid ${(props) => props.theme.accent7};
  color: ${(props) => props.theme.accent11};
`;

const StyledActionButton = styled.button`
  background-color: ${(props) => props.theme.accent9};
  color: ${(props) => props.theme.accent1};
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 8px;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${(props) => props.theme.accent10};
  }

  &:disabled {
    background-color: ${(props) => props.theme.accent6};
    cursor: not-allowed;
  }
`;
