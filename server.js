require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const { log } = require('console');

const { tenantResolver, globalData } = require('./src/middleware/tenantResolver');
const renderPage = require('./src/helpers/renderPage');
const publicRoutes = require('./src/routes/public');

const app = express();

/* ---------------- Base Paths ---------------- */
const ROOT = __dirname;
const VIEWS_BASE = path.join(ROOT, 'views');
const PUBLIC_BASE = path.join(ROOT, 'public');

/* ---------------- Templates discovery ---------------- */
function discoverTemplateAliases() {
    const tplDir = path.join(VIEWS_BASE, 'templates');
    if (!fs.existsSync(tplDir)) return [];
    return fs.readdirSync(tplDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
}
const TEMPLATE_ALIASES = discoverTemplateAliases();
if (TEMPLATE_ALIASES.length === 0) {
    console.warn('⚠️  No se encontraron templates en views/templates/*');
}

/* ---------------- Handlebars ---------------- */
const partialsDirs = TEMPLATE_ALIASES.map(alias => ({
    dir: path.join(VIEWS_BASE, 'templates', alias),
    namespace: alias,
}));

app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: false,
    partialsDir: partialsDirs,
}));
app.set('view engine', 'hbs');
app.set('views', VIEWS_BASE);
app.locals.layout = false;

/* ---------------- Middlewares ---------------- */
app.use(express.static(PUBLIC_BASE));
app.use(tenantResolver);

/* ---------------- Helpers globales ---------------- */
Handlebars.registerHelper('renderStars', function (stars) {
    let html = '';
    const fullStars = Math.floor(stars);
    const hasHalf = stars % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) html += '<i class="bi bi-star-fill"></i>';
    if (hasHalf) html += '<i class="bi bi-star-half"></i>';
    for (let i = fullStars + (hasHalf ? 1 : 0); i < 5; i++) html += '<i class="bi bi-star"></i>';

    return new Handlebars.SafeString(html);
});

Handlebars.registerHelper("eq", (a, b) => String(a) === String(b));
Handlebars.registerHelper("or", (a, b) => a || b);
Handlebars.registerHelper("multiply", (a, b) => a * b);

// 🔹 Helper para dividir texto por delimitador (por ejemplo: "1,3,5" → [1,3,5])
Handlebars.registerHelper('split', function (text, delimiter) {
    if (typeof text !== 'string') return [];
    return text.split(delimiter).filter(Boolean);
});


// 🔹 Helper universal formatDate
Handlebars.registerHelper('formatDate', function (dateString, lang = 'en') {
    if (!dateString) return '';

    const months = {
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    };

    const [year, month, day] = dateString.split('-');
    const mIndex = parseInt(month, 10) - 1;

    const monthName = months[lang] ? months[lang][mIndex] : months['en'][mIndex];

    // Estructura del bloque HTML igual que la original
    return new Handlebars.SafeString(`
    <div class="date">
        <span>${monthName} ${year}</span>
        <strong>${day}</strong>
    </div>
    `);
});


// 🔹 Helper universal formatDate Blog Details
Handlebars.registerHelper('formatDateBlog', function (dateString, lang = 'en') {
    if (!dateString) return '';

    const months = {
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    };

    const [year, month, day] = dateString.split('-');
    const mIndex = parseInt(month, 10) - 1;

    const monthName = months[lang] ? months[lang][mIndex] : months['en'][mIndex];

    return `${parseInt(day)} ${monthName}, ${year}`;
});


// 🧩 Helper dinámico de redes sociales
Handlebars.registerHelper('renderSocialLinks', function (autor_rel) {
    if (!autor_rel || typeof autor_rel !== 'object') return '';

    const redes = [
        { key: 'facebook', icon: 'icon-ui-facebook' },
        { key: 'instagram', icon: 'icon-ui-instagram' },
        { key: 'linkedin', icon: 'icon-ui-linkedin' },
        { key: 'x', icon: 'icon-ui-twitter' } // o el icono que uses para X
    ];

    let html = '<ul class="social-icon social-media icon-bg-transp">';
    redes.forEach(r => {
        const url = autor_rel[r.key];
        if (url && url.trim() !== '') {
            html += `<li><a href="${url}" target="_blank"><i class="${r.icon}"></i></a></li>`;
        }
    });
    html += '</ul>';

    return new Handlebars.SafeString(html);
});


