// Gabba Store - JavaScript Principal
// Este archivo contiene todas las funcionalidades principales del sitio

class GabbaStore {
    constructor() {
        this.carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        this.costoEnvio = 5000;
        this.whatsappNumero = '573104273591';
        this.init();
    }

    init() {
        this.actualizarContadorCarrito();
        this.configurarEventos();
        this.agregarEstilosAnimacion();
    }

    // Gestión del carrito
    agregarAlCarrito(nombre, precio, imagen, categoria = '') {
        const producto = {
            nombre: nombre,
            precio: precio,
            imagen: imagen,
            categoria: categoria,
            cantidad: 1,
            id: Date.now() + Math.random()
        };

        const productoExistente = this.carrito.find(item => item.nombre === nombre);

        if (productoExistente) {
            productoExistente.cantidad++;
        } else {
            this.carrito.push(producto);
        }

        this.guardarCarrito();
        this.actualizarContadorCarrito();
        this.mostrarMensaje('¡Producto agregado al carrito!', 'success');
    }

    eliminarDelCarrito(index) {
        const producto = this.carrito[index];
        this.carrito.splice(index, 1);
        this.guardarCarrito();
        this.actualizarContadorCarrito();
        this.mostrarMensaje(`${producto.nombre} eliminado del carrito`, 'info');
    }

    cambiarCantidad(index, cambio) {
        if (this.carrito[index].cantidad + cambio > 0) {
            this.carrito[index].cantidad += cambio;
        } else {
            this.eliminarDelCarrito(index);
            return;
        }
        this.guardarCarrito();
        this.actualizarContadorCarrito();
    }

    actualizarCantidad(index, nuevaCantidad) {
        const cantidad = parseInt(nuevaCantidad);
        if (cantidad > 0) {
            this.carrito[index].cantidad = cantidad;
            this.guardarCarrito();
            this.actualizarContadorCarrito();
        }
    }

