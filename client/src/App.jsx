import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Boxes,
  Check,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  Eye,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const LOW_STOCK_LIMIT = 5;
const IMAGE_CREDITS = {
  "/products/logitech-mx-master-3s.jpg": {
    author: "Hayden Schiff",
    license: "CC BY 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Logitech_MX_Master_3S_HS03.jpg"
  },
  "/products/raspberry-pi-5.jpg": {
    author: "SimonWaldherr",
    license: "CC BY 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Raspberry_Pi_5.jpg"
  },
  "/products/nintendo-switch.jpg": {
    author: "Evan-Amos",
    license: "Dominio público",
    url: "https://commons.wikimedia.org/wiki/File:Nintendo-Switch-Console-Docked-wJoyConRB.jpg"
  },
  "/products/samsung-galaxy-z-fold3.jpg": {
    author: "Touarise",
    license: "CC BY-SA 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Samsung_Galaxy_Fold_3.jpg"
  }
};

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || `La solicitud falló (${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}

function money(value) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function displayPrice(value) {
  return Number(value) > 0 ? money(value) : "Consultar precio";
}

function getStockStatus(stock) {
  if (Number(stock) === 0) return { label: "Agotado", className: "badge badge-red" };
  if (Number(stock) <= LOW_STOCK_LIMIT) return { label: "Stock bajo", className: "badge badge-amber" };
  return { label: "Disponible", className: "badge badge-green" };
}

function ProductImage({ product, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (!product.imagen || failed) {
    return (
      <div className={`product-image product-image-placeholder ${className}`} aria-label="Imagen no disponible">
        <Package size={32} strokeWidth={1.35} />
      </div>
    );
  }
  return (
    <img
      className={`product-image ${className}`}
      src={product.imagen}
      alt={product.nombre}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <span className="brand-mark"><Sparkles size={18} strokeWidth={2.2} /></span>
      <span className="brand-wordmark">TECHSTORE<span>PRO</span></span>
    </div>
  );
}

function AdminSidebar({ page, setPage, mobileOpen, setMobileOpen }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "products", label: "Productos", icon: Boxes }
  ];

  return (
    <>
      {mobileOpen && <button className="sidebar-backdrop" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand />
          <button className="icon-button sidebar-close" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)}>
            <X size={19} />
          </button>
        </div>
        <div className="sidebar-caption">ESPACIO DE TRABAJO</div>
        <nav className="side-nav" aria-label="Navegación administrativa">
          {items.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`nav-item ${page === key ? "nav-item-active" : ""}`}
              onClick={() => {
                setPage(key);
                setMobileOpen(false);
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {key === "products" && <ArrowRight className="nav-trailing" size={15} />}
            </button>
          ))}
          <a className="nav-item" href="/tienda" onClick={(event) => {
            event.preventDefault();
            window.history.pushState({}, "", "/tienda");
            window.dispatchEvent(new PopStateEvent("popstate"));
            setMobileOpen(false);
          }}>
            <ShoppingBag size={18} strokeWidth={1.8} />
            <span>Ver tienda</span>
            <ArrowRight className="nav-trailing" size={15} />
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help-icon"><Truck size={18} /></div>
          <div>
            <strong>Tu tienda, en orden</strong>
            <p>Gestiona tu inventario en un solo lugar.</p>
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ title, subtitle, onMenuClick }) {
  return (
    <header className="topbar">
      <button className="icon-button menu-button" aria-label="Abrir menú" onClick={onMenuClick}>
        <Menu size={20} />
      </button>
      <div className="topbar-title">
        <div className="eyebrow">TECHSTORE PRO <span>/</span> ADMINISTRACIÓN</div>
        <h1>{title}</h1>
      </div>
      <div className="topbar-right">
        <div className="avatar">TP</div>
        <div className="account-info"><strong>Administrador</strong><span>Mi tienda</span></div>
      </div>
    </header>
  );
}

function StatCard({ label, value, note, icon: Icon, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon stat-icon-${tone}`}><Icon size={19} strokeWidth={1.8} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value == null ? <span className="stat-dash">—</span> : value}</div>
      <div className="stat-note">{note}</div>
    </article>
  );
}

