const path = require('path');
const fs = require('fs');

function splitByWordsMiddle(text) {
    if (!text || typeof text !== 'string') return ['', ''];
    const words = text.trim().split(/\s+/);
    const mid = Math.floor(words.length / 2);
    const part1 = words.slice(0, mid).join(' ');
    const part2 = words.slice(mid).join(' ');
    return [part1, part2];
}

function resolveView(templateAlias, viewName, base) {
    const clean = (viewName || 'index').replace(/\.hbs$/i, '');
    const abs = path.join(base, 'templates', templateAlias, `${clean}.hbs`);
    const rel = `templates/${templateAlias}/${clean}`;
    return { abs, rel, clean };
}

function renderPage(req, res, templateAlias, viewName, urlSettingId = '', data = {}, globalData = {}) {
    const ROOT = path.resolve('.');
    const VIEWS_BASE = path.join(ROOT, 'views');
    const TEMPLATE_ALIASES = fs.readdirSync(path.join(VIEWS_BASE, 'templates'));
    const host = req.headers.host || 'unknown-host';

    if (!TEMPLATE_ALIASES.includes(templateAlias)) {
        return res
            .status(404)
            .send(`Template "${templateAlias}" no registrado. Disponibles: ${TEMPLATE_ALIASES.join(', ') || '(ninguno)'}`);
    }

    const { abs, rel, clean } = resolveView(templateAlias, viewName, VIEWS_BASE);
    if (!fs.existsSync(abs)) {
        return res.status(404).send(`Vista no encontrada: ${abs}`);
    }

    const isPreview = req.path.startsWith('/preview/');
    const basePath = isPreview ? `/preview/${templateAlias}` : '/';

    /* === Transformaciones especiales === */
    try {
        const home = data?.strategyhero?.[0];
        if (home?.titulo) {
            const [p1, p2] = splitByWordsMiddle(home.titulo);
            data.mainHeadingParts = [p1, p2];
        }

        const svc = data?.strategyservices?.[0];
        if (svc?.titulo) data.serviceParts = splitByWordsMiddle(svc.titulo);

        if (Array.isArray(data.strategyservicescards)) {
            data.strategyservicescards = data.strategyservicescards.map(card => {
                if (card?.titulo) card.tituloParts = splitByWordsMiddle(card.titulo);
                return card;
            });
        }

        // 🔹 Helper global para limpiar etiquetas <p> de todos los campos descripcion
        // 🔹 Helper global: limpiar etiquetas <p> de campos configurados
        // 🔹 Puedo seguir agregando todos los campos que necesito limpiar. 
        const camposLimpieza = [
            'descripcion',
            'descripcion_formulario',
            'exp_larga',
        ];

        for (const key in data) {
            if (Array.isArray(data[key])) {
                data[key] = data[key].map(item => {
                    for (const campo of camposLimpieza) {
                        if (item?.[campo] && typeof item[campo] === 'string') {
                            item[campo] = item[campo]
                                .replace(/^<p[^>]*>/i, '')
                                .replace(/<\/p>$/i, '')
                                .trim();
                        }
                    }
                    return item;
                });
            }
        }

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
        console.error('Error procesando data en renderPage:', err.message);
    }

    /* ==========================================================
    🔹 AJUSTE ESPECÍFICO: normalizar descripcion en strategy about us
   ========================================================== */
    try {
        if (Array.isArray(data.strategy)) {
            data.strategy = data.strategy.map(item => {
                if (item?.descripcion) {
                    let desc = item.descripcion.trim();

                    // Si la descripción no tiene <p> inicial, envolvemos la primera línea como lead
                    if (!desc.startsWith('<p')) {
                        const partes = desc.split(/<\/p>/i);
                        const primera = partes.shift().trim();
                        desc = `<p class="lead">${primera}</p>` + partes.join('</p>');
                    }

                    // Limpieza final (por si quedó <p></p> vacío al inicio)
                    desc = desc.replace(/<p>\s*<\/p>/g, '').trim();
                    item.descripcion = desc;
                }
                return item;
            });
        }
    } catch (err) {
        console.error('Error normalizando descripcion de strategy:', err.message);
    }

    // console.log("globalData", globalData);

    return res.render(rel, {
        layout: false,
        templateAlias,
        assetBase: `/${templateAlias}`,
        basePath,
        urlSettingId,
        titulo: `Template: ${templateAlias} — ${clean}`,
        ...globalData,
        ...data,
        host
    });
}

module.exports = renderPage;
