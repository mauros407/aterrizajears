# Estructura V2

Esta version separa la pagina en capas para que el mismo codigo pueda crecer hacia multiples sitios, monedas y pagos.

## Archivos actuales

- `index.html`: estructura principal de la pagina.
- `css/styles.css`: estilos visuales del sitio.
- `js/site-config.js`: configuracion publica del sitio actual.
- `js/currency.js`: formato de monedas y futura conversion.
- `js/catalog-api.js`: lectura del catalogo desde Supabase.
- `js/app.js`: interaccion de la interfaz y renderizado.
- `config.js`: credenciales publicas de Supabase para desarrollo local. No se sube al repositorio.

## Siguiente fase recomendada

1. Agregar tablas de monedas y conversiones en Supabase.
2. Modificar `currency.js` para leer conversiones desde Supabase.
3. Crear una segunda pagina con otro `site-config.js` o una configuracion por `SITE_ID`.
4. Agregar `robots.txt`, `sitemap.xml` y paginas estaticas por producto para SEO.
5. Crear funciones seguras en Supabase Edge Functions para pagos.

## Seguridad

- La `SUPABASE_ANON_KEY` puede usarse en frontend solo con RLS bien configurado.
- Nunca colocar claves privadas de Stripe, PayPal, Mercado Pago o Supabase service role en GitHub Pages.
- Los pagos deben crearse desde backend seguro, por ejemplo Supabase Edge Functions.
