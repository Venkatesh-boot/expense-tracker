

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchExpensesTableRequest, deleteExpenseRequest } from '../../store/slices/expensesTableSlice';
import type { ExpensesTableState } from '../../store/slices/expensesTableSlice';
import { useTable, useSortBy, usePagination, useGlobalFilter } from 'react-table';
import ExpenseDetailsModal from './ExpenseDetailsModal';
// UI helpers (MUI removed from project — use plain buttons/icons)

const columns = [
  { Header: 'Date', accessor: 'date' },
  { Header: 'Category', accessor: 'category' },
  { Header: 'Amount', accessor: 'amount' },
  { Header: 'Type', accessor: 'type' },
  { Header: 'Payment Method', accessor: 'paymentMethod' },
];



export default function ExpensesTable() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { rows: expenses } = useAppSelector(state => state.expensesTable as ExpensesTableState);

  // Inline edit state
  const [editingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<{ date: string; category: string; amount: number; type: string; paymentMethod: string; description: string }>>({});

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalExpense, setModalExpense] = useState<any | null>(null);

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

  // Handle view click
  const handleView = (row: any) => {
    setModalExpense(row);
    setModalOpen(true);
  };

  // Handle edit form change
  const handleEditChange = (field: string, value: any) => {
    setEditForm(f => ({ ...f, [field]: value }));
  };

  // (inline edit handlers were present before; saving is done via updateExpenseRequest in-line when needed)

  // Default to first and last day of current month
  // Always use the first day of the current month as from date
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };
  // Helper to format date as YYYY-MM-DD in local time
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [dateFrom, setDateFrom] = useState(() => formatLocalDate(getFirstDayOfMonth(new Date())));
  const [dateTo, setDateTo] = useState(() => formatLocalDate(getLastDayOfMonth(new Date())));
  useEffect(() => {
    dispatch(fetchExpensesTableRequest({ fromDate: dateFrom, toDate: dateTo }));
  }, [dispatch, dateFrom, dateTo]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [csvUrl, setCsvUrl] = useState('');

  // Filter data by search only (date filtering is now backend)
  const filteredData = useMemo(() => {
    let filtered = expenses;
    if (searchInput) {
      filtered = filtered.filter(d =>
        d.category?.toLowerCase().includes(searchInput.toLowerCase()) ||
        (d.description || '').toLowerCase().includes(searchInput.toLowerCase())
      );
    }
    return filtered;
  }, [expenses, searchInput]);

  // Table instance
  // If both dateFrom and dateTo are selected, show all filtered data (no pagination)
  const usePaginate = !(dateFrom && dateTo);
  const tableInstance = useTable(
    { columns, data: filteredData, initialState: { pageIndex: 0, pageSize: 5 } },
    useGlobalFilter,
    useSortBy,
    ...(usePaginate ? [usePagination] : [])
  );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    state,
    setPageSize,
    // Only available if paginating
    page = filteredData,
    canPreviousPage = false,
    canNextPage = false,
    pageOptions = [0],
  nextPage = undefined,
  previousPage = undefined,
  } = tableInstance;
  // If not paginating, show all filtered data as react-table rows
  const displayRows = usePaginate ? page : tableInstance.rows;

  // Total expenses (filtered and page)
  const totalFiltered = filteredData.reduce((sum, d) => sum + d.amount, 0);
  const totalPage = displayRows.reduce((sum: number, row: any) => sum + (row.original ? row.original.amount : row.amount || 0), 0);

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
      ...filteredData.map(d => [d.date, d.category, d.amount])
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
  // Select all visible rows (displayRows) when header checkbox is toggled
  const allSelected = displayRows.length > 0 && displayRows.every((row: any) => selectedRows.includes(row.index));
  const toggleAll = () => {
    if (allSelected) {
      setSelectedRows(sel => sel.filter((i: number) => !displayRows.map((row: any) => row.index).includes(i)));
    } else {
      setSelectedRows(sel => [
        ...sel,
        ...displayRows.map((row: any) => row.index).filter((i: number) => !sel.includes(i))
      ]);
    }
  };

  // Highlight large expenses (demo: >1000)
  const isLarge = (amount: number) => amount > 1000;

  // Mobile card component
  const MobileExpenseCard = ({ expense, index }: { expense: any, index: number }) => {
    const isSelected = selectedRows.includes(index);
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-3 shadow-sm ${
          isLarge(expense.amount) ? 'border-l-4 border-l-red-500' : ''
        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      >
        {/* Header with checkbox and amount */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={isSelected} 
              onChange={() => toggleRow(index)}
              className="rounded"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</span>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${expense.type === 'INCOME' ? 'text-green-600' : expense.type === 'SAVINGS' ? 'text-blue-600' : 'text-red-600'}`}>
              ₹{expense.amount.toLocaleString()}
              {isLarge(expense.amount) && <span className="ml-1 text-red-500" title="Large expense">!</span>}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{expense.date}</div>
          </div>
        </div>

        {/* Category and Type */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
              {expense.category}
              {expense.category === 'Bills' && <span className="ml-1" title="Recurring" role="img" aria-label="Recurring">♻️</span>}
            </span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            expense.type === 'INCOME' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            expense.type === 'SAVINGS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {expense.type}
          </span>
        </div>

        {/* Description */}
        {expense.description && (
          <div className="mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">{expense.description}</p>
          </div>
        )}

        {/* Payment Method */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Payment: <span className="font-medium">{expense.paymentMethod}</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => handleView(expense)}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 rounded-md transition-colors"
          >
            View
          </button>
          <button
            onClick={() => handleEdit(expense)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 rounded-md transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(expense.id)}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

    // Helper to render a table cell (keeps JSX simpler and avoids complex nested ternaries)
    const renderCell = (cell: any, row: any) => {
      if (editingId === row.original.id) {
        if (cell.column.id === 'amount') {
          return (
            <input
              type="number"
              value={editForm.amount ?? ''}
              onChange={e => handleEditChange('amount', Number(e.target.value))}
              className="border px-1 py-0.5 rounded w-20"
            />
          );
        }
        if (cell.column.id === 'date') {
          return (
            <input
              type="date"
              value={editForm.date ?? ''}
              onChange={e => handleEditChange('date', e.target.value)}
              className="border px-1 py-0.5 rounded w-28"
            />
          );
        }
        if (cell.column.id === 'category') {
          return (
            <input
              type="text"
              value={editForm.category ?? ''}
              onChange={e => handleEditChange('category', e.target.value)}
              className="border px-1 py-0.5 rounded w-24"
            />
          );
        }
        if (cell.column.id === 'type') {
          return (
            <input
              type="text"
              value={editForm.type ?? ''}
              onChange={e => handleEditChange('type', e.target.value)}
              className="border px-1 py-0.5 rounded w-20"
            />
          );
        }
        if (cell.column.id === 'paymentMethod') {
          return (
            <input
              type="text"
              value={editForm.paymentMethod ?? ''}
              onChange={e => handleEditChange('paymentMethod', e.target.value)}
              className="border px-1 py-0.5 rounded w-24"
            />
          );
        }
        return null;
      }

      // read-only rendering
      if (cell.column.id === 'amount') {
        return (
          <div className="flex items-center justify-end gap-2">
            <span>₹{typeof cell.value === 'number' ? cell.value.toLocaleString() : (cell.value as string)}</span>
            {typeof cell.value === 'number' && isLarge(cell.value) && <span title="Large expense" className="ml-1 text-red-500 font-bold" role="img" aria-label="Large expense">!</span>}
          </div>
        );
      }
      if (cell.column.id === 'category') {
        return (
          <div className="inline-flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-800 dark:text-gray-200">{cell.value as string}</span>
            {cell.value === 'Bills' && <span title="Recurring" className="text-sm text-green-500" role="img" aria-label="Recurring">♻️</span>}
          </div>
        );
      }
      if (cell.column.id === 'type') {
        return (
          <div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cell.value === 'INCOME' ? 'bg-green-100 text-green-800' : cell.value === 'SAVINGS' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{cell.value}</span>
          </div>
        );
      }

      return cell.render('Cell');
    };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 relative min-h-screen w-full overflow-x-hidden max-w-full shadow-sm border border-gray-100 dark:border-gray-800">
      <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Recent Expenses</h2>
      {/* Info Bar */}
      <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:justify-between items-center">
        <div className="flex flex-wrap gap-3 items-center text-sm">
          <div className="text-sm text-gray-700 dark:text-gray-300">Total (filtered): <span className="font-semibold text-gray-900 dark:text-gray-100">₹{totalFiltered.toLocaleString()}</span></div>
          <div className="text-sm text-gray-700 dark:text-gray-300">This page: <span className="font-semibold text-gray-900 dark:text-gray-100">₹{totalPage.toLocaleString()}</span></div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Showing {page.length} of {filteredData.length} expenses</div>
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
          <button onClick={handleExportCSV} className="px-3 py-1 rounded bg-gray-800 dark:bg-gray-700 text-white hover:opacity-95 text-sm">Export CSV</button>
          {csvUrl && <a href={csvUrl} download="expenses.csv" className="text-sm text-gray-600 dark:text-gray-300 underline">Download</a>}
        </div>
      </div>
      {/* Category Breakdown */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(categoryBreakdown).map(([cat, amt]) => (
          <div key={cat} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium">{cat}: <span className="font-semibold">₹{amt.toLocaleString()}</span></div>
        ))}
      </div>
      {/* Filters */}
  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:justify-between items-center">
        <div className="flex flex-col gap-2 items-center w-full sm:w-auto">
          <div className="flex gap-2 mb-1">
            {[7, 15, 30, 90].map(days => (
              <button
                key={days}
                type="button"
                className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-medium border border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                onClick={() => {
                  const today = new Date();
                  const from = new Date(today);
                  from.setDate(today.getDate() - (days - 1));
                  setDateFrom(formatLocalDate(from));
                  setDateTo(formatLocalDate(today));
                }}
              >
                Last {days} days
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="border px-2 py-1 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 w-1/2 sm:w-auto"
              placeholder="From"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="border px-2 py-1 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 w-1/2 sm:w-auto"
              placeholder="To"
            />
          </div>
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search category or description"
              className="border px-3 py-2 rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 w-full text-sm"
              onFocus={() => setSearchSuggestions([])}
            />
            {searchSuggestions.length > 0 && (
              <ul className="absolute left-0 top-9 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow z-10 w-full max-h-40 overflow-y-auto text-xs sm:text-sm">
                {searchSuggestions.map((s: string) => (
                  <li key={s} className="px-3 py-1 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700" onClick={() => setSearchInput(s)}>{s}</li>
                ))}
              </ul>
            )}
          </div>
          <select
            value={usePaginate ? state.pageSize : 5}
            onChange={e => setPageSize(Number(e.target.value))}
            className="border px-2 py-1 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-xs sm:text-sm"
            disabled={!usePaginate}
          >
            {[5, 10, 20].map(size => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Table - Hidden on mobile, shown on md and up */}
      <div className="hidden md:block overflow-x-auto w-full max-w-full rounded-lg border border-gray-100 dark:border-gray-800">
        <table {...getTableProps()} className="min-w-full w-full max-w-full text-left bg-transparent text-sm" style={{ tableLayout: 'auto' }}>
          <thead className="sticky top-0 z-10">
            {headerGroups.map((headerGroup: any) => {
              const headerGroupProps = headerGroup.getHeaderGroupProps();
              const headerGroupKey = headerGroupProps.key;
              const { key, ...restHeaderGroupProps } = headerGroupProps;
              return (
                <tr key={headerGroupKey} {...restHeaderGroupProps} className="bg-gray-50 dark:bg-gray-900">
                  <th className="py-3 px-3 border-b text-center w-12">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                  </th>
                  <th className="py-3 px-3 border-b text-center w-12">#</th>
          {/* Insert View column before Actions */}
          {headerGroup.headers.map((column: any, idx: number) => {
            const { key, ...thProps } = column.getHeaderProps(column.getSortByToggleProps());
            return (
              <th
                key={key}
                {...thProps}
                className={`py-3 px-4 border-b font-medium text-gray-700 dark:text-gray-200 text-sm text-left cursor-pointer select-none whitespace-nowrap ${column.isSorted ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              >
                {column.render('Header')}
                <span>
                  {column.isSorted ? (column.isSortedDesc ? <span role="img" aria-label="sorted descending"> 🔽</span> : <span role="img" aria-label="sorted ascending"> 🔼</span>) : ''}
                </span>
              </th>
            );
          })}
          <th className="py-3 px-3 border-b text-center w-28">View</th>
          <th className="py-3 px-3 border-b text-center w-28">Actions</th>
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()}>
            {displayRows.map((row: any, idx: number) => {
              prepareRow(row);
              const isSelected = selectedRows.includes(row.index);
              const rowProps = row.getRowProps();
              const rowKey = rowProps.key;
              const { key, ...restRowProps } = rowProps;
              return (
                <tr
                  key={rowKey}
                  {...restRowProps}
                  className={`transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 ${isLarge(row.original.amount) ? 'border-l-4 border-red-500' : ''}`}
                >
                  <td className="py-3 px-2 border-b text-center">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleRow(row.index)} />
                  </td>
                  <td className="py-3 px-2 border-b text-center">{idx + 1}</td>
    {row.cells.map((cell: any, cidx: number) => {
              const cellProps = cell.getCellProps();
              const cellKey = cellProps.key;
              const { key, ...restCellProps } = cellProps;
              return (
                <td
                  key={cellKey}
                  {...restCellProps}
                  className={`py-3 px-4 border-b text-gray-700 dark:text-gray-200 whitespace-nowrap ${cell.column.id === 'amount' ? 'text-right font-semibold' : ''}`}
                >
      {renderCell(cell, row)}
                </td>
              );
            })}
                  {/* View column */}
                  <td className="py-3 px-3 border-b text-center">
                    <button aria-label="View details" title="View details" onClick={() => handleView(row.original)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 9z" />
                      </svg>
                    </button>
                  </td>
                  {/* Actions column */}
                  <td className="py-3 px-3 border-b text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button aria-label="Edit" title="Edit" onClick={() => handleEdit(row.original)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
                        </svg>
                      </button>
                      <button aria-label="Delete" title="Delete" onClick={() => handleDelete(row.original.id)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout - Shown on mobile, hidden on md and up */}
      <div className="md:hidden">
        {/* Mobile bulk actions header */}
        {selectedRows.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg mb-3 flex justify-between items-center">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {selectedRows.length} selected
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                Delete
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                Export
              </button>
            </div>
          </div>
        )}

        {/* Select all toggle for mobile */}
        <div className="flex justify-between items-center mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            Select all visible
          </label>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {displayRows.length} expenses
          </span>
        </div>

        {/* Mobile expense cards */}
        <div className="space-y-3">
          {displayRows.map((row: any, idx: number) => {
            prepareRow(row);
            return (
              <MobileExpenseCard 
                key={row.original.id} 
                expense={row.original} 
                index={row.index} 
              />
            );
          })}
        </div>

        {displayRows.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No expenses found</p>
            <p className="text-sm">Try adjusting your filters or date range</p>
          </div>
        )}
      </div>
      {selectedRows.length > 0 && (
        <div className="hidden md:flex gap-2 mt-2">
          <button className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm">Delete Selected</button>
          <button className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">Export Selected</button>
        </div>
      )}
      {/* Pagination controls only if paginating */}
      {usePaginate && (
        <div className="flex justify-between items-center mt-2">
          <button onClick={() => previousPage()} disabled={!canPreviousPage} className="px-3 py-1 border rounded disabled:opacity-50 dark:text-gray-100">Previous</button>
          <span className="dark:text-gray-100">
            Page{' '}
            <strong className="dark:text-gray-100">
              {state.pageIndex + 1} of {pageOptions.length}
            </strong>
          </span>
          <button onClick={() => nextPage()} disabled={!canNextPage} className="px-3 py-1 border rounded disabled:opacity-50 dark:text-gray-100">Next</button>
        </div>
      )}

      {/* Expense Details Modal */}
      <ExpenseDetailsModal open={modalOpen} onClose={() => setModalOpen(false)} expense={modalExpense} />
      {/* Floating Add Expense Button */}
      <button
        onClick={() => navigate('/add-expenses')}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl transition duration-200"
        title="Add Expense"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)', right: '1rem', left: 'auto', bottom: '1rem', maxWidth: '100vw', maxHeight: '100vh' }}
      >
        +
      </button>
    </div>
  );
}
