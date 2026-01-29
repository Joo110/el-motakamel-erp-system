// src/services/saleOrders.ts
import axiosClient from '@/lib/axiosClient';
import type { AxiosRequestConfig } from 'axios';



export type PurchaseOrderProductPayload = {
  productId: string;
  inventoryId: string;
  name?: string;
  quantity: number;
  price: number;
  discount?: number;
};

export type CreatePurchaseOrderPayload = {
  customerId?: string;
  supplierId?: string;
  organizationId?: string;
  products: PurchaseOrderProductPayload[];
  expectedDeliveryDate?: string;
  currency?: string;
  notes?: string;
  createdBy?: string;
  shippingCost?: number;
};

export type PurchaseOrderProduct = PurchaseOrderProductPayload & {
  _id?: string;
  total?: number;
  product?: any;
  inventory?: string;
};

export type PurchaseOrder = {
  _id?: string; // optional because backend may return `id` instead
  id?: string;
  supplierId?: string;
  customerId?: string;
  customer?: any;
  organizationId?: string;
  organization?: any;
  products: PurchaseOrderProduct[];
  expectedDeliveryDate?: string;
  currency?: string;
  status?: string;
  notes?: string;
  createdBy?: any;
  createdAt?: string;
  updatedAt?: string;
  invoiceNumber?: string;
  totalAmount?: number;
  [k: string]: any;
};

/* ----------------------
   HELPERS
   ---------------------- */

const BASE = '/sale-orders';



function normalizeCustomer(c: any) {
  if (!c) return c;
  if (typeof c === 'string') return { _id: c, id: c };
  return {
    ...c,
    _id: c._id ?? c.id ?? undefined,
    id: c.id ?? c._id ?? undefined,
  };
}

function normalizeOrganization(o: any) {
  if (!o) return o;
  if (typeof o === 'string') return { _id: o, id: o };
  return {
    ...o,
    _id: o._id ?? o.id ?? undefined,
    id: o.id ?? o._id ?? undefined,
  };
}

function normalizeProductEntry(pe: any): PurchaseOrderProduct {
  if (!pe) return {} as PurchaseOrderProduct;

  // product object may be nested under `product` or product data may be flattened
  const productObj = pe.product ?? (pe.productId ? { id: pe.productId, name: pe.name, code: pe.code } : undefined);

  const normalizedProduct = productObj
    ? { ...productObj, _id: productObj._id ?? productObj.id ?? undefined, id: productObj.id ?? productObj._id ?? undefined }
    : undefined;

  const productId = pe.productId ?? normalizedProduct?._id ?? normalizedProduct?.id ?? pe.product?._id ?? pe.product?.id;
  const inventoryId = pe.inventoryId ?? pe.inventory?._id ?? pe.inventory ?? undefined;

  const quantity = Number(pe.quantity ?? pe.qty ?? pe.units ?? 0) || 0;
  const price = Number(pe.price ?? pe.retailPrice ?? pe.wholesalePrice ?? pe.unitPrice ?? 0) || 0;
  const discount = Number(pe.discount ?? 0) || 0;

  const computedTotal = Number(pe.total ?? pe.lineTotal ?? pe.amount ?? (quantity * price * (1 - discount / 100))) || 0;

  return {
    ...pe,
    _id: pe._id ?? pe.id ?? undefined,
    product: normalizedProduct ?? pe.product,
    productId,
    inventoryId,
    quantity,
    price,
    discount,
    total: computedTotal,
  } as PurchaseOrderProduct;
}

