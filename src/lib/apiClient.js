require('dotenv').config();
const fetch = require('node-fetch'); // v2

const API_BASE_URL = process.env.API_BASE_URL.replace(/\/$/, '');
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

function withToken(url) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}token=${encodeURIComponent(SERVICE_TOKEN)}`;
}

// getData.js
// Node >=18 tiene fetch nativo. Si usás <18, instala node-fetch.

function withTimeout(ms = 5000) {
    const ac = new AbortController();
    const id = setTimeout(() => ac.abort(new Error(`Timeout ${ms}ms`)), ms);
    return { signal: ac.signal, cancel: () => clearTimeout(id) };
}

/**
 * getData - llamada GET a la API con manejo de errores de tu backend
 * @param {string} endpoint   - ej: "urlSetting"
 * @param {object} params     - ej: { url: "cliente.com" }
 * @param {object} options    - { headers, timeoutMs, req }
 *   - options.req: request de Express para forwardear cookies (req.headers.cookie)
 */
async function getData(endpoint, params = {}, options = {}) {
    const { headers = {}, timeoutMs = 7000, req } = options;

    // Querystring seguro
    let query = new URLSearchParams(params).toString();

    if (!query.includes("token=")) {
        query = query
            ? `${query}&token=${encodeURIComponent(process.env.SERVICE_TOKEN)}`
            : `token=${encodeURIComponent(process.env.SERVICE_TOKEN)}`;
    }

    let url = `${process.env.API_BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
    if (query) url += `?${query}`;

    // console.log("url final:", url);

    const t = withTimeout(timeoutMs);

    const finalHeaders = {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
    };
    if (req?.headers?.cookie && !finalHeaders.Cookie) {
        finalHeaders.Cookie = req.headers.cookie;
    }

    try {
        const res = await fetch(url, { method: "GET", headers: finalHeaders, signal: t.signal });

        const raw = await res.text();
        let json;
        try { json = raw ? JSON.parse(raw) : null; } catch { json = null; }

        if (res.ok) {
            return { ok: true, status: res.status, data: json?.data ?? json ?? raw };
        }

        const apiMsg =
            (json && (json.message || json.error || json.msg)) ||
            res.statusText ||
            "Error desconocido";

        return {
            ok: false,
            status: res.status,
            error: apiMsg,
            data: json?.data ?? json ?? raw,
        };
    } catch (err) {
        return {
            ok: false,
            status: 0,
            error: err?.message || "Fallo de red",
            data: null,
        };
    } finally {
        t.cancel();
    }
}




module.exports = { getData, withToken };

