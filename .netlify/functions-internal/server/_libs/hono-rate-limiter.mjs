//#region node_modules/.deno/hono-rate-limiter@0.5.3/node_modules/hono-rate-limiter/dist/index.js
var getResetSeconds = (resetTime, windowMs) => {
	let resetSeconds;
	if (resetTime) {
		const deltaSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1e3);
		resetSeconds = Math.max(0, deltaSeconds);
	} else if (windowMs) resetSeconds = Math.ceil(windowMs / 1e3);
	return resetSeconds;
};
var setDraft6Headers = (context, info, windowMs) => {
	if (context.finalized) return;
	const windowSeconds = Math.ceil(windowMs / 1e3);
	const resetSeconds = getResetSeconds(info.resetTime);
	context.header("RateLimit-Policy", `${info.limit};w=${windowSeconds}`);
	context.header("RateLimit-Limit", info.limit.toString());
	context.header("RateLimit-Remaining", info.remaining.toString());
	if (resetSeconds) context.header("RateLimit-Reset", resetSeconds.toString());
};
var setDraft7Headers = (context, info, windowMs) => {
	if (context.finalized) return;
	const windowSeconds = Math.ceil(windowMs / 1e3);
	const resetSeconds = getResetSeconds(info.resetTime, windowMs);
	context.header("RateLimit-Policy", `${info.limit};w=${windowSeconds}`);
	context.header("RateLimit", `limit=${info.limit}, remaining=${info.remaining}, reset=${resetSeconds}`);
};
var setRetryAfterHeader = (context, info, windowMs) => {
	if (context.finalized) return;
	const resetSeconds = getResetSeconds(info.resetTime, windowMs);
	context.header("Retry-After", resetSeconds?.toString());
};
var MemoryStore = class {
	constructor() {
		/**
		* These two maps store usage (requests) and reset time by key (for example, IP
		* addresses or API keys).
		*
		* They are split into two to avoid having to iterate through the entire set to
		* determine which ones need reset. Instead, `Client`s are moved from `previous`
		* to `current` as they hit the endpoint. Once `windowMs` has elapsed, all clients
		* left in `previous`, i.e., those that have not made any recent requests, are
		* known to be expired and can be deleted in bulk.
		*/
		this.previous = /* @__PURE__ */ new Map();
		this.current = /* @__PURE__ */ new Map();
	}
	/**
	* The duration of time before which all hit counts are reset (in milliseconds).
	*/
	#windowMs;
	/**
	* Method that initializes the store.
	*
	* @param options {HonoConfigType | WSConfigType} - The options used to setup the middleware.
	*/
	init(options) {
		this.#windowMs = options.windowMs;
		if (this.interval) clearInterval(this.interval);
		this.interval = setInterval(() => {
			this.clearExpired();
		}, this.#windowMs);
		if (this.interval.unref) this.interval.unref();
	}
	/**
	* Method to fetch a client's hit count and reset time.
	*
	* @param key {string} - The identifier for a client.
	*
	* @returns {ClientRateLimitInfo | undefined} - The number of hits and reset time for that client.
	*
	* @public
	*/
	get(key) {
		return this.current.get(key) ?? this.previous.get(key);
	}
	/**
	* Method to increment a client's hit counter.
	*
	* @param key {string} - The identifier for a client.
	*
	* @returns {ClientRateLimitInfo} - The number of hits and reset time for that client.
	*
	* @public
	*/
	increment(key) {
		const client = this.getClient(key);
		const now = Date.now();
		if (client.resetTime.getTime() <= now) this.resetClient(client, now);
		client.totalHits++;
		return client;
	}
	/**
	* Method to decrement a client's hit counter.
	*
	* @param key {string} - The identifier for a client.
	*
	* @public
	*/
	decrement(key) {
		const client = this.getClient(key);
		if (client.totalHits > 0) client.totalHits--;
	}
	/**
	* Method to reset a client's hit counter.
	*
	* @param key {string} - The identifier for a client.
	*
	* @public
	*/
	resetKey(key) {
		this.current.delete(key);
		this.previous.delete(key);
	}
	/**
	* Method to reset everyone's hit counter.
	*
	* @public
	*/
	resetAll() {
		this.current.clear();
		this.previous.clear();
	}
	/**
	* Method to stop the timer (if currently running) and prevent any memory
	* leaks.
	*
	* @public
	*/
	shutdown() {
		clearInterval(this.interval);
		this.resetAll();
	}
	/**
	* Recycles a client by setting its hit count to zero, and reset time to
	* `windowMs` milliseconds from now.
	*
	* NOT to be confused with `#resetKey()`, which removes a client from both the
	* `current` and `previous` maps.
	*
	* @param client {Client} - The client to recycle.
	* @param now {number} - The current time, to which the `windowMs` is added to get the `resetTime` for the client.
	*
	* @return {Client} - The modified client that was passed in, to allow for chaining.
	*/
	resetClient(client, now = Date.now()) {
		client.totalHits = 0;
		client.resetTime.setTime(now + this.#windowMs);
		return client;
	}
	/**
	* Retrieves or creates a client, given a key. Also ensures that the client being
	* returned is in the `current` map.
	*
	* @param key {string} - The key under which the client is (or is to be) stored.
	*
	* @returns {Client} - The requested client.
	*/
	getClient(key) {
		const currentKey = this.current.get(key);
		if (currentKey) return currentKey;
		let client;
		const previousKey = this.previous.get(key);
		if (previousKey) {
			client = previousKey;
			this.previous.delete(key);
		} else {
			client = {
				totalHits: 0,
				resetTime: /* @__PURE__ */ new Date()
			};
			this.resetClient(client);
		}
		this.current.set(key, client);
		return client;
	}
	/**
	* Move current clients to previous, create a new map for current.
	*
	* This function is called every `windowMs`.
	*/
	clearExpired() {
		this.previous = this.current;
		this.current = /* @__PURE__ */ new Map();
	}
};
var isValidStore = (value) => !!value?.increment;
function initStore(store, options) {
	if (!isValidStore(store)) throw new Error("The store is not correctly implemented!");
	if (typeof store.init === "function") store.init(options);
}
function rateLimiter(config) {
	if ("binding" in config && config.binding !== void 0) return cloudflareRateLimiter(config);
	return honoRateLimiter(config);
}
function honoRateLimiter(config) {
	const { windowMs = 6e4, limit = 5, message = "Too many requests, please try again later.", statusCode = 429, standardHeaders = "draft-6", requestPropertyName = "rateLimit", requestStorePropertyName = "rateLimitStore", skipFailedRequests = false, skipSuccessfulRequests = false, keyGenerator, skip = () => false, requestWasSuccessful = (c) => c.res.status < 400, handler = async (c, _, options2) => {
		c.status(options2.statusCode);
		const responseMessage = typeof options2.message === "function" ? await options2.message(c) : options2.message;
		if (typeof responseMessage === "string") return c.text(responseMessage);
		return c.json(responseMessage);
	}, store = new MemoryStore() } = config;
	const options = {
		windowMs,
		limit,
		message,
		statusCode,
		standardHeaders,
		requestPropertyName,
		requestStorePropertyName,
		skipFailedRequests,
		skipSuccessfulRequests,
		keyGenerator,
		skip,
		requestWasSuccessful,
		handler,
		store
	};
	initStore(store, options);
	return async (c, next) => {
		if (await skip(c)) {
			await next();
			return;
		}
		const key = await keyGenerator(c);
		const { totalHits, resetTime } = await store.increment(key);
		const _limit = await (typeof limit === "function" ? limit(c) : limit);
		const info = {
			limit: _limit,
			used: totalHits,
			remaining: Math.max(_limit - totalHits, 0),
			resetTime
		};
		c.set(requestPropertyName, info);
		c.set(requestStorePropertyName, {
			getKey: store.get?.bind(store),
			resetKey: store.resetKey.bind(store)
		});
		if (standardHeaders && !c.finalized) if (standardHeaders === "draft-7") setDraft7Headers(c, info, windowMs);
		else setDraft6Headers(c, info, windowMs);
		let decremented = false;
		const decrementKey = async () => {
			if (!decremented) {
				await store.decrement(key);
				decremented = true;
			}
		};
		const shouldSkipRequest = async () => {
			if (skipFailedRequests || skipSuccessfulRequests) {
				const wasRequestSuccessful = await requestWasSuccessful(c);
				if (skipFailedRequests && !wasRequestSuccessful || skipSuccessfulRequests && wasRequestSuccessful) await decrementKey();
			}
		};
		if (totalHits > _limit) {
			if (standardHeaders) setRetryAfterHeader(c, info, windowMs);
			await shouldSkipRequest();
			return handler(c, next, options);
		}
		try {
			await next();
			await shouldSkipRequest();
		} catch (error) {
			if (skipFailedRequests) await decrementKey();
			throw error;
		}
	};
}
function cloudflareRateLimiter(config) {
	const { message = "Too many requests, please try again later.", statusCode = 429, binding: bindingProp, keyGenerator, skip = () => false, handler = async (c, _, options) => {
		c.status(options.statusCode);
		const responseMessage = typeof options.message === "function" ? await options.message(c) : options.message;
		if (typeof responseMessage === "string") return c.text(responseMessage);
		return c.json(responseMessage);
	} } = config;
	return async (c, next) => {
		let rateLimitBinding = bindingProp;
		if (typeof rateLimitBinding === "function") rateLimitBinding = rateLimitBinding(c);
		const options = {
			message,
			statusCode,
			binding: rateLimitBinding,
			keyGenerator,
			skip,
			handler
		};
		if (await skip(c)) {
			await next();
			return;
		}
		const key = await keyGenerator(c);
		const { success } = await rateLimitBinding.limit({ key });
		if (!success) return handler(c, next, options);
		await next();
	};
}
`
      local totalHits = redis.call("INCR", KEYS[1])
      local timeToExpire = redis.call("PTTL", KEYS[1])
      if timeToExpire <= 0 or ARGV[1] == "1"
      then
        redis.call("PEXPIRE", KEYS[1], tonumber(ARGV[2]))
        timeToExpire = tonumber(ARGV[2])
      end

      return { totalHits, timeToExpire }
		`.replaceAll(/^\s+/gm, "").trim(), `
      local totalHits = redis.call("GET", KEYS[1])
      local timeToExpire = redis.call("PTTL", KEYS[1])

      return { totalHits, timeToExpire }
		`.replaceAll(/^\s+/gm, "").trim();
//#endregion
export { rateLimiter as t };
