import { domReady } from "./lib/html";
import { get_info } from "./lookup";

// Get Options from data-options and json parse them
function get_options(el) {
    const raw = el.getAttribute('data-options');
    try {
        return JSON.parse(raw);
    } catch (e) {
        return {};
    }
}

async function action_on_elements(className, errorMessage, callback) {
    const elements = document.getElementsByClassName(className);
    if (!elements.length) return;

    const record = await get_info();

    if (record.error()) {
        console.error('Geodata Error (' + errorMessage + '): ' + record.error());
        return;
    }

    Array.from(elements)
        .forEach(el => callback(el, record));
}

function do_shortcode_normal(el, record) {
    const opt = get_options(el);
    if (opt.skip_cache) {
        console.warn("The property 'skip_cache' is ignored in AJAX mode. You could disable the response caching on the server by setting the constant GEOIP_DETECT_READER_CACHE_TIME.");
    }

    const output = record.get_with_locales(opt.property, opt.lang, opt.default);
    el.innerText = output;
}

function do_shortcode_flags(el, record) {
    let country = record.get('country.iso_code');
    if (country) {
        country = country.substr(0, 2).toLowerCase();
    }

    country = country || get_options(el).default;
    if (country) {
        el.classList.add('flag-icon-' + country)
    }
}

export const do_shortcodes = async function do_shortcodes() {
    await domReady;

    // These are called in parallel, as they are ajax functions
    action_on_elements('js-geoip-detect-shortcode', 
        'could not execute shortcode [geoip_detect2]', do_shortcode_normal);

    action_on_elements('js-geoip-detect-flag', 
        'could not configure the flags', do_shortcode_flags);
};