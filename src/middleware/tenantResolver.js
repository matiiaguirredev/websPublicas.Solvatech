const apiClient = require('../lib/apiClient');

const globalData = {}; // ⬅️ definimos y exportamos la MISMA referencia

async function tenantResolver(req, res, next) {
    try {
        const host = req.headers.host;

        if (!globalData.st_urlSetting) globalData.st_urlSetting = {};
        if (!globalData.st_template) globalData.st_template = {};
        if (!globalData.st_urlSettingData) globalData.st_urlSettingData = {};

        if (!globalData.st_urlSetting[host] || !globalData.st_template[host]) {
            const consult = await apiClient.getData("urlSetting", { url: host });
            const data = Array.isArray(consult?.data) ? consult.data : [];
            if (consult.ok && data.length > 0) {
                globalData.st_urlSetting[host] = data[0].id;
                globalData.st_template[host] = data[0].template_alias;
                globalData.st_urlSettingData[host] = data[0];
            }
        }

        if (!globalData.templates) {
            const consultTemplates = await apiClient.getData("templates", {});
            const data = Array.isArray(consultTemplates?.data) ? consultTemplates.data : [];
            if (consultTemplates.ok && data.length > 0) {
                globalData.templates = data.reduce((acc, template) => {
                    acc[template.alias] = template;
                    return acc;
                }, {});
            }
        }

        if (!globalData.st_urlSetting[host] && !req.path.startsWith('/catalogo')) {
            return res.redirect('/catalogo');
        }

        if (!globalData.sections) {
            const consultSections = await apiClient.getData("sections", {});
            const data = Array.isArray(consultSections?.data) ? consultSections.data : [];
            if (consultSections.ok && data.length > 0) {
                globalData.sections = data.reduce((acc, section) => {
                    acc[section.alias] = section;
                    return acc;
                }, {});
            }
        }

        next();
    } catch (err) {
        console.error("Error en tenantResolver:", err.message);
        res.status(500).send("No se pudo resolver el sitio");
    }
}

// ⬅️ exportamos ambos: el middleware y el objeto compartido
module.exports = { tenantResolver, globalData };