function ProductForm({ product, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    nombre: product?.nombre || "",
    descripcion: product?.descripcion || "",
    categoria: product?.categoria || "",
    precio: product?.precio ?? "",
    stock: product?.stock ?? "",
    imagen: product?.imagen || ""
  });
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await onSave({
        ...form,
        precio: Number(form.precio),
        stock: Number(form.stock)
      });
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onClose();
    }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <div className="modal-header">
          <div>
            <div className="eyebrow">INVENTARIO</div>
            <h2 id="product-modal-title">{product ? "Editar producto" : "Agregar producto"}</h2>
          </div>
          <button className="icon-button" aria-label="Cerrar" onClick={onClose} disabled={saving}><X size={20} /></button>
        </div>
        <form className="product-form" onSubmit={submit}>
          <label className="field field-wide">
            <span>Nombre del producto <b>*</b></span>
            <input autoFocus required maxLength={160} value={form.nombre} onChange={(event) => update("nombre", event.target.value)} placeholder="Ej. Audífonos inalámbricos" />
          </label>
          <label className="field">
            <span>Categoría <b>*</b></span>
            <input required maxLength={100} value={form.categoria} onChange={(event) => update("categoria", event.target.value)} placeholder="Ej. Audio" />
          </label>
          <label className="field">
            <span>Precio (S/) <b>*</b></span>
            <input required type="number" min="0" step="0.01" value={form.precio} onChange={(event) => update("precio", event.target.value)} placeholder="0.00" />
          </label>
          <label className="field">
            <span>Unidades en stock <b>*</b></span>
            <input required type="number" min="0" step="1" value={form.stock} onChange={(event) => update("stock", event.target.value)} placeholder="0" />
          </label>
          <label className="field">
            <span>URL de imagen <small>Opcional</small></span>
            <input type="url" maxLength={2048} value={form.imagen} onChange={(event) => update("imagen", event.target.value)} placeholder="https://..." />
          </label>
          <label className="field field-wide">
            <span>Descripción <small>Opcional</small></span>
            <textarea rows="3" value={form.descripcion} onChange={(event) => update("descripcion", event.target.value)} placeholder="Describe brevemente el producto" />
          </label>
          {error && <div className="form-error field-wide"><CircleAlert size={16} />{error}</div>}
          <div className="modal-actions field-wide">
            <button type="button" className="button button-outline" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />}
              {saving ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ConfirmDelete({ product, error, onClose, onConfirm, deleting }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !deleting) onClose();
    }}>
      <section className="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
        <div className="confirm-symbol"><Trash2 size={21} /></div>
        <h2 id="delete-title">¿Eliminar producto?</h2>
        <p>Se eliminará <strong>{product.nombre}</strong> del inventario. Esta acción no se puede deshacer.</p>
        {error && <div className="form-error confirm-error" role="alert"><CircleAlert size={16} />{error}</div>}
        <div className="modal-actions">
          <button className="button button-outline" onClick={onClose} disabled={deleting}>Cancelar</button>
          <button className="button button-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />}
            {deleting ? "Eliminando..." : "Eliminar producto"}
          </button>
        </div>
      </section>
    </div>
  );
}

function ProductDetails({ product, onClose, onEdit }) {
  const status = getStockStatus(product.stock);
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="modal details-modal" role="dialog" aria-modal="true" aria-labelledby="product-details-title">
        <div className="modal-header">
          <div><div className="eyebrow">DETALLE DE PRODUCTO</div><h2 id="product-details-title">Consulta de producto</h2></div>
          <button className="icon-button" aria-label="Cerrar" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="details-product">
          <ProductImage product={product} className="details-image" />
          <div className="details-product-copy">
            <span className="details-category">{product.categoria}</span>
            <h3>{product.nombre}</h3>
            <span className="details-reference">Referencia #{String(product.id).padStart(4, "0")}</span>
          </div>
        </div>
        <div className="details-grid">
          <div><span>Precio</span><strong>{displayPrice(product.precio)}</strong></div>
          <div><span>Unidades en stock</span><strong>{product.stock}</strong></div>
          <div><span>Estado</span><strong><span className={status.className}><i />{status.label}</span></strong></div>
        </div>
        <div className="details-description"><span>Descripción</span><p>{product.descripcion || "Sin descripción."}</p></div>
        <div className="modal-actions">
          <button className="button button-outline" onClick={onClose}>Cerrar</button>
          <button className="button button-primary" onClick={() => onEdit(product)}><Pencil size={15} />Editar producto</button>
        </div>
      </section>
    </div>
  );
}

