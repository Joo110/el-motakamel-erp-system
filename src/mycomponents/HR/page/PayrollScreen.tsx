// src/mycomponents/payrolls/components/PayrollScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, Edit2 } from 'lucide-react';
import usePayrolls from '../hooks/usePayrolls';
import { usePayInvoice } from '../../Precious/hooks/usePayInvoice';

type PayrollItem = {
  id: string;
  name: string;
  salary: string;
  overtime: string;
  bonus: string;
  deductions: string;
  total: string;
  date: string;
  status: 'Paid' | 'Unpaid';
  jobTitle?: string;
  overtimeHours?: string;
  overtimeAmount?: string;
  bonusAmount?: string;
  bonusPurpose?: string;
  deductionAmount?: string;
  deductionPurpose?: string;
};

const PayrollScreen: React.FC = () => {
  const { payrolls, fetch, updatePayroll } = usePayrolls();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { payInvoice, payPayroll, response: payResponse, loading: payLoading, error: payError } = usePayInvoice();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('November');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<PayrollItem | null>(null);

  const [modifyForm, setModifyForm] = useState({
    overtimeHours: '',
    overtimeAmount: '',
    bonusAmount: '',
    bonusPurpose: '',
    deductionAmount: '',
    deductionPurpose: '',
  });

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const statuses = ['All','Paid','Unpaid'];
  const departments = ['All Departments','Sales','Technical Support','HR','Software'];

  useEffect(() => {
    void fetch();
  }, [fetch]);

  // --- map backend payroll -> UI shape
  const mappedPayrolls: PayrollItem[] = useMemo(() => {
    if (!Array.isArray(payrolls)) return [];

    return payrolls.map((p: any) => {
      const id = p._id ?? String(p.id ?? (p.employee && (p.employee._id ?? p.employee.id)) ?? Math.random());
      const name = (p.employee && (p.employee.name ?? p.employee)) ?? p.name ?? 'Unknown';

      const salaryVal = (() => {
        if (typeof p.salary === 'number') return `${p.salary} SR`;
        if (typeof p.salary === 'string' && p.salary.trim() !== '') return p.salary;
        if (p.total && typeof p.total === 'number') return `${p.total} SR`;
        return '0 SR';
      })();

      const overtimeVal = (() => {
        if (p.overtime !== undefined && p.overtime !== null) {
          return (typeof p.overtime === 'number' ? `${p.overtime} SR` : String(p.overtime));
        }
        if (p.overtimeAmount) return `${p.overtimeAmount} SR`;
        return '0 SR';
      })();

      const bonusVal = (() => {
        if (p.bonus && typeof p.bonus === 'object') {
          const amt = p.bonus.amount ?? p.bonusAmount ?? 0;
          return `${amt} SR`;
        }
        if (p.bonusAmount) return `${p.bonusAmount} SR`;
        return '0 SR';
      })();

      const deductionVal = (() => {
        if (p.deduction && typeof p.deduction === 'object') {
          const amt = p.deduction.amount ?? p.deductionAmount ?? 0;
          return `${amt} SR`;
        }
        if (p.deductionAmount) return `${p.deductionAmount} SR`;
        return '0 SR';
      })();

      const totalVal = (() => {
        if (p.total !== undefined && p.total !== null) {
          return (typeof p.total === 'number' ? `${p.total} SR` : String(p.total));
        }
        const base = Number(p.salary ?? 0) || 0;
        const bonus = Number(p.bonus?.amount ?? p.bonusAmount ?? 0) || 0;
        const ded = Number(p.deduction?.amount ?? p.deductionAmount ?? 0) || 0;
        const ot = Number(p.overtime ?? p.overtimeAmount ?? 0) || 0;
        const calc = base + ot + bonus - ded;
        return `${Math.round(calc)} SR`;
      })();

      const dateVal = (() => {
        const d = p.date ?? p.createdAt ?? p.updatedAt;
        try {
          return d ? new Date(d).toLocaleDateString() : '—';
        } catch {
          return String(d ?? '—');
        }
      })();

      const statusVal = (typeof p.status === 'string' && p.status.toLowerCase() === 'paid') ? 'Paid' : 'Unpaid';

      return {
        id,
        name,
        salary: salaryVal,
        overtime: overtimeVal,
        bonus: bonusVal,
        deductions: deductionVal,
        total: totalVal,
        date: dateVal,
        status: statusVal as 'Paid' | 'Unpaid',
        jobTitle: p.employee?.jobTitle ?? p.jobTitle ?? '',
        overtimeHours: p.overtimeHours ? String(p.overtimeHours) : undefined,
        overtimeAmount: p.overtimeAmount ? String(p.overtimeAmount) : undefined,
        bonusAmount: p.bonus?.amount ? String(p.bonus.amount) : (p.bonusAmount ? String(p.bonusAmount) : undefined),
        bonusPurpose: p.bonus?.purpose ?? p.bonusPurpose ?? '',
        deductionAmount: p.deduction?.amount ? String(p.deduction.amount) : (p.deductionAmount ? String(p.deductionAmount) : undefined),
        deductionPurpose: p.deduction?.purpose ?? p.deductionPurpose ?? '',
      };
    });
  }, [payrolls]);

  useEffect(() => {
    console.log("PayrollScreen: raw payrolls from hook:", payrolls);
    console.log("PayrollScreen: mappedPayrolls:", mappedPayrolls);
  }, [payrolls, mappedPayrolls]);

  const filteredPayroll = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return mappedPayrolls.filter((item) => {
      if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;

      if (selectedMonth && selectedMonth !== '') {
        try {
          const d = new Date(item.date);
          if (!isNaN(d.getTime())) {
            const monthName = d.toLocaleString(undefined, { month: 'long' });
            if (monthName !== selectedMonth) return false;
          } else {
            if (!String(item.date).toLowerCase().includes(selectedMonth.toLowerCase())) return false;
          }
        } catch {
          // ignore
        }
      }

      if (selectedDepartment !== 'All Departments') {
        // UI unchanged (no dept field)
      }

      if (!q) return true;
      return (
        (item.name ?? '').toLowerCase().includes(q) ||
        (item.id ?? '').toLowerCase().includes(q)
      );
    });
  }, [mappedPayrolls, searchTerm, selectedMonth, selectedStatus, selectedDepartment]);

  const displayed = useMemo(() => {
    return filteredPayroll.slice(0, entriesPerPage);
  }, [filteredPayroll, entriesPerPage]);

  // Handlers using hook.updatePayroll
