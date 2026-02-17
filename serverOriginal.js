// server.js
require('dotenv').config();

const express = require('express');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const apiClient = require('./src/lib/apiClient');
const { log } = require('console');

const app = express();

/* ---------------- Paths base ---------------- */
const ROOT = __dirname;
const VIEWS_BASE = path.join(ROOT, 'views');
const PUBLIC_BASE = path.join(ROOT, 'public');

/* ---------------- Descubrir templates ---------------- */
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


/* ---------------- Handlebars (SIN layout) ---------------- */
// Registramos TODOS los templates como parciales con namespace (= nombre de carpeta)
const partialsDirs = TEMPLATE_ALIASES.map(alias => ({
    dir: path.join(VIEWS_BASE, 'templates', alias),
    namespace: alias, // => {{> alias/partial}}
}));


/* Consulta de URL */
let globalData = {};

async function tenantResolver(req, res, next) {
    try {
        // Host/dominio de la request

        const host = req.headers.host;
        // console.log("host", host);

        // Inicializo la cache si no existe
        if (!globalData.st_urlSetting) {
            globalData.st_urlSetting = {};
        }

        if (!globalData.st_template) {
            globalData.st_template = {};
        }

        if (!globalData.st_urlSetting[host] || !globalData.st_template[host]) {
            const consult = await apiClient.getData("urlSetting", { url: host });
            // console.log("consult", consult);

            const data = Array.isArray(consult?.data) ? consult.data : [];

            if (consult.ok && data.length > 0) {
                globalData.st_urlSetting[host] = data[0].id; // guardo todo el objeto
                globalData.st_template[host] = data[0].template_alias;
                // console.log("globalData.st_urlSetting", globalData.st_urlSetting);
                // console.log("globalData.st_template", globalData.st_template);
            }
        }

        // verificamos que exista la variable template en globalData
        if (!globalData.templates) {
            // Si no existe, la consultamos en la api
            const consultTemplates = await apiClient.getData("templates", {});

            // verificamos la respuesta de la api
            // console.log("consultTemplates", consultTemplates);

            // cargamos data, si tiene data fue correcta
            const data = Array.isArray(consultTemplates?.data) ? consultTemplates.data : [];

            // verificamos nuevamente para manejar los datos
            if (consultTemplates.ok && data.length > 0) {

                // convertimos el array en un objeto con alias como key
                globalData.templates = data.reduce((acc, template) => {
                    acc[template.alias] = template;
                    return acc;
                }, {});

                // mostramos el resultado ordenado por alias en consola
                // console.log("globalData.templates", globalData.templates);
            }
        }

        /* verificamos si host tiene st_urlSetting, sino redirigimos a /catalogo solo si no estoy en la ruta de catalogo */
        if (!globalData.st_urlSetting[host] && !req.path.startsWith('/catalogo')) {
            // console.log(`Redirigiendo ${host} a /catalogo`);
            return res.redirect('/catalogo');
        }

        /* organizar todas las secciones por alias (como se hizo con los templates) */
        if (!globalData.sections) {
            const consultSections = await apiClient.getData("sections", {});

            // verificamos la respuesta de la api
            // console.log("consultSections", consultSections);

            // cargamos data, si tiene data fue correcta
            const data = Array.isArray(consultSections?.data) ? consultSections.data : [];

            if (consultSections.ok && data.length > 0) {
                // convertimos el array en un objeto con alias como key
                globalData.sections = data.reduce((acc, section) => {
                    acc[section.alias] = section;
                    return acc;
                }, {});
            }
            // console.log("globalData.sections", globalData.sections);
        }

        next();
    } catch (err) {
        console.error("Error en tenantResolver:", err.message);
        res.status(500).send("No se pudo resolver el sitio");
    }
}

// Lo aplicamos globalmente
app.use(tenantResolver);


app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: false,         // ⬅️ mata el layout por defecto
    partialsDir: partialsDirs
}));
app.set('view engine', 'hbs');
app.set('views', VIEWS_BASE);

// Cierre extra por si algo intenta setear layout global
app.locals.layout = false;

/* ---------------- Estáticos ---------------- */
app.use(express.static(PUBLIC_BASE)); // /strategy/... → public/strategy/...

