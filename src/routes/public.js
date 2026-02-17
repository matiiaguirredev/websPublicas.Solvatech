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

            let data = {};
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
            // console.log("data", data);
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

            let data = {};
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

                if (response.ok && checkData.length > 0) {
                    data[crud] = checkData;
                    console.log(`✅ CRUD ${crud} cargado correctamente (${checkData.length} registros)`);
                } else {
                    console.log(`⚠️ CRUD ${crud} vacío o sin respuesta válida`);
                }
            });

            await Promise.all(fetchDataPromises);
            // console.log("data", data);

            // 🔹 --- BANNERS GENÉRICOS (igual que en /:crud/:id) ---
            const templateAlias = req.query.st_template || st_templates;
            const bannersCrud = `${templateAlias}sectionbanners`;

            const bannersRes = await apiClient.getData(bannersCrud, { st_urlSetting });

            // --- BANNERS GENÉRICOS (solo si está declarado en la sección) ---
            if (cruds.includes(`${st_templates}sectionbanners`)) {
                const bannersCrud = `${st_templates}sectionbanners`;
                const bannersRes = await apiClient.getData(bannersCrud, { st_urlSetting });

                if (bannersRes.ok && Array.isArray(bannersRes.data)) {
                    const allBanners = bannersRes.data;
                    const posibles = [alias + '-details', alias];

                    const banner = allBanners.find(b => {
                        const secciones = (b.sections || '').split(',').map(s => s.trim().toLowerCase());
                        return secciones.some(s =>
                            posibles.some(p => s.includes(p.toLowerCase()) || p.includes(s))
                        );
                    });

                    if (banner) {
                        data.sectionBanner = banner;
                        // console.log(`✅ Banner encontrado en ${bannersCrud}:`, banner.titulo);
                    }
                }
            }

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


            let data = {}; // dataset final que se envía al render

            // 1️⃣ Consulta principal — el CRUD actual (ej: solvatechblogcards/1)
            const mainResponse = await apiClient.getData(`${crud}/${id}`, { st_urlSetting });
            if (mainResponse.ok) {
                data[crud] = mainResponse.data;

                
                //Esto es un alias opcional que solo usamos para resolver un problema particular de solvatechservicescards.
                /* Porque: solvatechservicescards se usa como ARRAY en:footer sidebar sections
                Pero EN EL DETALLE, también necesitabas usarlo como OBJETO. 
                */
                data.service = mainResponse.data;
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

            // --- BANNERS GENÉRICOS (para todos los templates) ---
            const templateAlias = req.query.st_template || data.template_alias || 'solvatech';
            const bannersCrud = `${templateAlias}sectionbanners`;

            const bannersRes = await apiClient.getData(bannersCrud, { st_urlSetting });

            if (bannersRes.ok && Array.isArray(bannersRes.data)) {
                const allBanners = bannersRes.data;

                const crudBase = crud.replace(/cards$/, '');
                const posibles = [
                    crud + '-details',
                    crudBase,
                    crud
                ];

                const banner = allBanners.find(b => {
                    const secciones = (b.sections || '').split(',').map(s => s.trim());
                    return secciones.some(s => posibles.includes(s));
                });

                if (banner) {
                    data.sectionBanner = banner;
                    console.log(`✅ Banner encontrado en ${bannersCrud}:`, banner.titulo);
                } else {
                    console.log(`⚠️ No se encontró banner aplicable en ${bannersCrud}`);
                }
            } else {
                console.warn(`⚠️ Sin banners disponibles en ${bannersCrud}`);
            }

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

            // --- DEBUG: BANNERS ---
            const bannersRes = await apiClient.getData('solvatechsectionbanners', { st_urlSetting });
            console.log('🔹[Banner Debug] st_urlSetting:', st_urlSetting);
            console.log('🔹[Banner Debug] crud actual:', crud);

            if (bannersRes.ok && Array.isArray(bannersRes.data)) {
                const allBanners = bannersRes.data;
                console.log('✅ [Banner Debug] banners encontrados:', allBanners.length);

                const crudBase = crud.replace(/cards$/, '');
                const posibles = [
                    crud + '-details',
                    crudBase,
                    crud
                ];

                console.log('🔹[Banner Debug] posibles matches:', posibles);

                const banner = allBanners.find(b => {
                    const secciones = (b.sections || '').split(',').map(s => s.trim());
                    return secciones.some(s => posibles.includes(s));
                });

                if (banner) {
                    console.log('✅ [Banner Debug] banner encontrado:', banner);
                    data.sectionBanner = banner;
                } else {
                    console.warn('⚠️ [Banner Debug] ningún banner coincidió con', posibles);
                }
            } else {
                console.warn('⚠️ [Banner Debug] no se obtuvieron banners');
            }


            return renderPage(req, res, st_templates, crud + "-details", st_urlSetting, data, globalData);
        } catch (error) {
            console.error(`Error en ruta /:`, error.stack);
            return res.status(500).send(error.stack);
        }
    });
    */

    return router;
};