const handlePaySalary = async (id: string) => {
  try {
    // 1) استدعاء endpoint الدفع عبر usePayInvoice hook
    await payPayroll(id); // <-- هنا استخدمنا payPayroll بدل pay

    try {
      await updatePayroll(id, { status: 'paid' });
    } catch (updateErr) {
      console.error('Failed to update payroll status after pay:', updateErr);
    }

  } catch (err) {
    console.error('Pay failed', err);
  }
};

  const handleModify = (employee: PayrollItem) => {
    setSelectedEmployee(employee);
    setModifyForm({
      overtimeHours: employee.overtimeHours || '',
      overtimeAmount: employee.overtimeAmount || '',
      bonusAmount: employee.bonusAmount || '',
      bonusPurpose: employee.bonusPurpose || '',
      deductionAmount: employee.deductionAmount || '',
      deductionPurpose: employee.deductionPurpose || '',
    });
    setShowModifyModal(true);
  };

  const handleSaveOvertime = async () => {
    if (!selectedEmployee) return;
    const payload: any = {};
    const ot = modifyForm.overtimeAmount ? Number(modifyForm.overtimeAmount) : undefined;
    if (ot !== undefined && !isNaN(ot)) payload.overtime = ot;
    if (modifyForm.overtimeHours) payload.overtimeHours = modifyForm.overtimeHours;
    try {
      await updatePayroll(selectedEmployee.id, payload);
      setShowModifyModal(false);
    } catch (err) {
      console.error('Save overtime failed', err);
    }
  };

  const handleSaveBonus = async () => {
    if (!selectedEmployee) return;
    const amt = modifyForm.bonusAmount ? Number(modifyForm.bonusAmount) : 0;
    const payload: any = {
      bonus: {
        amount: isNaN(amt) ? 0 : amt,
        purpose: modifyForm.bonusPurpose ?? '',
      }
    };
    try {
      await updatePayroll(selectedEmployee.id, payload);
      setShowModifyModal(false);
    } catch (err) {
      console.error('Save bonus failed', err);
    }
  };

  const handleSaveDeduction = async () => {
    if (!selectedEmployee) return;
    const amt = modifyForm.deductionAmount ? Number(modifyForm.deductionAmount) : 0;
    const payload: any = {
      deduction: {
        amount: isNaN(amt) ? 0 : amt,
        purpose: modifyForm.deductionPurpose ?? '',
      }
    };
    try {
      await updatePayroll(selectedEmployee.id, payload);
      setShowModifyModal(false);
    } catch (err) {
      console.error('Save deduction failed', err);
    }
  };

  const handlePayTotal = async () => {
    if (!selectedEmployee) return;
    try {
      await updatePayroll(selectedEmployee.id, { status: 'paid' });
      setShowModifyModal(false);
    } catch (err) {
      console.error('Pay total failed', err);
    }
  };

  const calculateTotal = () => {
    if (!selectedEmployee) return '0';
    const baseSalary = parseFloat(selectedEmployee.salary.replace(/[^\d.]/g, '')) || 0;
    const overtime = parseFloat(modifyForm.overtimeAmount) || 0;
    const bonus = parseFloat(modifyForm.bonusAmount) || 0;
    const deduction = parseFloat(modifyForm.deductionAmount) || 0;
    return (baseSalary + overtime + bonus - deduction).toFixed(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR Management</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span>Dashboard</span>
              <span>&gt;</span>
              <span>Payroll</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Search Section */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Employees Search</h2>
              <Filter size={20} className="text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-4 items-end">
              {/* Search Input */}
              <div className="flex-1 min-w-[250px] relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search employees by name, id, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                />
              </div>

              {/* Month */}
              <div className="w-44">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                >
                  {months.map((month) => <option key={month} value={month}>{month}</option>)}
                </select>
              </div>

              {/* Status */}
              <div className="w-36">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                >
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>

              {/* Department */}
              <div className="w-48">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                >
                  {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>

              {/* Buttons */}
              <button className="px-6 py-2.5 bg-slate-700 text-white rounded-xl hover:bg-slate-800 text-sm flex items-center gap-2">
                <Search size={16} />
                Search
              </button>
              <button className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 text-sm">
                Reset
              </button>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="p-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">November Payroll</h3>
              <span className="text-sm text-gray-500">
                Showing {Math.min(1, displayed.length)}-{displayed.length} of {filteredPayroll.length} employees
              </span>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Id</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Salary</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Overtime</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Bonus</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Deductions</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium text-sm">
                        {item.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <span className="text-sm text-gray-900">{item.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.salary}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.overtime}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.bonus}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.deductions}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.total}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      {item.status === 'Paid' ? (
                        <>
                          <span className="text-sm text-green-600">{item.status}</span>
                        </>
                      ) : (
                        <button
                          onClick={() => handlePaySalary(item.id)}
                          className="px-4 py-1 bg-slate-700 text-white text-sm rounded-xl hover:bg-slate-800"
                        >
                          Pay
                        </button>
                      )}
                      <button
                        onClick={() => handleModify(item)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-300"
                      >
                        Modify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-700">entries</span>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-4 py-2 text-sm bg-slate-700 text-white rounded-xl">1</button>
                <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">2</button>
                <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">3</button>
                <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modify Salary Modal */}
      {showModifyModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Modify Salary</h2>
              <button onClick={() => setShowModifyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Employee Info */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="w-11 h-11 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-medium text-sm">
                  {selectedEmployee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{selectedEmployee.name}</h3>
                  <p className="text-xs text-gray-500">{selectedEmployee.jobTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">id: {selectedEmployee.id}</p>
                </div>
              </div>

              {/* Grid Sections (Overtime / Bonus / Deduction) */}
              <div className="grid grid-cols-3 gap-5 mb-6">
                {/* Over time */}
                <div className="border border-gray-200 rounded-2xl p-5">
                  <h4 className="font-medium text-gray-900 mb-4 text-sm">Over time</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Over time</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={modifyForm.overtimeHours}
                          onChange={(e) => setModifyForm({...modifyForm, overtimeHours: e.target.value})}
                          placeholder="2 hours"
                          className="flex-1 px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 outline-none"
                        />
                        <button className="p-1.5 text-gray-400 hover:text-gray-600">
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <input
                          type="text"
                          value={modifyForm.overtimeAmount}
                          onChange={(e) => setModifyForm({...modifyForm, overtimeAmount: e.target.value})}
                          placeholder="395"
                          className="flex-1 bg-transparent border-0 text-sm focus:outline-none"
                        />
                        <span className="text-xs text-gray-500">SR</span>
                      </div>
                    </div>
                    <button onClick={handleSaveOvertime} className="w-full px-4 py-2 bg-slate-700 text-white text-xs rounded-full hover:bg-slate-800 font-medium">
                      Save
                    </button>
                  </div>
                </div>

                {/* Bonus */}
                <div className="border border-gray-200 rounded-2xl p-5">
                  <h4 className="font-medium text-gray-900 mb-4 text-sm">Bonus</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Amount</label>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <input
                          type="text"
                          value={modifyForm.bonusAmount}
                          onChange={(e) => setModifyForm({...modifyForm, bonusAmount: e.target.value})}
                          placeholder="0"
                          className="flex-1 bg-transparent border-0 text-sm focus:outline-none"
                        />
                        <span className="text-xs text-gray-500">SR</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Purpose</label>
                      <textarea
                        value={modifyForm.bonusPurpose}
                        onChange={(e) => setModifyForm({...modifyForm, bonusPurpose: e.target.value})}
                        placeholder=""
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 outline-none resize-none"
                      />
                    </div>
                    <button onClick={handleSaveBonus} className="w-full px-4 py-2 bg-slate-700 text-white text-xs rounded-full hover:bg-slate-800 font-medium">
                      Save
                    </button>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-gray-200 rounded-2xl p-5">
                  <h4 className="font-medium text-gray-900 mb-4 text-sm">Deductions</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Amount</label>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <input
                          type="text"
                          value={modifyForm.deductionAmount}
                          onChange={(e) => setModifyForm({...modifyForm, deductionAmount: e.target.value})}
                          placeholder="0"
                          className="flex-1 bg-transparent border-0 text-sm focus:outline-none"
                        />
                        <span className="text-xs text-gray-500">SR</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Purpose</label>
                      <textarea
                        value={modifyForm.deductionPurpose}
                        onChange={(e) => setModifyForm({...modifyForm, deductionPurpose: e.target.value})}
                        placeholder=""
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 outline-none resize-none"
                      />
                    </div>
                    <button onClick={handleSaveDeduction} className="w-full px-4 py-2 bg-slate-700 text-white text-xs rounded-full hover:bg-slate-800 font-medium">
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Total Salary Section */}
              <div className="border border-gray-200 rounded-2xl p-5">
                <h4 className="font-medium text-gray-900 mb-4 text-sm">Total Salary</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Base Salary</p>
                    <p className="text-base font-semibold text-gray-900">{selectedEmployee.salary}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-base font-semibold text-gray-900">{calculateTotal()} SR</p>
                  </div>
                  <button onClick={handlePayTotal} className="px-8 py-2.5 bg-slate-700 text-white text-sm rounded-full hover:bg-slate-800 font-medium">
                    Pay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollScreen;