function normalizeOrder(o: any): PurchaseOrder {
  if (!o || typeof o !== 'object') return o;

  const orderObj = {
    ...o,
    _id: o._id ?? o.id ?? undefined,
    id: o.id ?? o._id ?? undefined,
    customer: normalizeCustomer(o.customer ?? (o.customerId ? (typeof o.customer === 'string' ? { id: o.customer } : o.customer) : undefined)),
    customerId: o.customerId ?? (o.customer && (o.customer._id ?? o.customer.id)) ?? undefined,
    organization: normalizeOrganization(o.organization ?? (o.organizationId ? (typeof o.organization === 'string' ? { id: o.organization } : o.organization) : undefined)),
    organizationId: o.organizationId ?? (o.organization && (o.organization._id ?? o.organization.id)) ?? undefined,
    createdBy: o.createdBy ? { ...o.createdBy, _id: o.createdBy._id ?? o.createdBy.id ?? o.createdBy } : o.createdBy,
    invoiceNumber: o.invoiceNumber ?? o.invoiceNo ?? o.invoice ?? undefined,
    totalAmount: Number(o.totalAmount ?? o.total ?? o.grandTotal ?? o.amount ?? 0) || undefined,
    products: Array.isArray(o.products) ? o.products.map(normalizeProductEntry) : Array.isArray(o.items) ? o.items.map(normalizeProductEntry) : [],
    expectedDeliveryDate: o.expectedDeliveryDate ?? o.expected_delivery_date ?? undefined,
    currency: o.currency ?? undefined,
    status: o.status ?? o.state ?? undefined,
    notes: o.notes ?? o.note ?? undefined,
    createdAt: o.createdAt ?? o.created_at ?? undefined,
    updatedAt: o.updatedAt ?? o.updated_at ?? undefined,
  };

  // prefer _id inside nested objects
  if (orderObj.customer && orderObj.customer._id) orderObj.customerId = orderObj.customer._id;
  if (orderObj.organization && orderObj.organization._id) orderObj.organizationId = orderObj.organization._id;

  return orderObj as PurchaseOrder;
}

function extractListFromResponse(resData: any): PurchaseOrder[] {
  if (!resData) return [];

  // possible shapes
  let list: any[] = [];

  if (Array.isArray(resData)) list = resData;
  else if (resData.data && Array.isArray(resData.data)) list = resData.data;
  else if (resData.data && Array.isArray(resData.data.purchases)) list = resData.data.purchases;
  else if (Array.isArray(resData.purchases)) list = resData.purchases;
  else if (Array.isArray(resData.purchaseOrders)) list = resData.purchaseOrders;
  else if (resData.data && typeof resData.data === 'object') {
    // find first array inside data
    const maybe = Object.values(resData.data).find((v) => Array.isArray(v));
    if (Array.isArray(maybe)) list = maybe as any[];
  }

  return (list ?? []).map((o) => normalizeOrder(o));
}

function extractSingleFromResponse(resData: any): PurchaseOrder | null {
  if (!resData) return null;

  let maybe: any = null;

  // common wrapper patterns
  if (resData.data && resData.data.purchase) maybe = resData.data.purchase;
  else if (resData.purchase) maybe = resData.purchase;
  else if (resData.data && Array.isArray(resData.data.purchases) && resData.data.purchases.length > 0) maybe = resData.data.purchases[0];
  else if (resData.data && typeof resData.data === 'object' && (resData.data._id || resData.data.id || resData.data.invoiceNumber)) maybe = resData.data;
  else if (resData._id || resData.id || resData.invoiceNumber) maybe = resData;
  else if (resData.data && Array.isArray(resData.data) && resData.data.length === 1) maybe = resData.data[0];

  return maybe ? normalizeOrder(maybe) : null;
}

export async function getsalesOrders(
  statusOrConfig?: 'draft' | 'approved' | 'delivered' | AxiosRequestConfig,
  maybeConfig?: AxiosRequestConfig
): Promise<PurchaseOrder[]> {
  try {
    if (typeof statusOrConfig === 'string') {
      const status = statusOrConfig;
      const config = maybeConfig ?? {};
      const safeConfig: AxiosRequestConfig = (config && typeof config === 'object') ? { ...config } : {};
      safeConfig.params = { ...(safeConfig.params ?? {}), status };
      const { data } = await axiosClient.get(BASE, safeConfig);
      return extractListFromResponse(data);
    } else {
      const config = (statusOrConfig as AxiosRequestConfig) ?? {};
      const safeConfig: AxiosRequestConfig = (config && typeof config === 'object') ? { ...config } : {};
      const { data } = await axiosClient.get(BASE, safeConfig);
      return extractListFromResponse(data);
    }
  } catch (err: any) {
    console.error('❌ getsalesOrders error:', err.response?.data || err.message);
    throw err;
  }
}