    limpiarCarrito() {
        this.carrito = [];
        localStorage.removeItem('carrito');
        this.actualizarContadorCarrito();
    }

    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }

    actualizarContadorCarrito() {
        const contador = document.getElementById('cart-count');
        if (contador) {
            const totalProductos = this.carrito.reduce((total, producto) => total + producto.cantidad, 0);
            contador.textContent = `(${totalProductos})`;
        }
    }

    // Utilidades
    formatearPrecio(precio) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(precio);
    }

    mostrarMensaje(mensaje, tipo = 'success') {
        // Remover mensaje anterior si existe
        const mensajeAnterior = document.querySelector('.notification-message');
        if (mensajeAnterior) {
            document.body.removeChild(mensajeAnterior);
        }

        const colores = {
            'success': '#4caf50',
            'error': '#f44336',
            'info': '#2196f3',
            'warning': '#ff9800'
        };

        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = 'notification-message';
        mensajeDiv.innerHTML = `
            <i class="fas ${this.getIconoPorTipo(tipo)}" style="margin-right: 0.5rem;"></i>
            ${mensaje}
        `;
        mensajeDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colores[tipo] || colores.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
            font-weight: 500;
            max-width: 350px;
            word-wrap: break-word;
        `;

        document.body.appendChild(mensajeDiv);

        // Auto-remover después de 4 segundos
        setTimeout(() => {
            mensajeDiv.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(mensajeDiv)) {
                    document.body.removeChild(mensajeDiv);
                }
            }, 300);
        }, 4000);
    }

    getIconoPorTipo(tipo) {
        const iconos = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'info': 'fa-info-circle',
            'warning': 'fa-exclamation-triangle'
        };
        return iconos[tipo] || iconos.info;
    }

    // Filtros de productos
    configurarFiltros() {
        const filtros = document.querySelectorAll('[id^="filtro-"]');
        filtros.forEach(filtro => {
            filtro.addEventListener('change', () => this.filtrarProductos());
        });
    }

    filtrarProductos() {
        const productos = document.querySelectorAll('.producto');
        const filtros = {
            categoria: document.getElementById('filtro-categoria')?.value || 'todos',
            precio: document.getElementById('filtro-precio')?.value || 'todos',
            talla: document.getElementById('filtro-talla')?.value || 'todas',
            edad: document.getElementById('filtro-edad')?.value || 'todas',
            genero: document.getElementById('filtro-genero')?.value || 'todos'
        };

        productos.forEach(producto => {
            let mostrar = true;

            // Filtrar por categoría
            if (filtros.categoria !== 'todos') {
                const categoria = producto.getAttribute('data-categoria');
                if (categoria !== filtros.categoria) {
                    mostrar = false;
                }
            }

            // Filtrar por precio
            if (filtros.precio !== 'todos' && mostrar) {
                const precio = parseInt(producto.getAttribute('data-precio'));
                const [min, max] = filtros.precio.split('-').map(p => parseInt(p));
                if (precio < min || precio > max) {
                    mostrar = false;
                }
            }

            // Filtrar por talla
            if (filtros.talla !== 'todas' && mostrar) {
                const tallas = producto.getAttribute('data-tallas');
                if (tallas && !tallas.includes(filtros.talla)) {
                    mostrar = false;
                }
            }

            // Filtrar por edad (para niños)
            if (filtros.edad !== 'todas' && mostrar) {
                const edad = producto.getAttribute('data-edad');
                if (edad !== filtros.edad) {
                    mostrar = false;
                }
            }

            // Filtrar por género (para niños)
            if (filtros.genero !== 'todos' && mostrar) {
                const genero = producto.getAttribute('data-genero');
                if (genero !== filtros.genero && genero !== 'unisex') {
                    mostrar = false;
                }
            }

            // Aplicar filtro con animación
            if (mostrar) {
                producto.style.display = 'block';
                producto.style.animation = 'fadeIn 0.5s ease';
            } else {
                producto.style.display = 'none';
            }
        });

        // Mostrar mensaje si no hay productos
        this.mostrarMensajeSinProductos(productos);
    }

    mostrarMensajeSinProductos(productos) {
        const productosVisibles = Array.from(productos).filter(p => p.style.display !== 'none');
        const contenedor = document.getElementById('productos-container');
        let mensajeSinProductos = document.getElementById('mensaje-sin-productos');

        if (productosVisibles.length === 0) {
            if (!mensajeSinProductos) {
                mensajeSinProductos = document.createElement('div');
                mensajeSinProductos.id = 'mensaje-sin-productos';
                mensajeSinProductos.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: #666;">
                        <i class="fas fa-search" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                        <h3>No se encontraron productos</h3>
                        <p>Intenta ajustar los filtros para encontrar lo que buscas</p>
                    </div>
                `;
                contenedor?.parentNode.appendChild(mensajeSinProductos);
            }
            mensajeSinProductos.style.display = 'block';
        } else {
            if (mensajeSinProductos) {
                mensajeSinProductos.style.display = 'none';
            }
        }
    }

    // WhatsApp Integration
    enviarPedidoWhatsApp(datosCliente) {
        const subtotal = this.carrito.reduce((total, producto) => 
            total + (producto.precio * producto.cantidad), 0);
        const total = subtotal + this.costoEnvio;

        let mensaje = `🛍️ *NUEVO PEDIDO - GABBA STORE*\n\n`;
        mensaje += `👤 *Cliente:* ${datosCliente.nombre}\n`;
        mensaje += `📱 *Teléfono:* ${datosCliente.telefono}\n`;
        if (datosCliente.email) mensaje += `📧 *Email:* ${datosCliente.email}\n`;
        mensaje += `🏠 *Ciudad:* ${datosCliente.ciudad}\n`;
        mensaje += `📍 *Dirección:* ${datosCliente.direccion}\n\n`;

        mensaje += `🛒 *PRODUCTOS:*\n`;
        this.carrito.forEach(producto => {
            mensaje += `• *${producto.nombre}*\n`;
            mensaje += `  Cantidad: ${producto.cantidad}\n`;
            mensaje += `  Precio unitario: ${this.formatearPrecio(producto.precio)}\n`;
            mensaje += `  Subtotal: ${this.formatearPrecio(producto.precio * producto.cantidad)}\n\n`;
        });

        mensaje += `💰 *RESUMEN DEL PEDIDO:*\n`;
        mensaje += `Subtotal productos: ${this.formatearPrecio(subtotal)}\n`;
        mensaje += `Costo de envío: ${this.formatearPrecio(this.costoEnvio)}\n`;
        mensaje += `*TOTAL A PAGAR: ${this.formatearPrecio(total)}*\n\n`;

        const metodosTexto = {
            'efectivo': '💵 Pago contra entrega (Efectivo)',
            'transferencia': '🏦 Transferencia bancaria',
            'pse': '💳 PSE (Pago en línea)'
        };
        mensaje += `${metodosTexto[datosCliente.metodoPago] || '💳 Método no especificado'}\n`;

        if (datosCliente.comentarios) {
            mensaje += `\n📝 *Comentarios adicionales:*\n${datosCliente.comentarios}`;
        }

        mensaje += `\n\n⏰ *Fecha del pedido:* ${new Date().toLocaleString('es-CO')}`;

        const whatsappUrl = `https://wa.me/${this.whatsappNumero}?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappUrl, '_blank');
    }

    // Configurar eventos globales
    configurarEventos() {
        // Configurar filtros si existen
        this.configurarFiltros();

        // Event delegation para botones de agregar al carrito
        document.addEventListener('click', (e) => {
            if (e.target.matches('button[onclick*="agregarAlCarrito"]')) {
                // El onclick ya maneja esto, pero podemos agregar efectos adicionales
                e.target.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    e.target.style.transform = '';
                }, 150);
            }
        });

        // Smooth scroll para enlaces internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Lazy loading para imágenes
        this.configurarLazyLoading();
    }

    configurarLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Búsqueda de productos
    configurarBusqueda() {
        const inputBusqueda = document.getElementById('busqueda-productos');
        if (inputBusqueda) {
            inputBusqueda.addEventListener('input', (e) => {
                this.buscarProductos(e.target.value);
            });
        }
    }

    buscarProductos(termino) {
        const productos = document.querySelectorAll('.producto');
        const terminoLower = termino.toLowerCase().trim();

        productos.forEach(producto => {
            const nombre = producto.querySelector('h3').textContent.toLowerCase();
            const descripcion = producto.querySelector('p').textContent.toLowerCase();
            
            const coincide = nombre.includes(terminoLower) || descripcion.includes(terminoLower);
            
            producto.style.display = coincide || terminoLower === '' ? 'block' : 'none';
        });
    }

    // Agregar estilos de animación
    agregarEstilosAnimacion() {
        if (document.getElementById('gabba-store-animations')) return;

        const style = document.createElement('style');
        style.id = 'gabba-store-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            @keyframes bounce {
                0%, 60%, 75%, 90%, 100% { transform: translateY(0); }
                15%, 45% { transform: translateY(-10px); }
                30% { transform: translateY(-5px); }
            }
            
            .producto {
                transition: all 0.3s ease;
            }
            
            .producto:hover {
                transform: translateY(-5px) scale(1.02);
            }
            
            .btn-cta:hover, button:hover {
                animation: pulse 0.6s ease-in-out;
            }
            
            .notification-message {
                animation: slideInRight 0.3s ease;
            }
            
            .loading {
                position: relative;
                opacity: 0.7;
            }
            
            .loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                margin: -10px 0 0 -10px;
                border: 2px solid #f3f3f3;
                border-top: 2px solid #1976d2;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // Funcionalidades adicionales
    validarFormulario(formulario) {
        const campos = formulario.querySelectorAll('[required]');
        let valido = true;
        let primerCampoInvalido = null;

        campos.forEach(campo => {
            if (!campo.value.trim()) {
                campo.style.borderColor = '#f44336';
                campo.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
                valido = false;
                if (!primerCampoInvalido) {
                    primerCampoInvalido = campo;
                }
            } else {
                campo.style.borderColor = '#4caf50';
                campo.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
            }
        });

        if (!valido && primerCampoInvalido) {
            primerCampoInvalido.focus();
            this.mostrarMensaje('Por favor completa todos los campos requeridos', 'error');
        }

        return valido;
    }

    // Analytics y tracking (simulado)
    trackEvent(evento, categoria, valor = null) {
        console.log(`Analytics: ${evento} en ${categoria}`, valor);
        // Aquí se integraría con Google Analytics, Facebook Pixel, etc.
    }
}

// Funciones globales para mantener compatibilidad
let gabbaStore;

function agregarAlCarrito(nombre, precio, imagen, categoria = '') {
    gabbaStore.agregarAlCarrito(nombre, precio, imagen, categoria);
    gabbaStore.trackEvent('add_to_cart', 'ecommerce', { nombre, precio });
}

function eliminarProducto(index) {
    gabbaStore.eliminarDelCarrito(index);
}

function cambiarCantidad(index, cambio) {
    gabbaStore.cambiarCantidad(index, cambio);
}

function actualizarCantidad(index, cantidad) {
    gabbaStore.actualizarCantidad(index, cantidad);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    gabbaStore = new GabbaStore();
    console.log('🛍️ Gabba Store inicializado correctamente');
});

// Exportar para uso modular (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GabbaStore;
}