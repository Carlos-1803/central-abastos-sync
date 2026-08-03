export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  DRIVER: 'CHOFER',
  ORDER_TAKER: 'LEVANTA_PEDIDOS',
  WAREHOUSE: 'BODEGA',
});

const ROLE_ALIASES = {
  ADMIN: ROLES.ADMIN,
  ADMINISTRADOR: ROLES.ADMIN,

  CHOFER: ROLES.DRIVER,
  DRIVER: ROLES.DRIVER,

  LEVANTAPEDIDO: ROLES.ORDER_TAKER,
  LEVANTAPEDIDOS: ROLES.ORDER_TAKER,
  LEVANTA_PEDIDO: ROLES.ORDER_TAKER,
  LEVANTA_PEDIDOS: ROLES.ORDER_TAKER,
  ORDER_TAKER: ROLES.ORDER_TAKER,

  BODEGA: ROLES.WAREHOUSE,
  LOGISTICS: ROLES.WAREHOUSE,
  LOGISTICA: ROLES.WAREHOUSE,
  WAREHOUSE: ROLES.WAREHOUSE,
};

export const normalizeRole = (role) => {
  if (!role) return '';

  const key = String(role)
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_')
    .toUpperCase();

  return ROLE_ALIASES[key] || key;
};

export const normalizeUserSession = (user) => {
  if (!user) return null;

  return {
    ...user,
    id: user.id ?? user.userId ?? user.Id ?? null,
    username: user.username ?? user.userName ?? user.name ?? '',
    role: normalizeRole(user.role ?? user.roleName ?? user.rol),
  };
};

export const getRoleHomePath = (role) => {
  switch (normalizeRole(role)) {
    case ROLES.DRIVER:
      return '/chofer';
    case ROLES.ORDER_TAKER:
      return '/levanta-pedidos';
    case ROLES.WAREHOUSE:
      return '/bodega';
    case ROLES.ADMIN:
    default:
      return '/';
  }
};

export const getRoleLabel = (role) => {
  switch (normalizeRole(role)) {
    case ROLES.ADMIN:
      return 'Administrador';
    case ROLES.DRIVER:
      return 'Chofer';
    case ROLES.ORDER_TAKER:
      return 'Levanta pedidos';
    case ROLES.WAREHOUSE:
      return 'Bodega';
    default:
      return role || 'Sin rol';
  }
};

export const ALL_ROLES = Object.values(ROLES);