// 🔹 Helper para filtrar items por ID (excluir el ID específico en el que estamos consultando)
Handlebars.registerHelper('filterById', function (items, excludeId, options) {
    if (!Array.isArray(items)) return '';
    let result = '';
    items.forEach(item => {
        if (String(item.id) !== String(excludeId)) {
            result += options.fn(item);
        }
    });
    return result;
});

// 🔹 Helper: obtiene datos de urlSetting por host desde globalData
// Uso: {{getUrlSettingData "site_name"}}
Handlebars.registerHelper('getUrlSettingData', function (key, options) {
    try {

        const host = options?.data?.root?.host || 'unknown-host';
        // console.log("Host detected:", host);

        if (!host) return '';

        const data = globalData?.st_urlSettingData?.[host];

        if (!data || typeof data !== 'object') return '';

        const value = data[key];

        return (value === null || value === undefined) ? '' : String(value);

    } catch (err) {
        console.error('getUrlSettingData helper error:', err);
        return '';
    }
});


// 🔹 Helper que construye dinámicamente el <head> SEO
Handlebars.registerHelper('renderHeadMeta', function (options) {
    try {

        const host = options?.data?.root?.host;
        if (!host) return '';

        const data = globalData?.st_urlSettingData?.[host];
        if (!data || typeof data !== 'object') return '';

        let html = '';

        const siteName = data.site_name || '';
        const title = data.title_default || siteName;
        const description = data.meta_description || '';
        const robots = data.robots || 'index, follow';
        const twitterCard = data.twitter_card || 'summary';
        const lang = data.lang || 'es-ES';

        const logo = data.logo || '';
        const favicon = data.favicon || '';
        const ogImage = data.og_image || logo || '';

        const googleAnalytics = data.google_analytics_id || '';
        const googleTagManager = data.google_tag_manager_id || '';
        const metaVerifyGoogle = data.meta_verify_google || '';

        /* ===============================
            BASIC META
        =============================== */

        if (title) {
            html += `<title>${title}</title>\n`;
            html += `<meta property="og:title" content="${title}">\n`;
            html += `<meta name="twitter:title" content="${title}">\n`;
        }

        if (description) {
            html += `<meta name="description" content="${description}">\n`;
            html += `<meta property="og:description" content="${description}">\n`;
            html += `<meta name="twitter:description" content="${description}">\n`;
        }

        if (robots) {
            html += `<meta name="robots" content="${robots}">\n`;
        }

        /* ===============================
            OPEN GRAPH
        =============================== */

        html += `<meta property="og:type" content="website">\n`;

        if (ogImage) {
            html += `<meta property="og:image" content="${ogImage}">\n`;
            html += `<meta name="twitter:image" content="${ogImage}">\n`;
        }

        if (twitterCard) {
            html += `<meta name="twitter:card" content="${twitterCard}">\n`;
        }

        /* ===============================
            FAVICON
        =============================== */

        if (favicon) {
            html += `<link rel="icon" type="image/png" href="${favicon}">\n`;
        }

        /* ===============================
            GOOGLE VERIFY
        =============================== */

        if (metaVerifyGoogle) {
            html += `<meta name="google-site-verification" content="${metaVerifyGoogle}">\n`;
        }

        /* ===============================
            GOOGLE ANALYTICS (GA4)
        =============================== */

        if (googleAnalytics) {
            html += `
<script async src="https://www.googletagmanager.com/gtag/js?id=${googleAnalytics}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalytics}');
</script>\n`;
        }

        /* ===============================
            GOOGLE TAG MANAGER
        =============================== */

        if (googleTagManager) {
            html += `
<!-- Google Tag Manager -->
<script>
(function(w,d,s,l,i){w[l]=w[l]||[];
w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManager}');
</script>
<!-- End Google Tag Manager -->\n`;
        }

        return new Handlebars.SafeString(html);

    } catch (err) {
        console.error('renderHeadMeta helper error:', err);
        return '';
    }
});



/* ---------------- Rutas ---------------- */
app.use('/', publicRoutes(renderPage, TEMPLATE_ALIASES));

/* ---------------- Arranque ---------------- */
const argPort = process.argv[2] ? parseInt(process.argv[2], 10) : null;
const PORT = argPort || process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('🕒 Hora actual:', new Date().toString());
    console.log('🌍 Zona horaria activa:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log(`🚀 SmartPort server running on http://localhost:${PORT}`);
});