export async function getsaleseOrderById(id: string, config?: AxiosRequestConfig): Promise<PurchaseOrder | null> {
  try {
    const { data } = await axiosClient.get(`${BASE}/${id}`, config);
    return extractSingleFromResponse(data);
  } catch (err: any) {
    console.error('❌ getsaleseOrderById error:', err.response?.data || err.message);
    throw err;
  }
}

export async function createsaleseOrder(payload: CreatePurchaseOrderPayload, config?: AxiosRequestConfig): Promise<PurchaseOrder> {
  try {
    const { data } = await axiosClient.post(BASE, payload, config);
    const single = extractSingleFromResponse(data);
    if (single) return single;
    // fallback: try to normalize whole body
    return normalizeOrder(Array.isArray(data) ? data[0] : data) as PurchaseOrder;
  } catch (err: any) {
    console.error('❌ createsaleseOrder error:', err.response?.data || err.message);
    throw err;
  }
}

export async function updatePurchaseOrder(id: string, payload: Partial<CreatePurchaseOrderPayload>, config?: AxiosRequestConfig): Promise<PurchaseOrder | null> {
  try {
    const { data } = await axiosClient.patch(`${BASE}/${id}`, payload, config);
    return extractSingleFromResponse(data);
  } catch (err: any) {
    console.error('❌ updatePurchaseOrder error:', err.response?.data || err.message);
    throw err;
  }
}

export async function deletesaleseOrder(id: string, config?: AxiosRequestConfig): Promise<{ success?: boolean; message?: string } | null> {
  try {
    const { data } = await axiosClient.delete(`${BASE}/${id}`, config);
    return data ?? null;
  } catch (err: any) {
    console.error('❌ deletesaleseOrder error:', err.response?.data || err.message);
    throw err;
  }
}

/**
 * Approve sale order
 * PATCH /sale-orders/approve/:id  with body { status: "approved" }
 */
export async function approveSaleOrder(id: string): Promise<PurchaseOrder | null> {
  try {
    await axiosClient.patch(`${BASE}/approve/${id}`, { status: 'approved' });
    return await getsaleseOrderById(id);
  } catch (err: any) {
    console.error('❌ approveSaleOrder error:', err.response?.data || err.message);
    throw err;
  }
}

/**
 * Mark sale order as shipped
 * PATCH /sale-orders/ship/:id  with body { status: "shipped" }
 */
export async function shipSaleOrder(id: string): Promise<PurchaseOrder | null> {
  try {
    await axiosClient.patch(`${BASE}/ship/${id}`, { status: 'shipped' });
    return await getsaleseOrderById(id);
  } catch (err: any) {
    console.error('❌ shipSaleOrder error:', err.response?.data || err.message);
    throw err;
  }
}

/**
 * Mark sale order as delivered
 * PATCH /sale-orders/deliver/:id  with body { status: "delivered" }
 */
export async function deliverSaleOrder(id: string): Promise<PurchaseOrder | null> {
  try {
    await axiosClient.patch(`${BASE}/deliver/${id}`, { status: 'delivered' });
    return await getsaleseOrderById(id);
  } catch (err: any) {
    console.error('❌ deliverSaleOrder error:', err.response?.data || err.message);
    throw err;
  }
}

export async function cancelSaleOrder(id: string): Promise<PurchaseOrder | null> {
  try {
    await axiosClient.patch(`${BASE}/cancel/${id}`, { status: 'cancelled' });
    return await getsaleseOrderById(id);
  } catch (err: any) {
    console.error('❌ cancelSaleOrder error:', err.response?.data || err.message);
    throw err;
  }
}
