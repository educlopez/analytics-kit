import * as Table from "@/components/ui/table";

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
    <div className="border-stroke-soft-200 min-w-0 overflow-x-auto rounded-2xl border">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            {columns.map((column) => (
              <Table.Head key={column} className="whitespace-nowrap">
                {column}
              </Table.Head>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.name}>
              <Table.Cell className="align-top">
                <code className="text-text-strong-950 font-mono text-xs break-words">
                  {row.name}
                </code>
              </Table.Cell>
              <Table.Cell className="align-top">
                <code className="text-text-sub-600 font-mono text-xs break-words">{row.type}</code>
              </Table.Cell>
              <Table.Cell className="align-top">
                {row.default ? (
                  <code className="text-text-sub-600 font-mono text-xs break-words">
                    {row.default}
                  </code>
                ) : (
                  <span className="text-text-soft-400">—</span>
                )}
              </Table.Cell>
              <Table.Cell className="text-text-sub-600 align-top">{row.notes}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
