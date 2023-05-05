/** Deno script, CORS for wallhaven.cc */
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";

const WH_HOST = "wallhaven.cc";
const WH_BASE_URL = "https://wallhaven.cc";

const relayAPI = async (pathAndSearch) => {
    const targetURL = WH_BASE_URL + pathAndSearch;
    const resp = await fetch(targetURL);
    if (resp.status === 200) {
        return await resp.text();
    }
    throw new Error(resp);
};

const relayAnything = async (targetURLString) => {
    const resp = await fetch(targetURLString);
    if (resp.status === 200) {
        const bodyData = await resp.blob();
        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": resp.headers.get("Content-Type"),
        };
        return new Response(bodyData, {
            status: 200,
            headers,
        });
    }
    throw new Error(resp);
};

const responseHeader = (headers = {}) => {
    return {
        ...headers,
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
    };
};

const response200 = (body) => {
    return new Response(body, {
        status: 200,
        headers: responseHeader(),
    });
};

const response404 = () => {
    return new Response("\"404 Not Found\"", {
        status: 404,
        headers: responseHeader(),
    });
};

const response500 = () => {
    return new Response("\"500 Internal Server Error\"", {
        status: 500,
        headers: responseHeader(),
    });
};

serve(async (req) => {
    const url = new URL(req.url);
    const pathname = url.pathname;
    if (!pathname.startsWith("/api/")) {
        return response404();
    }
    // Do dynamic responses
    if (req.method === "OPTIONS") {
        return new Response("200 OK", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "Get, POST, OPTIONS",
                "Access-Control-Allow-Headers": req.headers.get("Access-Control-Request-Headers"),
                "Access-Control-Max-Age": "86400",
            }
        });
    } else if (req.method === "GET") {
        try {
            if (pathname === "/api/extra/relay") {
                const targetURLString = url.searchParams.get("href");
                if (!targetURLString) {
                    return response404();
                }
                const targetURL = new URL(targetURLString);
                if (targetURL.hostname.indexOf(WH_HOST) < 0) {
                    return response404();
                }
                return relayAnything(targetURLString);
            } else {
                const content = await relayAPI(pathname + url.search);
                return response200(content);
            }
        } catch (e) {
            console.error(e);
            return response500();
        }
    }
    return response404();
});
