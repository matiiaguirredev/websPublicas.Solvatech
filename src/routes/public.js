const apiClient = require('../lib/apiClient');
const relatedConfig = require('../config/relatedData'); // relaciones adicionales dinámicas


module.exports = function (renderPage, TEMPLATE_ALIASES) {
    const express = require('express');
    const router = express.Router();

    router.get('/', async (req, res) => {
        try {
            const host = req.headers.host;
            const { globalData } = require('../middleware/tenantResolver');

            const st_templates = globalData.st_template[host] ||
                (process.env.TEMPLATE_ALIAS || TEMPLATE_ALIASES[0] || '').trim();
            const st_urlSetting = globalData.st_urlSetting[host] ||
                (req.query.id || process.env.URLSETTING_ID || '').trim();

            const templateOnUse = globalData.templates ? globalData.templates[st_templates] : null;
            if (!templateOnUse) {
                return res.status(404).send(`Template "${st_templates}" no registrado.`);
            }

            const seccionOnUse = globalData.sections ? globalData.sections[templateOnUse.home] : null;
            if (!seccionOnUse) {
                return res.status(404).send(`Sección "${templateOnUse.home}" no registrada.`);
            }

            // filtrar globaldata sections segun templateonuse.sections y agregar en un array el nombre y el alias de cada seccion, que el alias este dentro de templateonuse.sections
            const filteredSections = Object.keys(globalData.sections || {}).filter(alias => {
                return templateOnUse.sections && templateOnUse.sections.includes(alias);
            }).map(alias => {
                // elimina del nombre de la seccion el nombre del template
                const name = globalData.sections[alias].name.replace(templateOnUse.name, '').trim();
                // verificar si el alias es = al template.home, cambiar el alias por "/"
                const aliasPath = (alias === templateOnUse.home) ? '/' : '/' + alias;

                return {
                    name: name,
                    alias: aliasPath
                };
            });

            let data = {};
            data.filteredSections = filteredSections;
            const cruds = seccionOnUse.cruds ? seccionOnUse.cruds.split(',').map(c => c.trim()) : [];

            const fetchDataPromises = cruds.map(async (crud) => {
                // if (crud !== '') {
                //     return;
                // }

                const response = await apiClient.getData(crud, { st_urlSetting });
                const checkData = Array.isArray(response?.data) ? response.data : [];
                if (response.ok && checkData.length > 0) data[crud] = checkData;
            });

            await Promise.all(fetchDataPromises);
            // console.log("globalData:", globalData.st_urlSettingData[host]);
            // console.log("data", filteredSections);
            return renderPage(req, res, st_templates, 'index', st_urlSetting, data, globalData);
        } catch (error) {
            console.error(`Error en ruta /:`, error.stack);
            return res.status(500).send(error.stack);
        }
    });

    /*     router.get('/:alias', async (req, res) => {
            try {
                const alias = (req.params.alias || '').trim();
                const host = req.headers.host;
                const { globalData } = require('../middleware/tenantResolver');
    
                const st_templates = globalData.st_template[host] ||
                    (process.env.TEMPLATE_ALIAS || TEMPLATE_ALIASES[0] || '').trim();
                const st_urlSetting = globalData.st_urlSetting[host] ||
                    (req.query.id || process.env.URLSETTING_ID || '').trim();
    
                const templateOnUse = globalData.templates ? globalData.templates[st_templates] : null;
                if (!templateOnUse) return res.status(404).send(`Template "${st_templates}" no registrado.`);
    
                if (alias === templateOnUse.home) return res.redirect('/');
    
                if (!templateOnUse.sections || !templateOnUse.sections.includes(alias)) {
                    return res.status(404).send(`Alias "${alias}" no registrado en template "${st_templates}".`);
                }
    
                const seccionOnUse = globalData.sections ? globalData.sections[alias] : null;
                if (!seccionOnUse) return res.status(404).send(`Sección "${alias}" no registrada.`);
    
                let data = {};
                const cruds = seccionOnUse.cruds ? seccionOnUse.cruds.split(',').map(c => c.trim()) : [];
    
                const fetchDataPromises = cruds.map(async (crud) => {
                    const response = await apiClient.getData(crud, { st_urlSetting });
                    const checkData = Array.isArray(response?.data) ? response.data : [];
                    if (response.ok && checkData.length > 0) data[crud] = checkData;
                });
    
                await Promise.all(fetchDataPromises);
                return renderPage(req, res, st_templates, alias, st_urlSetting, data, globalData);
            } catch (error) {
                console.error(`Error en ruta /:`, error.stack);
                return res.status(500).send(error.stack);
            }
        }); */

    router.get('/:alias', async (req, res) => {
        try {
            const alias = (req.params.alias || '').trim();
            const host = req.headers.host;
            const { globalData } = require('../middleware/tenantResolver');

            const st_templates = globalData.st_template[host] ||
                (process.env.TEMPLATE_ALIAS || TEMPLATE_ALIASES[0] || '').trim();
            const st_urlSetting = globalData.st_urlSetting[host] ||
                (req.query.id || process.env.URLSETTING_ID || '').trim();

            const templateOnUse = globalData.templates ? globalData.templates[st_templates] : null;
            if (!templateOnUse) return res.status(404).send(`Template "${st_templates}" no registrado.`);

            if (alias === templateOnUse.home) return res.redirect('/');

            if (!templateOnUse.sections || !templateOnUse.sections.includes(alias)) {
                return res.status(404).send(`Alias "${alias}" no registrado en template "${st_templates}".`);
            }

            const seccionOnUse = globalData.sections ? globalData.sections[alias] : null;
            if (!seccionOnUse) return res.status(404).send(`Sección "${alias}" no registrada.`);

            // filtrar globaldata sections segun templateonuse.sections y agregar en un array el nombre y el alias de cada seccion, que el alias este dentro de templateonuse.sections
            const filteredSections = Object.keys(globalData.sections || {}).filter(alias => {
                return templateOnUse.sections && templateOnUse.sections.includes(alias);
            }).map(alias => {
                // elimina del nombre de la seccion el nombre del template
                const name = globalData.sections[alias].name.replace(templateOnUse.name, '').trim();
                // verificar si el alias es = al template.home, cambiar el alias por "/"
                const aliasPath = (alias === templateOnUse.home) ? '/' : '/' + alias;

                return {
                    name: name,
                    alias: aliasPath
                };
            });

            let data = {};
            data.filteredSections = filteredSections;
            const cruds = seccionOnUse.cruds ? seccionOnUse.cruds.split(',').map(c => c.trim()) : [];

            // // 🔹 Obtener todos los datasets de la sección
            // const fetchDataPromises = cruds.map(async (crud) => {
            //     const response = await apiClient.getData(crud, { st_urlSetting });
            //     const checkData = Array.isArray(response?.data) ? response.data : [];
            //     if (response.ok && checkData.length > 0) data[crud] = checkData;
            // });

            // 🔹 Obtener datasets filtrados (por ejemplo, solo solvatechcontact)
            const fetchDataPromises = cruds.map(async (crud) => {
                // 👇 Ajustá el nombre del CRUD que querés inspeccionar
                // if (crud !== 'solvatechcontact' && crud !== 'solvatechcontactcards') {
                //     return; // ignora el resto
                // }
                // if (crud !== '') {
                //     return; // ignora el resto
                // }

                const response = await apiClient.getData(crud, { st_urlSetting });
                const checkData = Array.isArray(response?.data) ? response.data : [];

                if (response.ok) {
                    data[crud] = checkData; // puede ser array vacío y está bien

                    if (checkData.length > 0) {
                        // console.log(`✅ CRUD ${crud} cargado correctamente (${checkData.length} registros)`);
                    } else {
                        // console.log(`⚠️ CRUD ${crud} cargado pero sin registros`);
                    }

                } else {
                    // console.log(`❌ Error al cargar CRUD ${crud}`, response?.status || '', response?.error || '');
                }
            });

            await Promise.all(fetchDataPromises);
            // console.log("data", data);

            return renderPage(req, res, st_templates, alias, st_urlSetting, data, globalData);
        } catch (error) {
            console.error(`Error en ruta /:`, error.stack);
            return res.status(500).send(error.stack);
        }
    });

    router.get('/:crud/:id', async (req, res) => {
        try {
            const crud = (req.params.crud || '').trim();
            const id = (req.params.id || '').trim();
            const host = req.headers.host;
            const { globalData } = require('../middleware/tenantResolver');

            const st_templates = globalData.st_template[host] ||
                (process.env.TEMPLATE_ALIAS || TEMPLATE_ALIASES[0] || '').trim();
            const st_urlSetting = globalData.st_urlSetting[host] ||
                (req.query.id || process.env.URLSETTING_ID || '').trim();

            const templateOnUse = globalData.templates ? globalData.templates[st_templates] : null;
            if (!templateOnUse) return res.status(404).send(`Template "${st_templates}" no registrado.`);


            // filtrar globaldata sections segun templateonuse.sections y agregar en un array el nombre y el alias de cada seccion, que el alias este dentro de templateonuse.sections
            const filteredSections = Object.keys(globalData.sections || {}).filter(alias => {
                return templateOnUse.sections && templateOnUse.sections.includes(alias);
            }).map(alias => {
                // elimina del nombre de la seccion el nombre del template
                const name = globalData.sections[alias].name.replace(templateOnUse.name, '').trim();
                // verificar si el alias es = al template.home, cambiar el alias por "/"
                const aliasPath = (alias === templateOnUse.home) ? '/' : '/' + alias;

                return {
                    name: name,
                    alias: aliasPath
                };
            });

            let data = {};
            data.filteredSections = filteredSections;

            // 1️⃣ Consulta principal — el CRUD actual (ej: solvatechblogcards/1)
            const mainResponse = await apiClient.getData(`${crud}/${id}`, { st_urlSetting });
            if (!mainResponse.ok || !mainResponse.data) {
                return res.status(404).send(`No existe registro para ${crud}/${id}`);
            }
            data[crud] = mainResponse.data;

            //Esto es un alias opcional que solo usamos para resolver un problema particular de solvatechservicescards.
            /* Porque: solvatechservicescards se usa como ARRAY en:footer sidebar sections
            Pero EN EL DETALLE, también necesitabas usarlo como OBJETO. 
            */
            data.service = mainResponse.data;
            // console.log("data crud", data[crud]);
            

            // 2️⃣ Consultas relacionadas — definidas en relatedData.js
            const relatedEntries = relatedConfig[crud] || [];

            if (relatedEntries.length > 0) {
                const relatedPromises = relatedEntries.map(async (relation) => {
                    const relatedResponse = await apiClient.getData(relation.alias, { st_urlSetting });

                    const targetKey = relation.key || relation.alias;

                    if (relatedResponse.ok) {
                        const arr = Array.isArray(relatedResponse.data)
                            ? relatedResponse.data
                            : [];

                        // 🔹 Si la relación apunta al mismo CRUD (ej: posts recientes)
                        if (relation.alias === crud) {
                            data[targetKey] = arr.filter(
                                (item) => String(item.id) !== String(id)
                            );
                        } else {
                            // 🔹 Si la relación es otro CRUD
                            data[targetKey] = arr;
                        }

                    } else {
                        // 🔹 Si la API falla, mantenemos estructura consistente
                        data[targetKey] = [];
                        console.log(`❌ Error al cargar relación ${relation.alias}`);
                    }
                });

                await Promise.all(relatedPromises);
            }

            // console.log("data", data);

            return renderPage(req, res, st_templates, crud + "-details", st_urlSetting, data, globalData);
        } catch (error) {
            console.error(`Error en ruta /:`, error.stack);
            return res.status(500).send(error.stack);
        }
    });

    /*  guardar esto por las dudas momentaneamente, es el /:crud/:id anterior al de abajo que es flexible con los banners
    router.get('/:crud/:id', async (req, res) => {
        try {
            const crud = (req.params.crud || '').trim();
            const id = (req.params.id || '').trim();
            const host = req.headers.host;
            const { globalData } = require('../middleware/tenantResolver');

            const st_templates = globalData.st_template[host] ||
                (process.env.TEMPLATE_ALIAS || TEMPLATE_ALIASES[0] || '').trim();
            const st_urlSetting = globalData.st_urlSetting[host] ||
                (req.query.id || process.env.URLSETTING_ID || '').trim();

            const templateOnUse = globalData.templates ? globalData.templates[st_templates] : null;
            if (!templateOnUse) return res.status(404).send(`Template "${st_templates}" no registrado.`);


            let data = {}; // dataset final que se envía al render

            // 1️⃣ Consulta principal — el CRUD actual (ej: solvatechblogcards/1)
            const mainResponse = await apiClient.getData(`${crud}/${id}`, { st_urlSetting });
            if (mainResponse.ok) {
                data[crud] = mainResponse.data;
            }

            // 2️⃣ Consultas relacionadas — definidas en relatedData.js
            const relatedEntries = relatedConfig[crud] || [];

            if (relatedEntries.length > 0) {
                const relatedPromises = relatedEntries.map(async (relation) => {
                    const relatedResponse = await apiClient.getData(relation.alias, { st_urlSetting });

                    if (relatedResponse.ok && Array.isArray(relatedResponse.data)) {
                        const targetKey = relation.key || relation.alias;

                        // 🔹 Si la relación apunta al mismo CRUD (por ejemplo: posts recientes)
                        if (relation.alias === crud) {
                            data[targetKey] = relatedResponse.data.filter(
                                (item) => String(item.id) !== String(id)
                            );
                        } else {
                            // 🔹 Si la relación es otro CRUD (por ejemplo: categorías o servicios)
                            data[targetKey] = relatedResponse.data;
                        }
                    }
                });

                await Promise.all(relatedPromises);
            }

            console.log("data", data);

            return renderPage(req, res, st_templates, crud + "-details", st_urlSetting, data, globalData);
        } catch (error) {
            console.error(`Error en ruta /:`, error.stack);
            return res.status(500).send(error.stack);
        }
    });
    */

    return router;
};
