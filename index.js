/**
 * To pass Content-Security-Policy, add header to the page:
 * <meta http-equiv="Content-Security-Policy" content="default-src 'self' <APIServerURL>">
 * API Document: https://wallhaven.cc/help/api
 */

/** ListWallpapersOption
 * @typedef {Object} ListWallpapersOption
 * @property {string | undefined} [q] Search query
 * @property {"000"|"001"|"010"|"011"|"100"|"101"|"110"|"111" | undefined} [categories] Turn categories on(1) or off(0) (general/anime/people)
 * @property {"000"|"001"|"010"|"011"|"100"|"101"|"110"|"111" | undefined} [purity] Turn purities on(1) or off(0) (sfw/sketchy/nsfw)
 * @property {"date_added"|"relevance"|"random"|"views"|"favorites"|"toplist" | undefined} [sorting] Method of sorting results
 * @property {"desc"|"asc" | undefined} order Sorting order
 * @property {"1d"|"3d"|"1w"|"1M"|"3M"|"6M"|"1y" | undefined} [topRange] Sorting MUST be set to 'toplist'
 * @property {string | undefined} [atleast] Minimum resolution allowed. e.g. 1920x1080
 * @property {string | undefined} [resolutions] List of exact wallpaper resolution(s). e.g.  1920x1080,1920x1200
 * @property {string | undefined} [ratios] List of aspect ratio(s). e.g.  16x9,16x10,1x1,landscape,portrait
 * @property {string | undefined} [colors] Search by color
 * @property {string | undefined} [page] Pagination
 * @property {string | undefined} [seed] Optional seed for random results
 */

export const DEFAULT_API_ENTRY = "https://wallhaven.cc/api";

export class WallhavenAPI {
    /** @type {string | null} */
    #apiKey = null;
    /** @type {string} */
    #apiEntry = DEFAULT_API_ENTRY;

    constructor (apiEntry = DEFAULT_API_ENTRY, apiKey = null) {
        this.#apiEntry = apiEntry;
        this.#apiKey = apiKey;
    }

    #newApiUrl (apiPath) {
        const url = new URL(this.#apiEntry + apiPath);
        if (this.#apiKey) {
            url.searchParams.set("apikey", this.#apiKey);
        }
        return url;
    }

    async #apiFetch (url) {
        try {
            const resp = await fetch(url);
            if (resp.status !== 200) {
                return undefined;
            }
            return await resp.json();
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }

    /**
     * listWallpapers
     * @param {ListWallpapersOption} option 
     * @returns {Promise<Array<any>> | Promise<undefined>}
     */
    async listWallpapers (option) {
        const url = this.#newApiUrl("/v1/search");
        for (const param in option) {
            if (Object.hasOwnProperty.call(option, param)) {
                let value = option[ param ];
                if (typeof value === "number") {
                    value = value.toString();
                }
                url.searchParams.set(param, value);
            }
        }
        return await this.#apiFetch(url);
    }

    async getWallpaperInformation (wallpaperId) {
        const url = this.#newApiUrl("/v1/w/" + encodeURI(wallpaperId));
        return await this.#apiFetch(url);
    }

    async getTaginfo (tagId) {
        const url = this.#newApiUrl("/v1/tag/" + encodeURI(tagId));
        return await this.#apiFetch(url);
    }

    async getUserSettings () {
        const url = this.#newApiUrl("/v1/settings");
        return await this.#apiFetch(url);
    }

    async getUserCollections () {
        const url = this.#newApiUrl("/v1/collections");
        return await this.#apiFetch(url);
    }
}