/* ---------------- HELPERS ---------------- */
Handlebars.registerHelper('renderStars', function (stars) {
    let html = '';
    const fullStars = Math.floor(stars);      // cantidad de estrellas llenas
    const hasHalf = stars % 1 >= 0.5;         // si tiene media estrella

    // estrellas llenas
    for (let i = 0; i < fullStars; i++) {
        html += '<i class="bi bi-star-fill"></i>';
    }

    // media estrella
    if (hasHalf) {
        html += '<i class="bi bi-star-half"></i>';
    }

    // completar hasta 5
    const totalStars = fullStars + (hasHalf ? 1 : 0);
    for (let i = totalStars; i < 5; i++) {
        html += '<i class="bi bi-star"></i>';
    }

    return new Handlebars.SafeString(html);
});

/* ---------------- helper para acordeon FAQs ---------------- */
Handlebars.registerHelper("eq", (a, b) => String(a) === String(b));
Handlebars.registerHelper("or", (a, b) => a || b);

/* ---------------- helper para acordeon Contact ---------------- */

Handlebars.registerHelper("multiply", (a, b) => a * b);


/* ---------------- END HELPERS ---------------- */


function resolveView(templateAlias, viewName) {
    const clean = (viewName || 'index').replace(/\.hbs$/i, '');
    const abs = path.join(VIEWS_BASE, 'templates', templateAlias, `${clean}.hbs`);
    const rel = `templates/${templateAlias}/${clean}`;
    return { abs, rel, clean };
}

/* ==========================================================
🔹 AGREGADO: función para dividir texto por palabras al medio
========================================================== */
function splitByWordsMiddle(text) {
    if (!text || typeof text !== 'string') return ['', ''];
    const words = text.trim().split(/\s+/);
    const mid = Math.floor(words.length / 2);
    const part1 = words.slice(0, mid).join(' ');
    const part2 = words.slice(mid).join(' ');
    return [part1, part2];
}
/* ========================================================== */


function renderPage(req, res, templateAlias, viewName, urlSettingId = '', data = {}) {
    if (!TEMPLATE_ALIASES.includes(templateAlias)) {
        return res
            .status(404)
            .send(`Template "${templateAlias}" no registrado. Disponibles: ${TEMPLATE_ALIASES.join(', ') || '(ninguno)'}`);
    }

    const { abs, rel, clean } = resolveView(templateAlias, viewName);
    if (!fs.existsSync(abs)) {
        return res
            .status(404)
            .send(`Vista no encontrada: ${abs}\nCrea "views/templates/${templateAlias}/${clean}.hbs".`);
    }

    const isPreview = req.path.startsWith('/preview/');
    const basePath = isPreview ? `/preview/${templateAlias}` : '/';
    /* ==========================================================
    🔹 AGREGADO: crear split de título principal para strategyhome
   ========================================================== */
    try {
        const home = data?.strategyhero?.[0];
        if (home?.titulo) {
            const [part1, part2] = splitByWordsMiddle(home.titulo);
            data.mainHeadingParts = [part1, part2];
        }
    } catch (err) {
        console.error('Error dividiendo título de strategyhero:', err.message);
    }

    /* ==========================================================
        🔹 AGREGADO: crear serviceParts con la descripción dividida
      ========================================================== */
    try {
        const svc = data?.strategyservices?.[0];
        if (svc?.titulo) {
            data.serviceParts = splitByWordsMiddle(svc.titulo);
        }
    } catch (err) {
        console.error('Error dividiendo título de strategyservices:', err.message);
    }
    /* ========================================================== */


    /* ==========================================================
        🔹 AGREGADO: crear split de títulos para strategyservicescards
       ========================================================== */
    try {
        if (Array.isArray(data.strategyservicescards)) {
            data.strategyservicescards = data.strategyservicescards.map(card => {
                if (card?.titulo) {
                    const [part1, part2] = splitByWordsMiddle(card.titulo);
                    card.tituloParts = [part1, part2];
                }
                return card;
            });
        }
    } catch (err) {
        console.error('Error dividiendo títulos de strategyservicescards:', err.message);
    }

    /* ==========================================================
        🔹 AGREGADO: limpiar etiquetas <p> en descripcion de solvatechbannershome
   ========================================================== */
    try {
        if (Array.isArray(data.solvatechbannershome)) {
            data.solvatechbannershome = data.solvatechbannershome.map(item => {
                if (item?.descripcion) {
                    // Elimina <p> y </p> solo si están al inicio o final del string
                    item.descripcion = item.descripcion
                        .replace(/^<p[^>]*>/i, '')   // quita <p> con o sin atributos
                        .replace(/<\/p>$/i, '')      // quita </p> final
                        .trim();
                }
                return item;
            });
        }
    } catch (err) {
        console.error('Error limpiando etiquetas <p> de solvatechbannershome:', err.message);
    }

    /* ==========================================================
        🔹 AGREGADO: dividir número y sufijo en solvatechfaq.titulo
   ========================================================== */
    try {
        if (Array.isArray(data.solvatechfaq)) {
            data.solvatechfaq = data.solvatechfaq.map(item => {
                if (item?.titulo) {
                    const match = item.titulo.match(/^(\d+(?:\.\d+)?)(.*)$/);
                    if (match) {
                        item.titulo_numero = match[1].trim();
                        item.titulo_sufijo = match[2].trim();
                    } else {
                        item.titulo_numero = item.titulo;
                        item.titulo_sufijo = '';
                    }
                }
                return item;
            });
        }
    } catch (err) {
        console.error('Error dividiendo título de solvatechfaq:', err.message);
    }

    /* ==========================================================
        🔹 AGREGADO: limpiar etiquetas <p> en descripcion de solvatechservicescards
   ========================================================== */
    try {
        if (Array.isArray(data.solvatechservicescards)) {
            data.solvatechservicescards = data.solvatechservicescards.map(item => {
                if (item?.descripcion) {
                    item.descripcion = item.descripcion
                        .replace(/^<p[^>]*>/i, '')   // elimina <p> o <p class="...">
                        .replace(/<\/p>$/i, '')      // elimina </p> final
                        .trim();
                }
                return item;
            });
        }
    } catch (err) {
        console.error('Error limpiando etiquetas <p> de solvatechservicescards:', err.message);
    }



    /* ========================================================== */

    return res.render(rel, {
        layout: false,                 // ⬅️ sin layout en el render
        templateAlias,
        assetBase: `/${templateAlias}`,
        basePath,
        urlSettingId,
        titulo: `Template: ${templateAlias} — ${clean}`,
        ...globalData,
        ...data
    });
}


