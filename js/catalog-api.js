(function () {
    function assertSupabaseConfig() {
        const missingConfig = typeof SUPABASE_URL === 'undefined' ||
            typeof SUPABASE_ANON_KEY === 'undefined' ||
            SUPABASE_URL === 'TU_SUPABASE_URL_AQUI' ||
            SUPABASE_ANON_KEY === 'TU_SUPABASE_ANON_KEY_AQUI';

        if (missingConfig) {
            console.warn('Supabase no configurado. Edita config.js con tus credenciales.');
        }

        return !missingConfig;
    }

    function buildProductsUrl() {
        const site = window.KeysArsSite;
        const table = site.productsTable || 'products';
        const params = new URLSearchParams({
            active: 'eq.true',
            order: site.productOrder || 'id.asc',
        });

        return `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`;
    }

    async function fetchProducts() {
        const response = await fetch(buildProductsUrl(), {
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    function mapProduct(row) {
        const currency = row.currency || row.base_currency || window.KeysArsSite.baseCurrency || 'USD';

        return {
            id: row.id,
            name: row.name || '',
            rawPrice: row.price,
            rawOldPrice: row.old_price,
            currency,
            price: window.CurrencyTools.formatFromBase(row.price),
            oldPrice: row.old_price ? window.CurrencyTools.formatFromBase(row.old_price) : null,
            icon: row.icon || 'package',
            iconColor: row.icon_color || '#8b5cf6',
            iconBg: row.icon_bg || 'rgba(139,92,246,0.12)',
            desc: row.description || '',
            features: Array.isArray(row.features) ? row.features : [],
            popular: row.popular || false,
            category: row.category || '',
            imageUrl: row.image_url || null,
        };
    }

    window.CatalogApi = {
        assertSupabaseConfig,
        fetchProducts,
        mapProduct,
    };
})();