function ProductTable({ products, onView, onEdit, onDelete, compact = false }) {
  if (!products.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><ClipboardList size={23} /></div>
        <h3>No hay productos para mostrar</h3>
        <p>Agrega productos o ajusta los filtros de búsqueda.</p>
      </div>
    );
  }
  return (
    <div className="table-scroll">
      <table className="product-table">
        <thead>
          <tr>
            <th>PRODUCTO</th>
            <th>CATEGORÍA</th>
            <th>PRECIO</th>
            <th>STOCK</th>
            <th>ESTADO</th>
            {!compact && <th className="actions-heading">ACCIONES</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const status = getStockStatus(product.stock);
            return (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    <ProductImage product={product} className="table-product-image" />
                    <div className="product-cell-copy"><strong>{product.nombre}</strong><span>#{String(product.id).padStart(4, "0")}</span></div>
                  </div>
                </td>
                <td><span className="category-text">{product.categoria}</span></td>
                <td className="price-cell">{displayPrice(product.precio)}</td>
                <td><span className={`stock-number ${Number(product.stock) <= LOW_STOCK_LIMIT ? "stock-number-low" : ""}`}>{product.stock} <small>unid.</small></span></td>
                <td><span className={status.className}><i />{status.label}</span></td>
                {!compact && (
                  <td>
                    <div className="row-actions">
                      <button className="row-action" aria-label={`Consultar ${product.nombre}`} title="Consultar" onClick={() => onView(product)}><Eye size={16} /></button>
                      <button className="row-action" aria-label={`Editar ${product.nombre}`} title="Editar" onClick={() => onEdit(product)}><Pencil size={16} /></button>
                      <button className="row-action row-action-delete" aria-label={`Eliminar ${product.nombre}`} title="Eliminar" onClick={() => onDelete(product)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function InventoryPage({ products, loading, stats, error, onRetry, onAdd, onView, onEdit, onDelete, dashboard = false }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas las categorías");
  const [currentPage, setCurrentPage] = useState(1);
  const categories = useMemo(() => [...new Set(products.map((product) => product.categoria).filter(Boolean))].sort(), [products]);
  const filtered = useMemo(() => products.filter((product) => {
    const query = search.trim().toLocaleLowerCase("es");
    const matchesText = !query || [product.nombre, product.categoria, product.descripcion].some((value) => value?.toLocaleLowerCase("es").includes(query));
    return matchesText && (category === "Todas las categorías" || product.categoria === category);
  }), [products, search, category]);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const shown = dashboard ? filtered.slice(0, 5) : filtered.slice((activePage - 1) * pageSize, activePage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [search, category]);

  return (
    <>
      {!dashboard && (
        <section className="page-intro">
          <div><div className="eyebrow">GESTIÓN DE CATÁLOGO</div><h2>Productos</h2><p>Administra tu catálogo y mantén el inventario al día.</p></div>
          <button className="button button-primary" onClick={onAdd}><Plus size={18} />Agregar producto</button>
        </section>
      )}
      {dashboard && (
        <section className="welcome-row">
          <div><div className="eyebrow">RESUMEN DE TU TIENDA</div><h2>Tu inventario, de un vistazo</h2><p>Consulta el estado actual de tus productos.</p></div>
          <button className="button button-primary" onClick={onAdd}><Plus size={18} />Agregar producto</button>
        </section>
      )}

      {error && (
        <div className="error-banner" role="alert">
          <CircleAlert size={18} /><div><strong>No se pudo cargar la información</strong><span>{error}</span></div>
          <button className="button button-outline button-small" onClick={onRetry}>Reintentar</button>
        </div>
      )}

      {dashboard && (
        <section className="stats-grid" aria-label="Indicadores reales del inventario">
          <StatCard label="Productos registrados" value={stats?.total} note="En todo el catálogo" icon={Package} tone="blue" />
          <StatCard label="Disponibles" value={stats?.disponibles} note="Con unidades en stock" icon={Check} tone="green" />
          <StatCard label="Agotados" value={stats?.agotados} note="Requieren reposición" icon={CircleAlert} tone="red" />
          <StatCard label="Stock bajo" value={stats?.stock_bajo} note={`De 1 a ${LOW_STOCK_LIMIT} unidades`} icon={ArrowDown} tone="amber" />
        </section>
      )}

      <section className="panel">
        <div className="panel-heading">
          <div><h2>{dashboard ? "Productos recientes" : "Todos los productos"}</h2><p>{loading ? "Consultando inventario..." : `${filtered.length} ${filtered.length === 1 ? "producto" : "productos"}${search || category !== "Todas las categorías" ? " encontrados" : ""}`}</p></div>
          {dashboard && <button className="text-link" onClick={() => window.dispatchEvent(new CustomEvent("techstore:navigate", { detail: "products" }))}>Ver todos <ArrowRight size={15} /></button>}
        </div>
        <div className="table-toolbar">
          <label className="search-field"><Search size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o categoría..." aria-label="Buscar productos" /><kbd>⌘ K</kbd></label>
          <label className="select-field"><ArrowDownUp size={15} /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filtrar por categoría"><option>Todas las categorías</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
        </div>
        {loading ? (
          <div className="skeleton-table" aria-label="Cargando productos">
            {Array.from({ length: 5 }, (_, index) => <div className="skeleton-row" key={index}><i /><span /><span /><span /><span /></div>)}
          </div>
        ) : error && !products.length ? (
          <div className="empty-state">
            <div className="empty-icon"><CircleAlert size={22} /></div>
            <h3>Inventario no disponible</h3>
            <p>Conecta con la API para consultar productos reales.</p>
          </div>
        ) : (
          <ProductTable products={shown} onView={onView} onEdit={onEdit} onDelete={onDelete} compact={dashboard} />
        )}
        {!dashboard && !loading && !error && filtered.length > 0 && (
          <div className="table-pagination">
            <span>Mostrando <strong>{(activePage - 1) * pageSize + 1}–{Math.min(activePage * pageSize, filtered.length)}</strong> de <strong>{filtered.length}</strong></span>
            <div>
              <button className="page-button" aria-label="Página anterior" onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} disabled={activePage <= 1}><ArrowLeft size={15} /></button>
              <span className="page-count">Página {activePage} de {totalPages}</span>
              <button className="page-button" aria-label="Página siguiente" onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))} disabled={activePage >= totalPages}><ArrowRight size={15} /></button>
            </div>
          </div>
        )}
        {!loading && dashboard && filtered.length > shown.length && (
          <button className="table-footer-link" onClick={() => window.dispatchEvent(new CustomEvent("techstore:navigate", { detail: "products" }))}>Ver los {filtered.length} productos <ArrowRight size={15} /></button>
        )}
      </section>
      {!dashboard && <div className="table-caption"><span><i className="caption-dot" />Datos actualizados directamente desde tu inventario</span><span>{products.length} registros</span></div>}
    </>
  );
}

function Storefront({ products, loading, error, onRetry, onAdmin }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [sort, setSort] = useState("featured");
  const categories = useMemo(() => ["Todos", ...new Set(products.map((product) => product.categoria).filter(Boolean)).values()], [products]);
  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    const result = products.filter((product) => {
      const matchesSearch = !query || `${product.nombre} ${product.categoria} ${product.descripcion || ""}`.toLocaleLowerCase("es").includes(query);
      return matchesSearch && (category === "Todos" || product.categoria === category);
    });
    if (sort === "price-low") result.sort((a, b) => Number(a.precio) - Number(b.precio));
    if (sort === "price-high") result.sort((a, b) => Number(b.precio) - Number(a.precio));
    if (sort === "name") result.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    return result;
  }, [products, search, category, sort]);

  return (
    <div className="storefront">
      <div className="store-announcement">Envíos a todo el Perú <span>·</span> Tecnología que te acompaña</div>
      <header className="store-header">
        <a href="/" className="store-brand" onClick={(event) => { event.preventDefault(); onAdmin(); }}><Brand /></a>
        <nav className="store-nav" aria-label="Navegación principal"><a href="#productos">Productos</a><a href="#categorias">Categorías</a><a href="#nosotros">Nosotros</a></nav>
        <div className="store-header-actions">
          <label className="store-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar productos" aria-label="Buscar productos" /></label>
          <button className="store-admin-link" onClick={onAdmin}><LayoutDashboard size={17} /><span>Administrar</span></button>
        </div>
      </header>
      <main>
        <section className="store-hero">
          <div className="hero-copy">
            <div className="hero-kicker"><span /> TECNOLOGÍA PARA TU DÍA</div>
            <h1>Mejor tecnología.<br /><span>Mejores momentos.</span></h1>
            <p>Encuentra los accesorios y dispositivos que hacen que cada día funcione mejor.</p>
            <a className="button button-light" href="#productos">Explorar productos <ArrowRight size={17} /></a>
            <div className="hero-note"><span className="hero-note-check"><Check size={12} /></span> Selección curada, compra con confianza</div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
            <div className="hero-device device-phone"><div className="phone-screen"><div className="screen-camera" /><div className="screen-glow" /><div className="screen-lines" /></div></div>
            <div className="hero-device device-headphone"><div className="headphone-band" /><div className="earcup earcup-left" /><div className="earcup earcup-right" /></div>
            <div className="hero-floating-card"><div className="floating-icon"><Sparkles size={15} /></div><div><strong>Calidad que se nota</strong><span>En cada detalle</span></div></div>
            <div className="hero-small-chip">NUEVA TEMPORADA <ArrowDown size={12} /></div>
          </div>
          <div className="hero-bottom-line"><span>01 — LO ESENCIAL, MEJORADO</span><span>DESCUBRE TU PRÓXIMO FAVORITO <ArrowDown size={13} /></span></div>
        </section>
        <section className="store-categories" id="categorias">
          <div className="store-section-heading"><div><div className="eyebrow">ENCUENTRA LO QUE BUSCAS</div><h2>Explora por categoría</h2></div><span>01 — {String(Math.max(categories.length - 1, 0)).padStart(2, "0")}</span></div>
          <div className="category-chips">{categories.map((item) => <button key={item} className={`category-chip ${category === item ? "category-chip-active" : ""}`} onClick={() => setCategory(item)}>{item}<ArrowRight size={14} /></button>)}</div>
        </section>
        <section className="store-products-section" id="productos">
          <div className="store-section-heading products-heading"><div><div className="eyebrow">CURADOS PARA TI</div><h2>Productos de referencia</h2><p>Modelos reales. Confirma los precios y las existencias en administración.</p></div>
            <label className="sort-field"><span>Ordenar:</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Destacados</option><option value="price-low">Precio: menor a mayor</option><option value="price-high">Precio: mayor a menor</option><option value="name">Nombre</option></select><ChevronDown size={14} /></label>
          </div>
          {error && <div className="error-banner store-error"><CircleAlert size={18} /><div><strong>No se pudo cargar el catálogo</strong><span>{error}</span></div><button className="button button-outline button-small" onClick={onRetry}>Reintentar</button></div>}
          {loading ? <div className="store-product-grid">{Array.from({ length: 4 }, (_, index) => <div className="store-skeleton" key={index}><div /><span /><i /></div>)}</div> : error && !products.length ? null : visibleProducts.length ? (
            <div className="store-product-grid">
              {visibleProducts.map((product, index) => (
                <article className="store-product-card" key={product.id}>
                  <div className="store-image-wrap">
                    <ProductImage product={product} className="store-product-image" />
                    <span className="product-ribbon">MODELO REAL</span>
                    <span className={`availability ${product.stock <= LOW_STOCK_LIMIT ? "availability-low" : ""}`}><i />{product.stock === 0 ? "Agotado" : product.stock <= LOW_STOCK_LIMIT ? `Últimas ${product.stock}` : "Disponible"}</span>
                    {IMAGE_CREDITS[product.imagen] && (
                      <a className="image-credit" href={IMAGE_CREDITS[product.imagen].url} target="_blank" rel="noreferrer" aria-label={`Foto de ${IMAGE_CREDITS[product.imagen].author}, ${IMAGE_CREDITS[product.imagen].license}`}>
                        Foto: {IMAGE_CREDITS[product.imagen].author} · {IMAGE_CREDITS[product.imagen].license}
                      </a>
                    )}
                  </div>
                  <div className="store-product-meta"><span>{product.categoria}</span><span>REF. {String(product.id).padStart(4, "0")}</span></div>
                  <h3>{product.nombre}</h3>
                  {product.descripcion && <p className="store-product-description">{product.descripcion}</p>}
                  <div className="store-product-bottom"><strong>{displayPrice(product.precio)}</strong><span className={product.stock === 0 ? "store-stock-empty" : ""}>{product.stock === 0 ? "Sin stock" : <><Check size={13} />{product.stock} en stock</>}</span></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="store-empty"><div className="empty-icon"><ShoppingBag size={22} /></div><h3>{products.length ? "No encontramos productos disponibles" : "Pronto habrá novedades"}</h3><p>{products.length ? "Prueba con otra búsqueda o categoría." : "Los productos aparecerán aquí cuando estén registrados en la tienda."}</p></div>
          )}
        </section>
        <section className="store-promise" id="nosotros">
          <div className="promise-icon"><Truck size={20} /></div><div><strong>Compra simple, tecnología confiable.</strong><span>Un catálogo claro con disponibilidad actualizada.</span></div><ArrowRight size={17} />
        </section>
      </main>
      <footer className="store-footer"><a href="/" onClick={(event) => { event.preventDefault(); onAdmin(); }}><Brand /></a><span>© {new Date().getFullYear()} TechStore Pro. Tecnología para todos los días.</span><a href="#productos">Volver al catálogo <ArrowRight size={14} /></a></footer>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState(window.location.pathname === "/tienda" ? "store" : "dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productRows, statRows] = await Promise.all([
        request("/products"),
        request("/products/stats")
      ]);
      setProducts(productRows);
      setStats(statRows);
    } catch (loadError) {
      setProducts([]);
      setError(loadError.message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    function onPopState() {
      setPage(window.location.pathname === "/tienda" ? "store" : "dashboard");
    }
    function onNavigate(event) {
      setPage(event.detail);
      window.history.pushState({}, "", "/");
    }
    window.addEventListener("popstate", onPopState);
    window.addEventListener("techstore:navigate", onNavigate);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("techstore:navigate", onNavigate);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!modal || saving) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") setModal(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal, saving]);

  function navigateToStore() {
    window.history.pushState({}, "", "/tienda");
    setPage("store");
    window.scrollTo(0, 0);
  }

  function navigateToAdmin() {
    window.history.pushState({}, "", "/");
    setPage("dashboard");
    window.scrollTo(0, 0);
  }

  async function saveProduct(values) {
    setSaving(true);
    try {
      await request(modal.product ? `/products/${modal.product.id}` : "/products", {
        method: modal.product ? "PUT" : "POST",
        body: JSON.stringify(values)
      });
      setModal(null);
      setToast(modal.product ? "Producto actualizado correctamente." : "Producto creado correctamente.");
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct() {
    setSaving(true);
    try {
      await request(`/products/${modal.product.id}`, { method: "DELETE" });
      setModal(null);
      setToast("Producto eliminado del inventario.");
      await loadData();
    } catch (deleteError) {
      setModal((current) => ({ ...current, error: deleteError.message }));
      setToast(deleteError.message);
    } finally {
      setSaving(false);
    }
  }

  if (page === "store") {
    return <Storefront products={products} loading={loading} error={error} onRetry={loadData} onAdmin={navigateToAdmin} />;
  }

  const title = page === "products" ? "Productos" : "Dashboard";
  return (
    <div className="admin-layout">
      <AdminSidebar page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="admin-main">
        <Topbar title={title} subtitle={page === "dashboard" ? "Resumen de actividad" : "Inventario"} onMenuClick={() => setMobileOpen(true)} />
        <main className="admin-content">
          <InventoryPage
            products={products}
            loading={loading}
            stats={stats}
            error={error}
            onRetry={loadData}
            onAdd={() => setModal({ type: "form" })}
            onView={(product) => setModal({ type: "details", product })}
            onEdit={(product) => setModal({ type: "form", product })}
            onDelete={(product) => setModal({ type: "delete", product })}
            dashboard={page === "dashboard"}
          />
          <footer className="admin-footer"><span>TECHSTORE PRO <i>·</i> PANEL DE ADMINISTRACIÓN</span><button onClick={navigateToStore}>Ir a la tienda <ArrowRight size={14} /></button></footer>
        </main>
      </div>
      {modal?.type === "form" && <ProductForm product={modal.product} onClose={() => setModal(null)} onSave={saveProduct} saving={saving} />}
      {modal?.type === "details" && (
        <ProductDetails
          product={modal.product}
          onClose={() => setModal(null)}
          onEdit={(product) => setModal({ type: "form", product })}
        />
      )}
      {modal?.type === "delete" && (
        <ConfirmDelete
          product={modal.product}
          error={modal.error}
          onClose={() => setModal(null)}
          onConfirm={removeProduct}
          deleting={saving}
        />
      )}
      {toast && <div className="toast" role="status"><Check size={17} />{toast}<button aria-label="Cerrar notificación" onClick={() => setToast("")}><X size={15} /></button></div>}
    </div>
  );
}
