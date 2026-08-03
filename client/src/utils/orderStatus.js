export const ORDER_STATUS = Object.freeze({
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'ReadyForDispatch',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  DELIVERY_FAILED: 'Delivery Failed',
  CANCELLED: 'Cancelled',
});

const STATUS_ALIASES = {
  PENDING: ORDER_STATUS.PENDING,
  PENDIENTE: ORDER_STATUS.PENDING,
  CONFIRMED: ORDER_STATUS.CONFIRMED,
  CONFIRMADO: ORDER_STATUS.CONFIRMED,
  PREPARING: ORDER_STATUS.PREPARING,
  PREPARANDO: ORDER_STATUS.PREPARING,
  READYFORDISPATCH: ORDER_STATUS.READY,
  LISTOPARASALIR: ORDER_STATUS.READY,
  SHIPPED: ORDER_STATUS.OUT_FOR_DELIVERY,
  OUTFORDELIVERY: ORDER_STATUS.OUT_FOR_DELIVERY,
  ENRUTA: ORDER_STATUS.OUT_FOR_DELIVERY,
  DELIVERED: ORDER_STATUS.DELIVERED,
  ENTREGADO: ORDER_STATUS.DELIVERED,
  DELIVERYFAILED: ORDER_STATUS.DELIVERY_FAILED,
  ENTREGAFALLIDA: ORDER_STATUS.DELIVERY_FAILED,
  ENTREGAFAALLIDA: ORDER_STATUS.DELIVERY_FAILED,
  ENTREGA_FALLIDA: ORDER_STATUS.DELIVERY_FAILED,
  CANCELLED: ORDER_STATUS.CANCELLED,
  CANCELED: ORDER_STATUS.CANCELLED,
  CANCELADO: ORDER_STATUS.CANCELLED,
};

export const normalizeOrderStatus = (status) => {
  if (!status) return ORDER_STATUS.PENDING;
  const key = String(status)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_-]+/g, '')
    .toUpperCase();
  return STATUS_ALIASES[key] || status;
};

export const getOrderStatusLabel = (status) => {
  switch (normalizeOrderStatus(status)) {
    case ORDER_STATUS.PENDING:
      return 'Pendiente';
    case ORDER_STATUS.CONFIRMED:
      return 'Confirmado';
    case ORDER_STATUS.PREPARING:
      return 'Preparando';
    case ORDER_STATUS.READY:
      return 'Listo para salida';
    case ORDER_STATUS.OUT_FOR_DELIVERY:
      return 'En ruta';
    case ORDER_STATUS.DELIVERED:
      return 'Entregado';
    case ORDER_STATUS.DELIVERY_FAILED:
      return 'Entrega fallida';
    case ORDER_STATUS.CANCELLED:
      return 'Cancelado';
    default:
      return status;
  }
};

export const getOrderStatusClasses = (status) => {
  switch (normalizeOrderStatus(status)) {
    case ORDER_STATUS.DELIVERED:
      return 'bg-emerald-950 text-emerald-400 border-emerald-800';
    case ORDER_STATUS.OUT_FOR_DELIVERY:
      return 'bg-amber-950 text-amber-400 border-amber-800';
    case ORDER_STATUS.READY:
      return 'bg-cyan-950 text-cyan-400 border-cyan-800';
    case ORDER_STATUS.PREPARING:
      return 'bg-blue-950 text-blue-400 border-blue-800';
    case ORDER_STATUS.CONFIRMED:
      return 'bg-violet-950 text-violet-400 border-violet-800';
    case ORDER_STATUS.DELIVERY_FAILED:
    case ORDER_STATUS.CANCELLED:
      return 'bg-rose-950 text-rose-400 border-rose-800';
    case ORDER_STATUS.PENDING:
    default:
      return 'bg-slate-950 text-slate-300 border-slate-700';
  }
};
