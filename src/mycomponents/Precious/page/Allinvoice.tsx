// Allinvoice.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import usePurchaseInvoices from '../hooks/useAllinvoices';
import { usePayInvoice } from '../hooks/usePayInvoice';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Invoice {
  orderNumber: string;
  supplier: string;
  inventory?: string;
  totalDue: string;
  remaining: string;
  requestedBy?: string;
  lastPayment: string;
  orderTime?: string;
  deliveredTotal?: string;
  totalPrice?: string;
  _id?: string;
  id?: string;
  raw?: any;
  [key: string]: any;
}

const formatMoney = (n: number | string) => {
  const num = typeof n === 'number' ? n : parseFloat(String(n) || '0');
  if (Number.isNaN(num)) return '0.00 EGP';
  return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`;
};

const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSubmit: (amount: string) => void;
  loading: boolean;
}> = ({ isOpen, onClose, invoice, onSubmit, loading }) => {
  const { t } = useTranslation();
  const [paymentAmount, setPaymentAmount] = useState('');

  if (!isOpen || !invoice) return null;

  const handleSubmit = () => {
    if (!paymentAmount) {
      toast.error(t('please_enter_payment_amount'));
      return;
    }
    onSubmit(paymentAmount);
  };

  const handleClose = () => {
    setPaymentAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-red-500 font-bold text-lg">⚠️</span>
            <h3 className="text-lg font-semibold">{t('supplier_payment')}</h3>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">{t('invoice_number')}</p>
          <p className="font-semibold">{invoice.orderNumber}</p>
          <p className="text-xs text-gray-400 mt-1">{t('id')}: {invoice._id ?? invoice.id}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('payment_amount')}</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="223"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t('processing')}
                </>
              ) : (
                t('new_payment')
              )}
            </button>
          </div>

          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('total')}:</span>
              <span className="font-semibold">{invoice.totalDue}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">{t('remaining')}:</span>
              <span className="font-semibold text-red-600">{invoice.remaining}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Allinvoice: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'unpaid' | 'partial' | 'paid'>('unpaid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { invoices, refresh } = usePurchaseInvoices();
  const { payInvoice, loading: paymentLoading } = usePayInvoice();

  // now payInvoice expects (invoiceId, { amount }) -> hook adds defaults via service
  const pay = async (invoiceId: string, amount: number) => {
    return await payInvoice(invoiceId, { amount });
  };

  const mappedInvoices: Invoice[] = useMemo(() => {
    if (!Array.isArray(invoices)) return [];
    return invoices.map((inv: any) => {
      const orderNumber = inv.invoiceNumber ?? inv.orderNumber ?? inv.number ?? (inv._id ? String(inv._id).slice(-8).toUpperCase() : '—');

      const supplier = typeof inv.supplier === 'string'
        ? inv.supplier
        : (inv.supplier?.name ?? inv.supplier?.company ?? 'Unknown');

      const totalValNum = Number(inv.totalPayment ?? inv.total ?? inv.totalPrice ?? 0) || 0;
      const paidValNum = Number(inv.paidAmount ?? inv.paid ?? 0) || 0;

      let remainingNum = 0;
      if (typeof inv.remaining === 'number' || (typeof inv.remaining === 'string' && inv.remaining !== '')) {
        const maybe = Number(inv.remaining);
        remainingNum = Number.isFinite(maybe) ? maybe : (inv.paymentStatus?.toString().toLowerCase() === 'paid' ? 0 : totalValNum);
      } else if (paidValNum > 0) {
        remainingNum = Math.max(0, totalValNum - paidValNum);
      } else if ((inv.paymentStatus ?? '').toString().toLowerCase() === 'paid') {
        remainingNum = 0;
      } else {
        remainingNum = totalValNum;
      }

      const lastPayment = inv.lastPayment ?? inv.lastPaidAt ?? inv.updatedAt ?? '';

      return {
        orderNumber: String(orderNumber),
        supplier: String(supplier),
        inventory: inv.inventoryName ?? inv.inventory ?? undefined,
        totalDue: formatMoney(totalValNum),
        remaining: formatMoney(remainingNum),
        requestedBy: inv.requestedBy ?? inv.requester ?? undefined,
        lastPayment: String(lastPayment ?? ''),
        orderTime: inv.orderTime ?? inv.createdAt ?? undefined,
        deliveredTotal: inv.deliveredTotal ?? undefined,
        totalPrice: inv.totalPrice ?? undefined,
        _id: inv._id ?? inv.id,
        id: inv.id ?? inv._id,
        raw: inv,
      } as Invoice;
    });
  }, [invoices]);

  const { unpaidInvoices, partialInvoices, paidInvoices } = useMemo(() => {
    const unpaid: Invoice[] = [];
    const partial: Invoice[] = [];
    const paid: Invoice[] = [];

    mappedInvoices.forEach((invAny: any) => {
      const raw = invAny.raw ?? {};
      const statusRaw = (
        raw.paymentStatus ??
        raw.status ??
        raw.state ??
        ''
      )
        .toString()
        .toLowerCase();

      if (statusRaw === 'paid') {
        paid.push(invAny);
      } else if (statusRaw.includes('partial') || statusRaw.includes('partially') || statusRaw === 'partial_payment') {
        partial.push(invAny);
      } else {
        unpaid.push(invAny);
      }
    });

    return { unpaidInvoices: unpaid, partialInvoices: partial, paidInvoices: paid };
  }, [mappedInvoices]);

  const handlePay = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handlePaymentSubmit = async (amount: string) => {
    if (!selectedInvoice?._id && !selectedInvoice?.id) {
      toast.error(t('invoice_id_not_found'));
      return;
    }

    const invoiceId = selectedInvoice._id ?? selectedInvoice.id ?? '';

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error(t('invalid_amount'));
      return;
    }

    try {
await pay(invoiceId, numericAmount);

      toast.success(
        t('payment_processed_successfully').replace('{amount}', amount)
      );

      setIsModalOpen(false);
      setSelectedInvoice(null);
      await refresh();
    } catch (error: any) {
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors)) {
        errors.forEach((e) => toast.error(e.msg));
      } else {
        toast.error(error?.message || t('failed_to_process_payment'));
      }
    }
  };


  const getCurrentInvoicesFull = () => {
    switch (activeTab) {
      case 'unpaid':
        return unpaidInvoices;
      case 'partial':
        return partialInvoices;
      case 'paid':
        return paidInvoices;
      default:
        return [];
    }
  };

  const fullList = getCurrentInvoicesFull();
  const totalItems = fullList.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(Math.max(1, page), pageCount);

  const pagedInvoices = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return fullList.slice(start, start + perPage);
  }, [fullList, currentPage, perPage]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>{t('dashboard')}</span>
          <span>›</span>
          <span>{t('precious')}</span>
          <span>›</span>
          <span>{t('invoices')}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('precious_management')}</h1>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => { setActiveTab('unpaid'); setPage(1); }}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'unpaid'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('unpaid')}
          </button>
          <button
            onClick={() => { setActiveTab('partial'); setPage(1); }}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'partial'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('partial')}
          </button>
          <button
            onClick={() => { setActiveTab('paid'); setPage(1); }}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'paid'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('paid')}
          </button>
        </div>

        <div className="p-6">
          {/* table & pagination unchanged */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    {t('order_number')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    {t('supplier')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    {t('total_due')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    {t('remaining')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    {t('last_payment')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    {t('action')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedInvoices.map((invoice, index) => (
                  <tr key={invoice._id ?? invoice.id ?? index} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm">{invoice.orderNumber}</td>
                    <td className="py-4 px-4 text-sm">{invoice.supplier}</td>
                    <td className="py-4 px-4 text-sm">{invoice.totalDue}</td>
                    <td className="py-4 px-4 text-sm">{invoice.remaining}</td>
                    <td className="py-4 px-4 text-sm">{invoice.lastPayment}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/precious/supplier/InvoiceScreen/${invoice._id ?? invoice.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {t('view')}
                        </button>
                        {activeTab !== 'paid' && (
                          <button
                            onClick={() => handlePay(invoice)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm font-medium transition-colors"
                          >
                            {t('pay')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {pagedInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">{t('no_invoices_found')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('show')}</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">{t('entries')}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {t('previous')}
              </button>

              {Array.from({ length: pageCount }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`px-3 py-1 rounded text-sm ${pNum === currentPage ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                >
                  {pNum}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={currentPage === pageCount}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {t('next')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onSubmit={handlePaymentSubmit}
        loading={paymentLoading}
      />
    </div>
  );
};

export default Allinvoice;
