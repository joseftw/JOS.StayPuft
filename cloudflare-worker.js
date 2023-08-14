class MetaTransformer{
    constructor(targetValue) {
        this.targetValue = targetValue;
    }

    element(element) {
        // Check if the element is a link tag and its href attribute contains the target value
        if (
            element.tagName === "meta" &&
            element.getAttribute("name") === "referrer"
        ) {
            element.setAttribute('content', 'no-referrer')
        }
    }
}

class LinkTransformer {
    constructor(targetValue) {
        this.targetValue = targetValue;
    }

    element(element) {
        // Check if the element is a link tag and its href attribute contains the target value
        if (
            element.tagName === "link" &&
            element.getAttribute("href") &&
            element.getAttribute("href").includes(this.targetValue)
        ) {
            // Remove the link element from the HTML
            element.remove();
        }
    }
}

class ScriptTransformer {
    constructor(targetValue) {
        this.targetValue = targetValue;
    }

    element(element) {
        // Check if the element is a script tag and its src attribute contains the target value
        if (
            element.tagName === "script" &&
            element.getAttribute("src") &&
            element.getAttribute("src").includes(this.targetValue)
        ) {
            // Remove the script element from the HTML
            element.remove();
        }
    }
}

let securityHeaders = {
    "Content-Security-Policy" : "upgrade-insecure-requests;",
    "Strict-Transport-Security" : "max-age=1000",
    "X-Xss-Protection" : "1; mode=block",
    "X-Frame-Options" : "SAMEORIGIN",
    "X-Content-Type-Options" : "nosniff",
    "Referrer-Policy" : "no-referrer",
    "Permissions-Policy" : "accelerometer=(self), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(self), geolocation=(self), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), navigation-override=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=(), clipboard-read=(self), clipboard-write=(self), gamepad=(), speaker-selection=()"
}

let removeHeaders = [
    "Public-Key-Pins",
    "X-Powered-By",
    "server"
]

let sanitiseHeaders = {
    "server" : "josefs",
}

addEventListener('fetch', event => {
    event.respondWith(addHeaders(event.request))
})

async function addHeaders(req) {
    let response = await fetch(req)

    let newHdrs = new Headers(response.headers)

    if (newHdrs.has("Content-Type") && !newHdrs.get("Content-Type").includes("text/html")) {
        return new Response(response.body , {
            status: response.status,
            statusText: response.statusText,
            headers: newHdrs
        })
    }

    Object.keys(securityHeaders).map(function(name, index) {
        newHdrs.set(name, securityHeaders[name]);
    })

    Object.keys(sanitiseHeaders).map(function(name, index) {
        newHdrs.set(name, sanitiseHeaders[name]);
    })

    removeHeaders.forEach(function(name){
        newHdrs.delete(name)
    })

    // Check if the response is an HTML page
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
        const rewriter = new HTMLRewriter()
            .on("meta", new MetaTransformer("referrer"))
            .on("link", new LinkTransformer("/public/cards.min.css"))
            .on("script", new ScriptTransformer("/public/cards.min."));

        const transformedResponse = rewriter.transform(response);
        response = transformedResponse;
    }

    return new Response(response.body , {
        status: response.status,
        statusText: response.statusText,
        headers: newHdrs
    })
}
