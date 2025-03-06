type Columns = {
    path: string,
    name: string,
  }
  interface IncomingStructureData {
    columns: Columns[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any[];
  }
  
export function Table({ columns, items }: Readonly<IncomingStructureData>) {
    return (
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.path + column.name}>{column.name}</th>
              ))}
    {/*           <th>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {columns.map((column) => (
                  <td key={column.path + column.name}>{item[column.path]}</td>
                ))}
    {/*             <td>
                  <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => {removeRow(e, item.id)}}>Borrar</button>
                  <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => {getClient(e, item.id)}}>Edit Client</button>
                </td> */}
              </tr>
            ))}
    
          </tbody>
        </table>
      );
}