/* ---------------- Rutas ---------------- */
app.get('/', async (req, res) => {

    try {
        const host = req.headers.host;
        const st_templates = globalData.st_template[host] || (process.env.TEMPLATE_ALIAS || TEMPLATE_ALIASES[0] || '').trim();
        const st_urlSetting = globalData.st_urlSetting[host] || (req.query.id || process.env.URLSETTING_ID || '').trim();

        const templateOnUse = globalData.templates ? globalData.templates[st_templates] : null;
        if (!templateOnUse) {
            /* redirecciono al 404 */
            return res.status(404).send(`Template "${st_templates}" no registrado. Disponibles: ${TEMPLATE_ALIASES.join(', ') || '(ninguno)'}`);
        }

        const seccionOnUse = globalData.sections ? globalData.sections[templateOnUse.home] : null;
        if (!seccionOnUse) {
            return res.status(404).send(`Sección "${templateOnUse.home}" no registrada en la API.`);
        }

        let data = {};
        // seleccionar los cruds y separarlos por coma para tener un array

        const cruds = seccionOnUse.cruds ? seccionOnUse.cruds.split(',').map(c => c.trim()) : [];
        // console.log("cruds", cruds);

        // por cada crud, hacer una consulta a la api y guardar el resultado en data
        const fetchDataPromises = cruds.map(async (crud) => {
            if (crud !== '') {
                return;
            }

            // console.log(`Consultando API para crud: ${crud} con st_urlSetting: ${st_urlSetting}`);

            const response = await apiClient.getData(crud, { st_urlSetting: st_urlSetting });
            // console.log("response", response);

            const checkData = Array.isArray(response?.data) ? response.data : [];

            if (response.ok && checkData.length > 0) {
                data[crud] = checkData;

            }

        });

        await Promise.all(fetchDataPromises);
        console.log("data", data);

        return renderPage(req, res, st_templates, 'index', st_urlSetting, data);

    } catch (error) {
        // crear variable de mensaje con linea y error, necesito saber la linea y el archivo del codigo
        const errorMessage = `Error en ruta /: ${error.message} (en ${__filename}:${error.lineNumber})`;
        console.error("Error en ruta / :", errorMessage);
        return res.status(500).send(errorMessage);

    }
});


