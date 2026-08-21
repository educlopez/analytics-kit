export interface PropRow {
  name: string;
  type: string;
  default?: string;
  notes: string;
}

export function PropsTable({
  rows,
  columns = ["Prop", "Type", "Default", "Notes"],
}: {
  rows: PropRow[];
  columns?: [string, string, string, string];
}) {
  return (
    <div className="props-table-wrap">
      <table className="props-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>
                <code>{row.type}</code>
              </td>
              <td>{row.default ? <code>{row.default}</code> : "—"}</td>
              <td>{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
