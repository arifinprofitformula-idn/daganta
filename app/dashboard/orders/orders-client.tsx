'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Calendar, 
  User, 
  MapPin, 
  FileText, 
  CreditCard, 
  ChevronRight, 
  X, 
  Check, 
  Loader2, 
  Search,
  MessageSquare
} from 'lucide-react';
import { OrderStatus } from '@prisma/client';
import { updateOrderStatusAction } from './actions';

interface OrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  productNameSnapshot: string;
  variantNameSnapshot: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weightGram: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discountTotal: number;
  grandTotal: number;
  notes: string | null;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
  } | null;
  items: OrderItem[];
}

interface OrdersClientProps {
  orders: Order[];
  tenantName: string;
}

const statusOptions = [
  { value: OrderStatus.PENDING_PAYMENT, label: 'Menunggu Pembayaran', color: 'bg-amber-950/40 text-amber-400 border border-amber-500/20' },
  { value: OrderStatus.PROCESSING, label: 'Diproses', color: 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/20' },
  { value: OrderStatus.SHIPPED, label: 'Dikirim', color: 'bg-blue-950/40 text-blue-400 border border-blue-500/20' },
  { value: OrderStatus.COMPLETED, label: 'Selesai', color: 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' },
  { value: OrderStatus.CANCELED, label: 'Dibatalkan', color: 'bg-rose-950/40 text-rose-450 border border-rose-500/10' },
];

export default function OrdersClient({ orders, tenantName }: OrdersClientProps) {
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState<'ALL' | OrderStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalStatus, setModalStatus] = useState<OrderStatus | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Format helper
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: OrderStatus) => {
    const matched = statusOptions.find(opt => opt.value === status);
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide ${matched?.color || 'bg-slate-800 text-slate-350 border border-slate-700/50'}`}>
        {matched?.label || status}
      </span>
    );
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'ALL' || order.status === activeTab;
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer?.phone || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setModalStatus(order.status);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleCloseDetail = () => {
    if (isUpdating) return;
    setSelectedOrder(null);
    setModalStatus(null);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !modalStatus || isUpdating) return;

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const res = await updateOrderStatusAction(selectedOrder.id, modalStatus);

      if (res.success) {
        setUpdateSuccess(true);
        // Perbarui data local modal agar langsung merefleksikan perubahan
        setSelectedOrder((prev) => prev ? { ...prev, status: modalStatus } : null);
        
        // Refresh data page server
        router.refresh();
        
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 1500);
      } else {
        setUpdateError(res.error || 'Gagal memperbarui status pesanan.');
      }
    } catch (err: any) {
      console.error('Update status client error:', err);
      setUpdateError('Terjadi kesalahan tidak terduga.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Tabs row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-850 rounded-2xl p-4 shadow-md">
        
        {/* Saringan Tab Status */}
        <div className="flex flex-wrap gap-1.5 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wide uppercase transition-all
              ${activeTab === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
          >
            Semua
          </button>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setActiveTab(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wide uppercase transition-all
                ${activeTab === opt.value
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Pencarian */}
        <div className="relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Cari order, nama, atau WA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Orders List Table */}
      {filteredOrders.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900 border border-slate-850 rounded-2xl p-8 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center text-slate-650 shadow-inner">
            <ShoppingBag className="w-5 h-5 shrink-0" />
          </div>
          <div className="space-y-1 max-w-xs">
            <h3 className="font-bold text-slate-200 text-sm">Pesanan Tidak Ditemukan</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-medium">
              Tidak ada pesanan masuk yang cocok dengan penyaringan atau pencarian Anda.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-850 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Nomor Pesanan</th>
                  <th className="px-6 py-4">Tanggal Masuk</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Total Belanja</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => handleOpenDetail(order)}
                    className="hover:bg-slate-850/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-bold text-slate-200 font-mono text-[11px] select-all">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-slate-450 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-300">{order.customer?.name || '-'}</p>
                        <p className="text-[10px] text-slate-500 font-semibold select-all">{order.customer?.phone || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-indigo-400">
                      {formatRupiah(order.grandTotal)}
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(order)}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 hover:text-white text-[10px] font-bold rounded-lg transition-all"
                      >
                        <span>Kelola</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-850 flex items-center justify-between bg-slate-950/40">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Dashboard Detail Pesanan</span>
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-black text-white font-mono">{selectedOrder.orderNumber}</h2>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="p-2 text-slate-450 hover:text-white bg-slate-950 border border-slate-850 hover:border-slate-750 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (Customer and Shipping Address) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Profil Pelanggan */}
                <div className="bg-slate-950/40 border border-slate-850/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-850 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    Profil Pelanggan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">Nama Lengkap</span>
                      <span className="font-bold text-slate-200">{selectedOrder.customer?.name}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">Nomor WhatsApp</span>
                      <a 
                        href={`https://wa.me/${selectedOrder.customer?.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-emerald-400 hover:underline inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-current shrink-0" />
                        <span>{selectedOrder.customer?.phone}</span>
                      </a>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <span className="text-[10px] text-slate-500 font-bold block">Alamat Email</span>
                      <span className="font-bold text-slate-350">{selectedOrder.customer?.email || <em className="text-slate-600">Tidak diisi</em>}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Alamat Pengiriman & Catatan */}
                <div className="bg-slate-950/40 border border-slate-850/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-850 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    Alamat Pengiriman & Catatan
                  </h3>
                  <div className="text-xs space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold block">Alamat Lengkap</span>
                      <p className="bg-slate-900 border border-slate-850 rounded-xl p-3 text-slate-300 font-medium leading-relaxed whitespace-pre-line select-all">
                        {selectedOrder.customer?.address || 'Alamat belum diatur'}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold block flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Catatan Pembeli</span>
                      </span>
                      <p className="bg-slate-900/60 border border-slate-850 rounded-xl p-3 text-slate-400 font-medium leading-normal italic">
                        {selectedOrder.notes || 'Tidak ada catatan khusus dari pembeli.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Item Rincian Belanja */}
                <div className="bg-slate-950/40 border border-slate-850/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-850 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    Rincian Belanja
                  </h3>
                  <div className="divide-y divide-slate-850">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between text-xs font-medium">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-200 leading-snug">{item.productNameSnapshot}</p>
                          {item.variantNameSnapshot && (
                            <p className="text-[10px] text-slate-400 font-semibold">Varian: {item.variantNameSnapshot}</p>
                          )}
                          <p className="text-[10px] text-slate-500 font-medium">
                            Kuantitas: {item.quantity} unit ({item.weightGram >= 1000 ? `${(item.weightGram/1000).toFixed(2)} kg` : `${item.weightGram}g`} / unit)
                          </p>
                        </div>
                        <div className="text-right space-y-0.5 shrink-0">
                          <p className="font-bold text-slate-300">{formatRupiah(item.totalPrice)}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{item.quantity}x @ {formatRupiah(item.unitPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column (Totals and Update Status) */}
              <div className="space-y-6">
                
                {/* A. Ringkasan Pembayaran */}
                <div className="bg-slate-950/40 border border-slate-850/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-850 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    Ringkasan Tagihan
                  </h3>

                  <div className="space-y-3 text-xs font-medium text-slate-400">
                    <div className="flex justify-between">
                      <span>Subtotal Produk</span>
                      <span className="text-slate-200 font-bold">{formatRupiah(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ongkos Kirim</span>
                      <span className="text-slate-200 font-bold">{formatRupiah(selectedOrder.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Diskon</span>
                      <span className="text-slate-200 font-bold">– {formatRupiah(selectedOrder.discountTotal)}</span>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-250 uppercase">Grand Total</span>
                      <span className="text-sm font-black text-indigo-400 select-all">{formatRupiah(selectedOrder.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* B. Update Status Panel */}
                <div className="bg-slate-950/40 border border-slate-850/80 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-850 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    Perbarui Status
                  </h3>

                  <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
                    
                    {updateError && (
                      <div className="p-3 bg-rose-950/30 border border-rose-500/20 text-rose-400 rounded-xl text-[10.5px] font-semibold leading-normal">
                        ⚠️ {updateError}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label htmlFor="status-select" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Pilih Status Baru</label>
                      <select
                        id="status-select"
                        value={modalStatus || ''}
                        onChange={(e) => setModalStatus(e.target.value as OrderStatus)}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdating || modalStatus === selectedOrder.status}
                      className={`w-full py-3 px-4 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5
                        ${updateSuccess 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                          : modalStatus === selectedOrder.status
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15'
                        }`}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : updateSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Berhasil Disimpan</span>
                        </>
                      ) : (
                        <span>Simpan Perubahan</span>
                      )}
                    </button>
                  </form>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
