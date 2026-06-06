globalThis.__nitro_main__ = import.meta.url;
import { o as __toESM } from "./_runtime.mjs";
import { a as defineLazyEventHandler, c as NodeResponse, i as callMiddleware, n as HTTPError, o as toEventHandler, s as toMiddleware, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { a as compress, c as HTTPException, i as cors, n as secureHeaders, r as logger, s as Hono } from "./_libs/hono.mjs";
import { n as openAPIRouteHandler, t as describeRoute } from "./_libs/hono-openapi.mjs";
import { t as rateLimiter } from "./_libs/hono-rate-limiter.mjs";
import { t as require_built } from "./_libs/ioredis+[...].mjs";
//#region #nitro-vite-setup
globalThis.__nitro_vite_envs__ = {};
//#endregion
//#region node_modules/.deno/nitro@3.0.260603-beta/node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region src/lib/server/env.ts
var ServerENV = {
	isProduction: process.env.PROD,
	APP_URL: process.env.VITE_APP_URL,
	REDIS_URL: process.env.REDIS_URL,
	WEATHER_AI_KEY: process.env.WEATHER_AI_KEY
};
//#endregion
//#region src/lib/server/api-config.ts
var honoConf = {
	corsConfig: {
		origin: [ServerENV.APP_URL],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
		methods: [
			"GET",
			"POST",
			"DELETE"
		]
	},
	rateLimiterConfig: {
		limit: 120,
		windowMs: 60 * 1e3,
		keyGenerator: (c) => {
			const forwarded = c.req.header("x-forwarded-for");
			const realIp = c.req.header("x-real-ip");
			const cfConnectingIp = c.req.header("cf-connecting-ip");
			return forwarded?.split(",")[0]?.trim() || realIp || cfConnectingIp || "unknown";
		}
	},
	bodyLimitConfig: {
		maxSize: .5 * 1024 * 1024,
		onError: (c) => {
			return c.json({
				message: "Request body too large",
				data: null,
				extra: {
					route: c.req.url,
					method: c.req.method,
					error: "Request body too large"
				}
			}, 401);
		}
	},
	secureHeadersConfig: {
		contentSecurityPolicy: { baseUri: ["'self'"] },
		xXssProtection: "1; mode=block",
		xFrameOptions: "DENY",
		xContentTypeOptions: "nosniff",
		referrerPolicy: true,
		crossOriginEmbedderPolicy: true,
		crossOriginOpenerPolicy: true,
		crossOriginResourcePolicy: true,
		xRobotsTag: "none"
	}
};
//#endregion
//#region src/lib/server/api-utils.ts
function response(resp) {
	return {
		isSuccess: resp.isSuccess ?? true,
		message: resp.message ?? "ok",
		extra: resp.extra ?? null,
		data: resp.data ?? null
	};
}
var BadRequestError = class extends HTTPException {
	constructor(message) {
		super(400, { message });
	}
};
function errorHandler$1(error, ctx) {
	if (error instanceof HTTPException) {
		ctx.status(error.status);
		return ctx.json(response({
			isSuccess: false,
			message: error.message,
			data: error
		}));
	}
	console.error("Application Error Log :", error);
	ctx.status(500);
	return ctx.json(response({
		isSuccess: false,
		message: "Internal Server Error",
		data: null,
		extra: {
			route: ctx.req.url,
			method: ctx.req.method,
			error
		}
	}));
}
//#endregion
//#region src/lib/server/dev-middlewares.ts
var openApiQueryParam = (type, name, description, enumValues) => {
	return {
		in: "query",
		name,
		description,
		schema: {
			type,
			enum: enumValues
		}
	};
};
var apiRouteDoc = (options) => ServerENV.isProduction ? (_, next) => next() : describeRoute({
	tags: [options.tag],
	...options.summary !== void 0 && { summary: options.summary },
	...options.parameters !== void 0 && { parameters: options.parameters }
});
//#endregion
//#region src/apis/services/cache-driver.ts
var import_built = /* @__PURE__ */ __toESM(require_built(), 1);
var CacheDriver = class {
	namespace;
	redis;
	constructor(namespace = "weather-ai-cache") {
		this.namespace = namespace;
		this.redis = new import_built.default(ServerENV.REDIS_URL);
	}
	getKey(key) {
		return `${this.namespace}:${key}`;
	}
	async get(key) {
		const fullKey = this.getKey(key);
		const data = await this.redis.get(fullKey);
		if (!data) return null;
		const item = JSON.parse(data);
		if (Date.now() > item.expiresAt) {
			await this.redis.del(fullKey);
			return null;
		}
		return item.value;
	}
	async set(key, value, ttlSeconds = 600) {
		const fullKey = this.getKey(key);
		const item = {
			value,
			expiresAt: Date.now() + ttlSeconds * 1e3
		};
		await this.redis.set(fullKey, JSON.stringify(item), "EX", ttlSeconds);
	}
	async invalidate(key) {
		const fullKey = this.getKey(key);
		await this.redis.del(fullKey);
	}
};
var defaultCacheDriver = new CacheDriver();
//#endregion
//#region src/apis/services/weather-ai.service.ts
var WeatherAIError = class extends Error {
	status;
	constructor(status, message) {
		super(message);
		this.status = status;
		this.name = "WeatherAIError";
	}
};
var WeatherAiSDK = class {
	WAiApiKey = ServerENV.WEATHER_AI_KEY;
	WAiBaseUrl = "https://api.weather-ai.co";
	constructor() {}
	async WAiFetch(endpoint, params = {}) {
		const url = new URL(`${this.WAiBaseUrl}${endpoint}`);
		for (const [k, v] of Object.entries(params)) if (v !== void 0) url.searchParams.set(k, String(v));
		const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${this.WAiApiKey}` } });
		if (!res.ok) {
			let msg = res.statusText;
			try {
				msg = (await res.json())?.message ?? msg;
			} catch {}
			throw new WeatherAIError(res.status, msg);
		}
		return res.json();
	}
	getWeather(params) {
		return this.WAiFetch("/v1/weather", {
			...params,
			ai: params.ai ?? true,
			units: params.units ?? "metric"
		});
	}
	getWeatherByGeo(params = {}) {
		return this.WAiFetch("/v1/weather-geo", {
			ip: params.ip ?? "auto",
			days: params.days,
			ai: params.ai ?? true
		});
	}
};
var weatherAIClient = new WeatherAiSDK();
//#endregion
//#region src/apis/routes/weather.ts
var weatherRoutes = new Hono().basePath("weather");
weatherRoutes.get("current", apiRouteDoc({
	tag: "Weather",
	parameters: [
		openApiQueryParam("string", "lat", "Latitude"),
		openApiQueryParam("string", "lon", "Longitude"),
		openApiQueryParam("number", "days", "Days to forecast. Default is 1", [
			"1",
			"7",
			"14",
			"30"
		]),
		openApiQueryParam("string", "units", "Units. Default is metric", ["metric", "imperial"]),
		openApiQueryParam("string", "ai", "AI Mode. Default is false", ["true", "false"])
	]
}), async (ctx) => {
	const lat = ctx.req.query("lat");
	const lon = ctx.req.query("lon");
	const days = ctx.req.query("days") ?? "1";
	const units = ctx.req.query("units") ?? "metric";
	const ai = ctx.req.query("ai") ?? "false";
	if (!lat || !lon) throw new BadRequestError("lat and lon are required");
	const cacheKey = `weather:${lat}:${lon}:${days}:${units}`;
	const cached = await defaultCacheDriver.get(cacheKey);
	if (cached) return ctx.json(response({
		data: cached,
		extra: { fromCache: true }
	}));
	const data = await weatherAIClient.getWeather({
		lat: parseFloat(lat),
		lon: parseFloat(lon),
		days: parseInt(days),
		units,
		ai: ai === "true"
	});
	await defaultCacheDriver.set(cacheKey, data, 600);
	return ctx.json(response({
		data,
		extra: { fromCache: false }
	}));
});
weatherRoutes.get("geo", apiRouteDoc({
	tag: "Weather",
	parameters: [
		openApiQueryParam("string", "ip", "IP Address"),
		openApiQueryParam("number", "days", "Days to forecast. Default is 1", [
			"1",
			"7",
			"14",
			"30"
		]),
		openApiQueryParam("string", "ai", "AI Mode. Default is false", ["true", "false"])
	]
}), async (ctx) => {
	const ip = ctx.req.query("ip");
	const days = ctx.req.query("days") ?? "1";
	const ai = ctx.req.query("ai") ?? "false";
	if (!ip) throw new BadRequestError("ip is required");
	const cacheKey = `weather-geo:${ip}:${days}:${ai}`;
	const cached = await defaultCacheDriver.get(cacheKey);
	if (cached) return ctx.json(response({
		data: cached,
		extra: { fromCache: true }
	}));
	const data = await weatherAIClient.getWeatherByGeo({
		ip,
		days: parseInt(days),
		ai: ai === "true"
	});
	await defaultCacheDriver.set(cacheKey, data, 600);
	return ctx.json(response({
		data,
		extra: { fromCache: false }
	}));
});
//#endregion
//#region src/apis/apis.index.ts
var apisEntrypoint = new Hono().basePath("apis");
/**
* --------------------------------------------------------
* Middleware
* --------------------------------------------------------
*/
apisEntrypoint.use(logger());
apisEntrypoint.use(cors(honoConf.corsConfig));
apisEntrypoint.use(secureHeaders(honoConf.secureHeadersConfig));
apisEntrypoint.use(compress({ encoding: "gzip" }));
apisEntrypoint.use(rateLimiter(honoConf.rateLimiterConfig));
/**
* --------------------------------------------------------
* Api End Points
* --------------------------------------------------------
*/
apisEntrypoint.get("/", apiRouteDoc({ tag: "Api" }), async (ctx) => {
	const { getRuntimeKey } = await import("./_libs/hono.mjs").then((n) => n.t);
	return ctx.json({
		message: "Hello World",
		runtime: getRuntimeKey()
	});
});
apisEntrypoint.route("/", weatherRoutes);
/**
* --------------------------------------------------------
* Error Handling
* --------------------------------------------------------
*/
apisEntrypoint.onError(errorHandler$1);
apisEntrypoint.notFound(() => {
	throw new HTTPException(404, { message: "Api Route not found" });
});
/**
* --------------------------------------------------------
* OpenAPI
* --------------------------------------------------------
*/
apisEntrypoint.get("/openapi", openAPIRouteHandler(apisEntrypoint, { documentation: { info: {
	title: "Api Docs",
	version: "1.0.0"
} } }));
apisEntrypoint.get("/docs", (ctx) => {
	return ctx.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="SwaggerUI" />
      <title>SwaggerUI</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin><\/script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/apis/openapi',
          dom_id: '#swagger-ui',
        });
      };
    <\/script>
    </body>
    </html>
  `);
});
console.log("Api Server booted at:", (/* @__PURE__ */ new Date()).toLocaleTimeString());
/**
* --------------------------------------------------------
* Start Server
* --------------------------------------------------------
*/
var apis_index_default = { fetch: apisEntrypoint.fetch };
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var multiHandler = (...handlers) => {
	const final = handlers.pop();
	const middleware = handlers.filter(Boolean).map((h) => toMiddleware(h));
	return (ev) => callMiddleware(ev, middleware, final);
};
var _lazy_5XvB2l = defineLazyEventHandler(() => import("./_chunks/renderer-template.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const $0 = {
		route: "/**",
		handler: multiHandler(toEventHandler(apis_index_default), _lazy_5XvB2l)
	};
	return (m, p) => {
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		s.length;
		return {
			data: $0,
			params: { "_": s.slice(1).join("/") }
		};
	};
})();
[].filter(Boolean);
//#endregion
//#region node_modules/.deno/nitro@3.0.260603-beta/node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/.deno/nitro@3.0.260603-beta/node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/.deno/nitro@3.0.260603-beta/node_modules/nitro/dist/presets/netlify/runtime/netlify.mjs
var nitroApp = useNitroApp();
var ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
var handler = async (req) => {
	req.runtime ??= { name: "netlify" };
	req.ip ??= req.headers.get("x-nf-client-connection-ip") || void 0;
	const response = await nitroApp.fetch(req);
	const isr = (req.context?.routeRules || {})?.isr?.options;
	if (isr) {
		const maxAge = typeof isr === "number" ? isr : ONE_YEAR_IN_SECONDS;
		const revalidateDirective = typeof isr === "number" ? `stale-while-revalidate=${ONE_YEAR_IN_SECONDS}` : "must-revalidate";
		if (!response.headers.has("Cache-Control")) response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
		response.headers.set("Netlify-CDN-Cache-Control", `public, max-age=${maxAge}, ${revalidateDirective}, durable`);
	}
	return response;
};
//#endregion
export { handler as default };
