
import { useTable, useSortBy, usePagination, useGlobalFilter } from 'react-table';

type Expense = {
  date: string;
  category: string;
  amount: number;
  description: string;
};

const data: Expense[] = [
  { date: '2025-07-01', category: 'Food', amount: 500, description: 'Lunch at cafe' },
  { date: '2025-07-02', category: 'Transport', amount: 200, description: 'Bus fare' },
  { date: '2025-07-03', category: 'Shopping', amount: 1200, description: 'Groceries' },
  { date: '2025-07-04', category: 'Bills', amount: 800, description: 'Electricity bill' },
  { date: '2025-07-05', category: 'Entertainment', amount: 300, description: 'Movie' },
  // ...more rows
];

const columns: any[] = [
  { Header: 'Date', accessor: 'date' },
  { Header: 'Category', accessor: 'category' },
  { Header: 'Amount', accessor: 'amount' },
  { Header: 'Description', accessor: 'description' },
];

export default function ExpenseTable() {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    setGlobalFilter,
    state: { globalFilter, pageIndex, pageSize },
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    setPageSize,
  } = useTable(
    { columns, data, initialState: { pageIndex: 0, pageSize: 5 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-4">
      <div className="mb-2 flex justify-between items-center">
        <input
          value={globalFilter || ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="border px-2 py-1 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
        />
        <select
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          className="border px-2 py-1 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
        >
          {[5, 10, 20].map(size => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <table {...getTableProps()} className="min-w-full text-left bg-white dark:bg-gray-800">
          <thead className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
            {headerGroups.map((headerGroup: any) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column: any) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="py-3 px-5 border-b font-semibold text-blue-700 dark:text-blue-200 text-base cursor-pointer select-none whitespace-nowrap"
                  >
                    {column.render('Header')}
                    <span>
                      {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row: any, idx: number) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  className={
                    `transition-colors ${idx % 2 === 0 ? 'bg-blue-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} hover:bg-blue-100 dark:hover:bg-gray-700`}
                >
                  {row.cells.map((cell: any) => (
                    <td className="py-3 px-5 border-b text-gray-700 dark:text-gray-200 whitespace-nowrap" {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-2">
        <button onClick={() => previousPage()} disabled={!canPreviousPage} className="px-3 py-1 border rounded disabled:opacity-50 dark:text-gray-100">Previous</button>
        <span className="dark:text-gray-100">
          Page{' '}
          <strong className="dark:text-gray-100">
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </span>
        <button onClick={() => nextPage()} disabled={!canNextPage} className="px-3 py-1 border rounded disabled:opacity-50 dark:text-gray-100">Next</button>
      </div>
    </div>
  );
}
