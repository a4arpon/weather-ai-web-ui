import { r as __exportAll } from "../../_runtime.mjs";
//#region node_modules/.deno/quansync@0.2.11/node_modules/quansync/dist/index.mjs
var GET_IS_ASYNC = Symbol.for("quansync.getIsAsync");
var QuansyncError = class extends Error {
	constructor(message = "Unexpected promise in sync context") {
		super(message);
		this.name = "QuansyncError";
	}
};
function isThenable(value) {
	return value && typeof value === "object" && typeof value.then === "function";
}
function isQuansyncGenerator(value) {
	return value && typeof value === "object" && typeof value[Symbol.iterator] === "function" && "__quansync" in value;
}
function fromObject(options) {
	const generator = function* (...args) {
		if (yield GET_IS_ASYNC) return yield options.async.apply(this, args);
		return options.sync.apply(this, args);
	};
	function fn(...args) {
		const iter = generator.apply(this, args);
		iter.then = (...thenArgs) => options.async.apply(this, args).then(...thenArgs);
		iter.__quansync = true;
		return iter;
	}
	fn.sync = options.sync;
	fn.async = options.async;
	return fn;
}
function fromPromise(promise) {
	return fromObject({
		async: () => Promise.resolve(promise),
		sync: () => {
			if (isThenable(promise)) throw new QuansyncError();
			return promise;
		}
	});
}
function unwrapYield(value, isAsync) {
	if (value === GET_IS_ASYNC) return isAsync;
	if (isQuansyncGenerator(value)) return isAsync ? iterateAsync(value) : iterateSync(value);
	if (!isAsync && isThenable(value)) throw new QuansyncError();
	return value;
}
var DEFAULT_ON_YIELD = (value) => value;
function iterateSync(generator, onYield = DEFAULT_ON_YIELD) {
	let current = generator.next();
	while (!current.done) try {
		current = generator.next(unwrapYield(onYield(current.value, false)));
	} catch (err) {
		current = generator.throw(err);
	}
	return unwrapYield(current.value);
}
async function iterateAsync(generator, onYield = DEFAULT_ON_YIELD) {
	let current = generator.next();
	while (!current.done) try {
		current = generator.next(await unwrapYield(onYield(current.value, true), true));
	} catch (err) {
		current = generator.throw(err);
	}
	return current.value;
}
function fromGeneratorFn(generatorFn, options) {
	return fromObject({
		name: generatorFn.name,
		async(...args) {
			return iterateAsync(generatorFn.apply(this, args), options?.onYield);
		},
		sync(...args) {
			return iterateSync(generatorFn.apply(this, args), options?.onYield);
		}
	});
}
function quansync(input, options) {
	if (isThenable(input)) return fromPromise(input);
	if (typeof input === "function") return fromGeneratorFn(input, options);
	else return fromObject(input);
}
quansync({
	async: () => Promise.resolve(true),
	sync: () => false
});
//#endregion
//#region node_modules/.deno/@standard-community+standard-json@0.3.5/node_modules/@standard-community/standard-json/dist/index-CLddUTqr.js
var validationMapper = /* @__PURE__ */ new Map();
var UnsupportedVendorError = class extends Error {
	constructor(vendor) {
		super(`standard-json: Unsupported schema vendor "${vendor}".`);
	}
};
var MissingDependencyError = class extends Error {
	constructor(packageName) {
		super(`standard-json: Missing dependencies "${packageName}".`);
	}
};
var getToJsonSchemaFn$6 = async (vendor) => {
	const cached = validationMapper.get(vendor);
	if (cached) return cached;
	let vendorFnPromise;
	switch (vendor) {
		case "arktype":
			vendorFnPromise = (await Promise.resolve().then(() => arktype_aI7TBD0R_exports)).default();
			break;
		case "effect":
			vendorFnPromise = (await Promise.resolve().then(() => effect_QlVUlMFu_exports)).default();
			break;
		case "sury":
			vendorFnPromise = (await Promise.resolve().then(() => sury_CWZTCd75_exports)).default();
			break;
		case "typebox":
			vendorFnPromise = (await Promise.resolve().then(() => typebox_Dei93FPO_exports)).default();
			break;
		case "valibot":
			vendorFnPromise = (await Promise.resolve().then(() => valibot__1zFm7rT_exports)).default();
			break;
		case "zod":
			vendorFnPromise = (await Promise.resolve().then(() => zod_Bwrt9trS_exports)).default();
			break;
		default: throw new UnsupportedVendorError(vendor);
	}
	const vendorFn = await vendorFnPromise;
	validationMapper.set(vendor, vendorFn);
	return vendorFn;
};
quansync({
	sync: (schema, options) => {
		const vendor = schema["~standard"].vendor;
		const fn = validationMapper.get(vendor);
		if (!fn) throw new UnsupportedVendorError(vendor);
		return fn(schema, options);
	},
	async: async (schema, options) => {
		return (await getToJsonSchemaFn$6(schema["~standard"].vendor))(schema, options);
	}
});
//#endregion
//#region node_modules/.deno/@standard-community+standard-json@0.3.5/node_modules/@standard-community/standard-json/dist/arktype-aI7TBD0R.js
var arktype_aI7TBD0R_exports = /* @__PURE__ */ __exportAll({ default: () => getToJsonSchemaFn$5 });
function getToJsonSchemaFn$5() {
	return (schema, options) => schema.toJsonSchema(options);
}
//#endregion
//#region node_modules/.deno/@standard-community+standard-json@0.3.5/node_modules/@standard-community/standard-json/dist/effect-QlVUlMFu.js
var effect_QlVUlMFu_exports = /* @__PURE__ */ __exportAll({ default: () => getToJsonSchemaFn$4 });
async function getToJsonSchemaFn$4() {
	try {
		const { JSONSchema } = await import("../../_chunks/standard-json2.mjs");
		return (schema) => JSONSchema.make(schema);
	} catch {
		throw new MissingDependencyError("effect");
	}
}
//#endregion
//#region node_modules/.deno/@standard-community+standard-json@0.3.5/node_modules/@standard-community/standard-json/dist/sury-CWZTCd75.js
var sury_CWZTCd75_exports = /* @__PURE__ */ __exportAll({ default: () => getToJsonSchemaFn$3 });
async function getToJsonSchemaFn$3() {
	try {
		const { toJSONSchema } = await import("../../_chunks/standard-json3.mjs");
		return toJSONSchema;
	} catch {
		throw new MissingDependencyError("sury");
	}
}
//#endregion
//#region node_modules/.deno/@standard-community+standard-json@0.3.5/node_modules/@standard-community/standard-json/dist/typebox-Dei93FPO.js
var typebox_Dei93FPO_exports = /* @__PURE__ */ __exportAll({ default: () => getToJsonSchemaFn$2 });
function getToJsonSchemaFn$2() {
	return (schema) => JSON.parse(JSON.stringify(schema.Type()));
}
//#endregion
//#region node_modules/.deno/@standard-community+standard-json@0.3.5/node_modules/@standard-community/standard-json/dist/valibot--1zFm7rT.js
var valibot__1zFm7rT_exports = /* @__PURE__ */ __exportAll({ default: () => getToJsonSchemaFn$1 });
async function getToJsonSchemaFn$1() {
	try {
		const { toJsonSchema } = await import("../../_chunks/standard-json.mjs");
		return toJsonSchema;
	} catch {
		throw new MissingDependencyError("@valibot/to-json-schema");
	}
}
//#endregion
//#region node_modules/.deno/@standard-community+standard-json@0.3.5/node_modules/@standard-community/standard-json/dist/zod-Bwrt9trS.js
var zod_Bwrt9trS_exports = /* @__PURE__ */ __exportAll({ default: () => getToJsonSchemaFn });
var zodv4Error = new MissingDependencyError("zod v4");
async function getToJsonSchemaFn() {
	return async (schema, options) => {
		let handler;
		if ("_zod" in schema) try {
			handler = (await import("../zod.mjs").then((n) => n.t)).toJSONSchema;
		} catch {
			throw zodv4Error;
		}
		else try {
			handler = (await import("../zod-to-json-schema.mjs").then((n) => n.t)).zodToJsonSchema;
		} catch {
			throw new MissingDependencyError("zod-to-json-schema");
		}
		return handler(schema, options);
	};
}
//#endregion
export {};
