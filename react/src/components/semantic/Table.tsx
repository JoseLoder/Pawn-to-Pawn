type Columns = {
  path: string;
  name: string;
};
interface IncomingStructureData {
  columns: Columns[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  actions?: {
    name: string;
    action: (id: string) => void;
    icon?: string;
  }[];
}

export function Table({ columns, items, actions }: Readonly<IncomingStructureData>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.path + column.name}>{column.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            {columns.map((column) => (
              <td key={column.path}>
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
        ))}
      </tbody>
    </table>
  );
}
