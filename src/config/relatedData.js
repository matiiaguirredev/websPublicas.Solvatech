/* 

Este archivo lo usamos puntualmete para en vistas de detalles 
(ej: blog-details) 
no cargar ni consultar todos los cruds,
sino solo los relacionados según la configuración aquí definida.

*/

module.exports = {
    solvatechblogcards: [
        { alias: 'solvatechservicescards', key: 'solvatechservicescards' }, // categorías/servicios sidebar
        { alias: 'solvatechblogcards', key: 'recent_posts' },               // otros posts
        { alias: 'solvatechtags', key: 'solvatechtags' },                    // todos los tags globales
        { alias: 'solvatechcontactcards', key: 'solvatechcontactcards' },   // tarjetas de contacto

    ],

    solvatechservicescards: [
        { alias: 'solvatechservicescards', key: 'related_services' },     // filtrados
        { alias: 'solvatechservicescards', key: 'solvatechservicescards' }, // array completo
        { alias: 'solvatechcontact', key: 'solvatechcontact' },
        { alias: 'solvatechcontactcards', key: 'solvatechcontactcards' },
    ],



};


