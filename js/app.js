        // ─── Initialize Lucide ───
        function refreshIcons() {
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
        }
        refreshIcons();

        // ─── Floating WhatsApp - tooltip + scroll-idle logic ───
        (function () {
            const waFloat = document.getElementById('wa-float');
            const tooltip = document.getElementById('wa-float-tooltip');
            const closeBtn = document.getElementById('wa-tooltip-close');
            const dismissed = sessionStorage.getItem('wa-tooltip-dismissed');

            // Auto-show tooltip after 2.5 s (only once per session)
            if (!dismissed) {
                setTimeout(() => tooltip.classList.add('visible'), 2500);
                setTimeout(() => tooltip.classList.remove('visible'), 12000);
            }

            closeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                tooltip.classList.remove('visible');
                sessionStorage.setItem('wa-tooltip-dismissed', '1');
            });

            document.getElementById('wa-float-btn').addEventListener('mouseenter', function () {
                if (!sessionStorage.getItem('wa-tooltip-dismissed')) {
                    tooltip.classList.add('visible');
                }
            });

            // Scroll: shrink + fade when past the hero section
            const heroSection = document.getElementById('hero');
            function onScroll() {
                const heroBottom = heroSection.getBoundingClientRect().bottom;
                if (heroBottom < 0) {
                    waFloat.classList.add('wa-idle');
                } else {
                    waFloat.classList.remove('wa-idle');
                }
            }
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll(); // run once on load
        })();

        // ─── Sticky Navbar Shadow ───
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        });

        // ─── Mobile Menu Toggle ───
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            const icon = menuToggle.querySelector('i');
            icon.setAttribute('data-lucide', mobileMenu.classList.contains('open') ? 'x' : 'menu');
            refreshIcons();
        });
        function closeMenu() { mobileMenu.classList.remove('open'); }

        window.CatalogApi.assertSupabaseConfig();

        // ─── Product Data (cargado dinámicamente desde Supabase) ───
        let products = [];
        window.CurrencyTools.restoreSelectedCurrency();

        // Muestra skeleton loaders animados mientras cargan los productos
        function showLoadingSkeleton() {
            const grid = document.getElementById('product-grid');
            const skeletonCount = 8;
            let html = '';
            for (let i = 0; i < skeletonCount; i++) {
                html += `
                    <div class="glass p-6 flex flex-col gap-4 relative skeleton-card" style="animation: pulse 1.5s ease-in-out infinite;">
                        <div class="w-14 h-14 rounded-2xl skeleton-bone"></div>
                        <div style="display:flex;flex-direction:column;gap:8px;">
                            <div class="skeleton-bone" style="height:20px;width:75%;border-radius:6px;"></div>
                            <div class="skeleton-bone" style="height:28px;width:50%;border-radius:6px;"></div>
                        </div>
                        <div class="skeleton-bone" style="height:12px;width:100%;border-radius:4px;"></div>
                        <div class="skeleton-bone" style="height:12px;width:85%;border-radius:4px;"></div>
                        <div style="display:flex;gap:8px;margin-top:auto;">
                            <div class="skeleton-bone" style="height:24px;width:72px;border-radius:999px;"></div>
                            <div class="skeleton-bone" style="height:24px;width:72px;border-radius:999px;"></div>
                        </div>
                        <div class="skeleton-bone" style="height:42px;width:100%;border-radius:10px;margin-top:8px;"></div>
                    </div>`;
            }
            grid.innerHTML = html;
        }

        // Muestra mensaje de error si falla la carga
        function showLoadError(message) {
            const grid = document.getElementById('product-grid');
            grid.innerHTML = `
                <div style="grid-column: 1 / -1;" class="text-center py-16">
                    <div class="glass inline-block px-10 py-10 max-w-lg w-full">
                        <i data-lucide="wifi-off" class="w-14 h-14 text-red-400 mx-auto mb-5"></i>
                        <h3 class="text-xl font-bold text-slate-100 mb-2">Error al cargar productos</h3>
                        <p class="text-slate-400 text-sm mb-6">${message}</p>
                        <button class="btn-neon" onclick="loadProducts()">
                            <i data-lucide="refresh-cw" class="w-4 h-4 inline mr-2"></i>Reintentar
                        </button>
                    </div>
                </div>`;
            refreshIcons();
        }

        // Carga productos desde Supabase REST API (solo activos, ordenados por id)
        async function loadProducts() {
            showLoadingSkeleton();
            try {
                const data = await window.CatalogApi.fetchProducts();
                products = data.map(window.CatalogApi.mapProduct);
                renderProducts(products);
            } catch (err) {
                console.error('Error cargando productos desde Supabase:', err);
                showLoadError('No se pudieron cargar los productos. Verificá tu conexión e intentá de nuevo.');
            }
        }


        // ─── Render Products ───
        function createProductCard(p) {
            const stars = '&#9733;&#9733;&#9733;&#9733;&#9733;';
            const displayPrice = window.CurrencyTools.formatFromBase(p.rawPrice);
            const displayOldPrice = p.rawOldPrice ? window.CurrencyTools.formatFromBase(p.rawOldPrice) : null;
            const oldPriceBadge = displayOldPrice
                ? `<span class="text-slate-500 text-xs line-through">${displayOldPrice}</span>`
                : '';
            const popularBadge = p.popular
                ? `<div class="popular-badge">Popular</div>`
                : '';
            const featureChips = p.features.map(f =>
                `<span class="chip text-xs"><i data-lucide="check" class="w-3 h-3 text-emerald-400"></i>${f}</span>`
            ).join('');

            // Imagen del producto o ícono como fallback
            const productVisual = p.imageUrl
                ? `<div class="w-full rounded-2xl overflow-hidden" style="aspect-ratio:16/10;background:rgba(255,255,255,0.03);">
                     <img src="${p.imageUrl}" alt="${p.name}" class="w-full h-full object-contain" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto\' style=\'background:${p.iconBg};color:${p.iconColor}\'><i data-lucide=\'${p.icon}\' class=\'w-7 h-7\'></i></div>';refreshIcons();" />
                   </div>`
                : `<div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:${p.iconBg}; color:${p.iconColor}">
                     <i data-lucide="${p.icon}" class="w-7 h-7"></i>
                   </div>`;

            return `
      <div class="glass p-6 flex flex-col gap-4 relative product-card reveal" data-name="${p.name.toLowerCase()} ${p.category.toLowerCase()}">
        ${popularBadge}

        <!-- Product Image / Icon -->
        ${productVisual}

        <!-- Name & Price -->
        <div>
          <h3 class="text-lg font-bold text-slate-100 leading-tight">${p.name}</h3>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-2xl font-black neon-text">${displayPrice}</span>
            ${oldPriceBadge}
          </div>
        </div>

        <!-- Stars -->
        <div class="text-yellow-400 text-xs tracking-widest">${stars} <span class="text-slate-500">(${Math.floor(Math.random() * 60) + 30})</span></div>

        <!-- Description -->
        <p class="text-slate-400 text-sm leading-relaxed flex-1">${p.desc}</p>

        <!-- Feature chips -->
        <div class="flex flex-wrap gap-2">${featureChips}</div>

        <!-- CTA Button -->
        <button
          class="btn-neon w-full flex items-center justify-center gap-2 mt-auto"
          onclick="handleBuy('${p.name}', '${displayPrice}')"
          id="buy-btn-${p.id}"
        >
          <i data-lucide="shopping-cart" class="w-4 h-4"></i>
          Comprar ahora
        </button>
      </div>
    `;
        }

        function renderProducts(list) {
            const grid = document.getElementById('product-grid');
            grid.innerHTML = list.map(createProductCard).join('');
            refreshIcons();
            initReveal();
        }

        function renderCurrencySelector() {
            const container = document.getElementById('currency-selector');
            if (!container) return;

            const selectedCurrency = window.CurrencyTools.getSelectedCurrency();
            const currencies = window.KeysArsSite.enabledCurrencies || ['USD'];

            container.innerHTML = currencies.map(currency => `
                <button
                    type="button"
                    class="currency-option ${currency === selectedCurrency ? 'active' : ''}"
                    onclick="changeCurrency('${currency}')"
                    aria-pressed="${currency === selectedCurrency}"
                >
                    ${currency}
                </button>
            `).join('');
        }

        function changeCurrency(currencyCode) {
            window.CurrencyTools.setSelectedCurrency(currencyCode);
            renderCurrencySelector();
            renderProducts(products);
        }
        window.changeCurrency = changeCurrency;

        // ─── Cargar productos al iniciar ───
        renderCurrencySelector();
        loadProducts();

        // ─── Buy Handler (WhatsApp redirect) ───
        function handleBuy(name, price) {
            const msg = encodeURIComponent(`Hola! Quiero comprar la licencia de *${name}* por ${price}. ¿Cómo procedo?`);
            const whatsappNumber = window.KeysArsSite.contact.whatsappNumber;
            window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank');
            showToast(`¡Consultando por ${name}!`);
        }

        // ─── Toast ───
        const toastEl = document.getElementById('toast');
        function showToast(msg) {
            toastEl.textContent = msg;
            toastEl.classList.add('show');
            setTimeout(() => toastEl.classList.remove('show'), 3500);
        }

        // ─── Real-time Search / Filter ───
        function filterProducts() {
            const query = document.getElementById('search-input').value.toLowerCase().trim();
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query) ||
                p.desc.toLowerCase().includes(query)
            );
            const noRes = document.getElementById('no-results');
            const noResQ = document.getElementById('no-results-query');

            if (filtered.length === 0) {
                document.getElementById('product-grid').innerHTML = '';
                noResQ.textContent = query;
                noRes.style.display = 'block';
            } else {
                noRes.style.display = 'none';
                renderProducts(filtered);
            }
        }

        // ─── FAQ Data ───
        const faqs = [
            {
                q: '¿Cómo recibo mi licencia después de pagar?',
                a: 'Una vez confirmado el pago, te enviamos la clave de activación por WhatsApp o Telegram en un plazo máximo de 15 minutos. También podemos asistirte con la activación en tiempo real.'
            },
            {
                q: '¿Las licencias son permanentes o por suscripción?',
                a: 'La mayoría de nuestras licencias son permanentes (pago único). En los casos donde se trate de una suscripción anual, lo indicamos claramente en la descripción del producto.'
            },
            {
                q: '¿Qué pasa si la clave no funciona?',
                a: 'Contamos con garantía total. Si la clave no activa el producto correctamente, te la reponemos sin costo adicional o te realizamos el reembolso completo.'
            },
            {
                q: '¿Cuáles son los métodos de pago aceptados?',
                a: 'Aceptamos transferencia bancaria, Mercado Pago, PayPal y criptomonedas. Consulta con nuestro equipo para disponibilidad en tu país.'
            },
            {
                q: '¿Puedo ver pruebas de otros compradores?',
                a: 'Por supuesto. Tenemos un grupo dedicado en Telegram con capturas de pantalla y testimonios de clientes verificados. ¡Únete y compruébalo!'
            },
        ];

        // ─── Render FAQ ───
        const faqContainer = document.getElementById('faq-container');
        faqContainer.innerHTML = faqs.map((item, i) => `
    <div class="glass overflow-hidden">
      <button
        class="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-slate-100 hover:text-violet-300 transition-colors"
        onclick="toggleFaq(${i})"
        id="faq-btn-${i}"
      >
        <span>${item.q}</span>
        <i data-lucide="chevron-down" class="w-5 h-5 flex-shrink-0 transition-transform duration-300" id="faq-icon-${i}"></i>
      </button>
      <div id="faq-body-${i}" class="px-6 text-slate-400 text-sm leading-relaxed overflow-hidden max-h-0 transition-all duration-500">
        <p class="pb-5">${item.a}</p>
      </div>
    </div>
  `).join('');
        refreshIcons();

        function toggleFaq(i) {
            const body = document.getElementById(`faq-body-${i}`);
            const icon = document.getElementById(`faq-icon-${i}`);
            const isOpen = body.style.maxHeight && body.style.maxHeight !== '0px';
            // Close all
            document.querySelectorAll('[id^="faq-body-"]').forEach((el, idx) => {
                el.style.maxHeight = '0px';
                document.getElementById(`faq-icon-${idx}`).style.transform = 'rotate(0deg)';
            });
            if (!isOpen) {
                body.style.maxHeight = body.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            }
        }

        // ─── Scroll Reveal (IntersectionObserver) ───
        function initReveal() {
            const els = document.querySelectorAll('.reveal:not(.visible)');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, i * 80);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            els.forEach(el => observer.observe(el));
        }
        initReveal();

        // ─── Smooth scroll polyfill trigger ───
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });




