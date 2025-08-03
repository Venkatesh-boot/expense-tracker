import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchExpensesTableRequest, deleteExpenseRequest, updateExpenseRequest } from '../../store/slices/expensesTableSlice';
import type { ExpensesTableState } from '../../store/slices/expensesTableSlice';
import { useTable, useSortBy, usePagination, useGlobalFilter } from 'react-table';

const columns = [
  { Header: 'Date', accessor: 'date' },
  { Header: 'Category', accessor: 'category' },
  { Header: 'Amount', accessor: 'amount' },
  { Header: 'Type', accessor: 'type' },
  { Header: 'Payment Method', accessor: 'paymentMethod' },
  { Header: 'Description', accessor: 'description' },
];



export default function ExpensesTable() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { rows: expenses, loading, error } = useAppSelector(state => state.expensesTable as ExpensesTableState);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<{ date: string; category: string; amount: number; type: string; paymentMethod: string; description: string }>>({});

  // Handle delete expense
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      dispatch(deleteExpenseRequest(id));
    }
  };

  // Handle edit click
  const handleEdit = (row: any) => {
    // Navigate to add-expenses page with only id as query param
    navigate(`/add-expenses?id=${row.id}`);
  };

  // Handle edit form change
  const handleEditChange = (field: string, value: any) => {
    setEditForm(f => ({ ...f, [field]: value }));
  };

  // Handle save
  const handleSave = (id: string) => {
    dispatch(updateExpenseRequest({ id, data: editForm }));
    setEditingId(null);
    setEditForm({});
  };

  // Handle cancel
  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  useEffect(() => {
    dispatch(fetchExpensesTableRequest());
  }, [dispatch]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [csvUrl, setCsvUrl] = useState('');

  // Filter data by date range
  const filteredData = useMemo(() => {
    let filtered = expenses;
    if (dateFrom) filtered = filtered.filter(d => d.date >= dateFrom);
    if (dateTo) filtered = filtered.filter(d => d.date <= dateTo);
    if (searchInput) {
      filtered = filtered.filter(d =>
        d.category?.toLowerCase().includes(searchInput.toLowerCase()) ||
        (d.description || '').toLowerCase().includes(searchInput.toLowerCase())
      );
    }
    return filtered;
  }, [expenses, dateFrom, dateTo, searchInput]);

  // Table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    state: { pageIndex, pageSize },
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    setPageSize,
  } = useTable(
    { columns, data: filteredData, initialState: { pageIndex: 0, pageSize: 5 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // Total expenses (filtered and page)
  const totalFiltered = filteredData.reduce((sum, d) => sum + d.amount, 0);
  const totalPage = page.reduce((sum: number, row: { original: { amount: number } }) => sum + (row.original.amount || 0), 0);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(d => {
      map[d.category] = (map[d.category] || 0) + d.amount;
    });
    return map;
  }, [filteredData]);

  // Export to CSV
  const handleExportCSV = () => {
    const rows = [
      ['Date', 'Category', 'Amount', 'Description'],
      ...filteredData.map(d => [d.date, d.category, d.amount, d.description])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    setCsvUrl(URL.createObjectURL(blob));
  };

  // Search suggestions (simple demo)
  React.useEffect(() => {
    if (!searchInput) setSearchSuggestions([]);
    else {
      const cats = Array.from(new Set(expenses.map(d => d.category)));
      setSearchSuggestions(cats.filter(c => c.toLowerCase().includes(searchInput.toLowerCase())));
    }
  }, [searchInput, expenses]);

  // Row selection for bulk actions
  const toggleRow = (idx: number) => {
    setSelectedRows(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  };
  const allSelected = page.length > 0 && page.every((row: { index: number }) => selectedRows.includes(row.index));
  const toggleAll = () => {
    if (allSelected) setSelectedRows(sel => sel.filter((i: number) => !page.map((row: { index: number }) => row.index).includes(i)));
    else setSelectedRows(sel => [...sel, ...page.map((row: { index: number }) => row.index).filter((i: number) => !sel.includes(i))]);
  };

  // Highlight large expenses (demo: >1000)
  const isLarge = (amount: number) => amount > 1000;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-4 relative">
      <h2 className="text-xl font-bold mb-2 text-blue-700 dark:text-blue-200">Recent Expenses</h2>
      {/* Info Bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-semibold text-gray-700 dark:text-gray-100">Total (filtered): <span className="text-blue-700 dark:text-green-200">₹{totalFiltered.toLocaleString()}</span></span>
          <span className="font-semibold text-gray-700 dark:text-gray-100">This page: <span className="text-blue-700 dark:text-green-200">₹{totalPage.toLocaleString()}</span></span>
          <span className="font-semibold text-gray-700 dark:text-gray-100">Showing {page.length} of {filteredData.length} expenses</span>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={handleExportCSV} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">Export CSV</button>
          {csvUrl && <a href={csvUrl} download="expenses.csv" className="text-blue-600 underline text-sm">Download</a>}
        </div>
      </div>
      {/* Category Breakdown */}
      <div className="flex flex-wrap gap-2 mb-2">
        {Object.entries(categoryBreakdown).map(([cat, amt]) => (
          <span key={cat} className="px-2 py-1 rounded bg-blue-100 dark:bg-gray-900 text-blue-700 dark:text-green-200 text-xs font-semibold">{cat}: ₹{amt.toLocaleString()}</span>
        ))}
      </div>
      {/* Filters */}
      <div className="mb-2 flex flex-col sm:flex-row sm:justify-between gap-2 items-center">
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="border px-2 py-1 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
            placeholder="From"
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="border px-2 py-1 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
            placeholder="To"
          />
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search..."
              className="border px-2 py-1 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 w-full"
              onFocus={() => setSearchSuggestions([])}
            />
            {searchSuggestions.length > 0 && (
              <ul className="absolute left-0 top-9 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow z-10 w-full">
                {searchSuggestions.map(s => (
                  <li key={s} className="px-3 py-1 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700" onClick={() => setSearchInput(s)}>{s}</li>
                ))}
              </ul>
            )}
          </div>
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
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <table {...getTableProps()} className="min-w-full text-left bg-white dark:bg-gray-800">
          <thead className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
            {headerGroups.map((headerGroup: any) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                <th className="py-3 px-2 border-b text-center">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
                {headerGroup.headers.map((column: any) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className={`py-3 px-5 border-b font-semibold text-blue-700 dark:text-blue-200 text-base cursor-pointer select-none whitespace-nowrap ${column.isSorted ? 'bg-blue-200 dark:bg-gray-700' : ''}`}
                  >
                    {column.render('Header')}
                    <span>
                      {column.isSorted ? (column.isSortedDesc ? <span role="img" aria-label="sorted descending"> 🔽</span> : <span role="img" aria-label="sorted ascending"> 🔼</span>) : ''}
                    </span>
                  </th>
                ))}
                <th className="py-3 px-2 border-b text-center">Actions</th>
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row: any, idx: number) => {
              prepareRow(row);
              const isSelected = selectedRows.includes(row.index);
              return (
                <tr
                  {...row.getRowProps()}
                  className={`transition-colors ${idx % 2 === 0 ? 'bg-blue-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} hover:bg-blue-100 dark:hover:bg-gray-700 ${isLarge(row.original.amount) ? 'border-l-4 border-red-500' : ''}`}
                >
                  <td className="py-3 px-2 border-b text-center">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleRow(row.index)} />
                  </td>
                  {row.cells.map((cell: any, cidx: number) => (
                    <td className="py-3 px-5 border-b text-gray-700 dark:text-gray-200 whitespace-nowrap" {...cell.getCellProps()}>
                      {editingId === row.original.id ? (
                        cell.column.id === 'amount' ? (
                          <input
                            type="number"
                            value={editForm.amount ?? ''}
                            onChange={e => handleEditChange('amount', Number(e.target.value))}
                            className="border px-1 py-0.5 rounded w-20"
                          />
                        ) : cell.column.id === 'date' ? (
                          <input
                            type="date"
                            value={editForm.date ?? ''}
                            onChange={e => handleEditChange('date', e.target.value)}
                            className="border px-1 py-0.5 rounded w-28"
                          />
                        ) : cell.column.id === 'category' ? (
                          <input
                            type="text"
                            value={editForm.category ?? ''}
                            onChange={e => handleEditChange('category', e.target.value)}
                            className="border px-1 py-0.5 rounded w-24"
                          />
                        ) : cell.column.id === 'type' ? (
                          <input
                            type="text"
                            value={editForm.type ?? ''}
                            onChange={e => handleEditChange('type', e.target.value)}
                            className="border px-1 py-0.5 rounded w-20"
                          />
                        ) : cell.column.id === 'paymentMethod' ? (
                          <input
                            type="text"
                            value={editForm.paymentMethod ?? ''}
                            onChange={e => handleEditChange('paymentMethod', e.target.value)}
                            className="border px-1 py-0.5 rounded w-24"
                          />
                        ) : cell.column.id === 'description' ? (
                          <input
                            type="text"
                            value={editForm.description ?? ''}
                            onChange={e => handleEditChange('description', e.target.value)}
                            className="border px-1 py-0.5 rounded w-32"
                          />
                        ) : null
                      ) : (
                        cell.column.id === 'amount' ? (
                          <span className="inline-flex items-center gap-1">
                            ₹{typeof cell.value === 'number' ? cell.value.toLocaleString() : (cell.value as string)}
                            {typeof cell.value === 'number' && isLarge(cell.value) && <span title="Large expense" className="ml-1 text-red-500 font-bold" role="img" aria-label="Large expense">!</span>}
                          </span>
                        ) : cell.column.id === 'category' ? (
                          <span className="inline-flex items-center gap-1">
                            {cell.value as string}
                            {cell.value === 'Bills' && <span title="Recurring" className="ml-1 text-green-500" role="img" aria-label="Recurring">♻️</span>}
                          </span>
                        ) : cell.column.id === 'description' ? (
                          <span className="inline-flex items-center gap-1">
                            {cell.value as string}
                            {row.original.category === 'Shopping' && <span className="ml-1 px-1 rounded bg-yellow-100 text-yellow-800 text-xs">groceries</span>}
                          </span>
                        ) : cell.render('Cell')
                      )}
                    </td>
                  ))}
                  <td className="py-3 px-2 border-b text-center">
                    <button
                      className="text-blue-600 hover:underline text-xs mr-2"
                      onClick={() => handleEdit(row.original)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className={`text-red-600 hover:underline text-xs mr-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={loading}
                      onClick={() => handleDelete(row.original.id)}
                    >
                      {loading ? 'Deleting...' : 'Delete'}
                    </button>
                    <button className="text-green-600 hover:underline text-xs" title="View Receipt"><span role="img" aria-label="View Receipt">📎</span></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selectedRows.length > 0 && (
        <div className="flex gap-2 mt-2">
          <button className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm">Delete Selected</button>
          <button className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">Export Selected</button>
        </div>
      )}
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

      {/* Floating Add Expense Button */}
      <button
        onClick={() => navigate('/add-expenses')}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl transition duration-200"
        title="Add Expense"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
      >
        +
      </button>
    </div>
  );
}