app.get('/:alias', async (req, res) => {

    try {
        const alias = (req.params.alias || '').trim();


        const host = req.headers.host;
        const st_templates = globalData.st_template[host] || (process.env.TEMPLATE_ALIAS || TEMPLATE_ALIASES[0] || '').trim();
        const st_urlSetting = globalData.st_urlSetting[host] || (req.query.id || process.env.URLSETTING_ID || '').trim();

        const templateOnUse = globalData.templates ? globalData.templates[st_templates] : null;
        if (!templateOnUse) {
            /* redirecciono al 404 */
            return res.status(404).send(`Template "${st_templates}" no registrado. Disponibles: ${TEMPLATE_ALIASES.join(', ') || '(ninguno)'}`);
        }

        // verificar que alias no sea templateOnUse.home
        if (alias === templateOnUse.home) {
            return res.redirect('/');
        }

        // verificar alias en templateOnUse.sections
        if (!templateOnUse.sections || !templateOnUse.sections.includes(alias)) {
            return res.status(404).send(`Alias "${alias}" no registrado en template "${st_templates}". Secciones disponibles: ${templateOnUse.sections || '(ninguna)'}`);
        }

        const seccionOnUse = globalData.sections ? globalData.sections[alias] : null;
        if (!seccionOnUse) {
            return res.status(404).send(`Sección "${alias}" no registrada en la API.`);
        }

        let data = {};
        // seleccionar los cruds y separarlos por coma para tener un array

        const cruds = seccionOnUse.cruds ? seccionOnUse.cruds.split(',').map(c => c.trim()) : [];
        // console.log("cruds", cruds);

        // por cada crud, hacer una consulta a la api y guardar el resultado en data
        const fetchDataPromises = cruds.map(async (crud) => {

            // console.log(`Consultando API para crud: ${crud} con st_urlSetting: ${st_urlSetting}`);

            const response = await apiClient.getData(crud, { st_urlSetting: st_urlSetting });
            // console.log("response", response);

            const checkData = Array.isArray(response?.data) ? response.data : [];

            if (response.ok && checkData.length > 0) {
                data[crud] = checkData;

            }

        });

        await Promise.all(fetchDataPromises);
        // console.log("data", data);

        return renderPage(req, res, st_templates, alias, st_urlSetting, data);
    } catch (error) {
        // crear variable de mensaje con linea y error, necesito saber la linea y el archivo del codigo
        const errorMessage = `Error en ruta /: ${error.message} (en ${__filename}:${error.lineNumber})`;
        console.error("Error en ruta / :", errorMessage);
        return res.status(500).send(errorMessage);

    }

});


app.get('/:crud/:id', async (req, res) => {

    try {
        const crud = (req.params.crud || '').trim();
        const id = (req.params.id || '').trim();

        const host = req.headers.host;
        const st_templates = globalData.st_template[host] || (process.env.TEMPLATE_ALIAS || TEMPLATE_ALIASES[0] || '').trim();
        const st_urlSetting = globalData.st_urlSetting[host] || (req.query.id || process.env.URLSETTING_ID || '').trim();

        const templateOnUse = globalData.templates ? globalData.templates[st_templates] : null;
        if (!templateOnUse) {
            /* redirecciono al 404 */
            return res.status(404).send(`Template "${st_templates}" no registrado. Disponibles: ${TEMPLATE_ALIASES.join(', ') || '(ninguno)'}`);
        }

        let data = {};
        // seleccionar los cruds y separarlos por coma para tener un array

        // por cada crud, hacer una consulta a la api y guardar el resultado en data
        // console.log(`Consultando API para crud: ${crud} con st_urlSetting: ${st_urlSetting}`);

        const response = await apiClient.getData(crud + '/' + id, { st_urlSetting: st_urlSetting });
        console.log("response", response);

        if (response.ok) {
            data[crud] = response.data;

        }

        console.log("data", data);

        return renderPage(req, res, st_templates, crud + "-details", st_urlSetting, data);
    } catch (error) {
        // crear variable de mensaje con linea y error, necesito saber la linea y el archivo del codigo
        const errorMessage = `Error en ruta /: ${error.message} (en ${__filename}:${error.lineNumber})`;
        console.error("Error en ruta / :", errorMessage);
        return res.status(500).send(errorMessage);

    }

});


/* ---------------- Arranque ---------------- */

// Lee puerto: 1) .env → 2) argumento CLI → 3) fallback 3000
const argPort = process.argv[2] ? parseInt(process.argv[2], 10) : null;
const PORT = argPort || process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log('🕒 Hora actual:', new Date().toString());
    console.log('🌍 Zona horaria activa:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log(`🚀 SmartPort server running on http://localhost:${PORT}`);
});
