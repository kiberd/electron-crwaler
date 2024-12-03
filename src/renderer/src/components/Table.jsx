import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable
  } from "@tanstack/react-table";
  
  import "../assets/styles.css"

  
   
  function Table({ data }) {

    

  
    const columnHelper = createColumnHelper();
     
    const columns = [
      columnHelper.accessor("model", { header: "검색어"}),
      columnHelper.accessor("name", { header: "상품이름" }),
      columnHelper.accessor("kream", { header: "크림" }),
      columnHelper.accessor("soldout", { header: "솔드아웃" }),
      columnHelper.accessor("nike", { header: "나이키" }),
      columnHelper.accessor("adidas", { header: "아디다스"}),
      columnHelper.accessor("moosinsa", { header: "무신사" }),
      columnHelper.accessor("folder", { header: "폴더"}),
    ];
  
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel()
    });
    return (
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} style={{ width: header.getSize() }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  
  export default Table;
  