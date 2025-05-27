import { TableInputs } from "../../../types/table.types";

export function Table({ columns, items, actions }: TableInputs) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.path}>
              {column.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items ? items.map((item) => (
          <tr key={item.id}>
            {columns.map((column) => (
              <td key={column.id ? item[column.id] : column.path}
                id={column.id ? item[column.id] : column.path}>
                {column.path === "actions" ? (
                  <>
                    {actions?.map((action) => (
                      <button key={action.name} onClick={() => action.action(item.id)}>
                        {action.name}
                      </button>
                    ))}
                  </>
                ) : (
                  item[column.path]
                )}
              </td>
            ))}
          </tr>
        )) :
          <tr>
            <td colSpan={columns.length}>No data</td>
          </tr>
        }
      </tbody>
    </table>
  );
}
