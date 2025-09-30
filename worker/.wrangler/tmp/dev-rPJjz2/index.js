var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = Symbol();

// node_modules/hono/dist/utils/body.js
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match[1], new RegExp(`^${match[2]}(?=/${next})`)] : [label, match[1], new RegExp(`^${match[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder(match);
      } catch {
        return match;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = /* @__PURE__ */ __name(class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
}, "Context");

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "Hono");

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "Node");

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// node_modules/hono/dist/router/reg-exp-router/router.js
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.#buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  #buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}, "RegExpRouter");

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = /* @__PURE__ */ __name(class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "Node");

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// node_modules/hono/dist/middleware/cors/index.js
var cors = /* @__PURE__ */ __name((options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.origin !== "*") {
      const existingVary = c.req.header("Vary");
      if (existingVary) {
        set("Vary", existingVary);
      } else {
        set("Vary", "Origin");
      }
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
  }, "cors2");
}, "cors");

// src/index.ts
var app = new Hono2();
app.use("*", cors({
  origin: ["http://localhost:3000", "http://localhost:8081", "https://camadepilates.com"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex, "sha256Hex");
function randToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(randToken, "randToken");
function getCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.split(";").map((s) => s.trim()).find((s) => s.startsWith(name + "="))?.split("=")[1];
}
__name(getCookie, "getCookie");
function setCookie(name, value, url, maxAgeSec, isLocalhost) {
  const attrs = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax"
  ];
  if (maxAgeSec)
    attrs.push(`Max-Age=${maxAgeSec}`);
  if (url.protocol === "https:" && !isLocalhost)
    attrs.push("Secure");
  return attrs.join("; ");
}
__name(setCookie, "setCookie");
async function ensureSchema(env) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      pass_hash TEXT NOT NULL,
      salt TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS blog_images (
      slug TEXT PRIMARY KEY,
      hero_url TEXT,
      sections_json TEXT,
      updated_at INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS blog_suggestions (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT,
      keywords_json TEXT,
      source TEXT,
      status TEXT NOT NULL,
      created_at INTEGER
    )`
  ];
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}
__name(ensureSchema, "ensureSchema");
async function importAesKeyFromEnv(env) {
  const encKey = env.CONFIG_ENC_KEY;
  if (!encKey)
    return null;
  const bytes = new TextEncoder().encode(encKey);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}
__name(importAesKeyFromEnv, "importAesKeyFromEnv");
async function encryptJsonWithEnv(env, obj) {
  const key = await importAesKeyFromEnv(env);
  if (!key)
    return null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
  const all = new Uint8Array(iv.length + ct.byteLength);
  all.set(iv, 0);
  all.set(new Uint8Array(ct), iv.length);
  return btoa(String.fromCharCode(...all));
}
__name(encryptJsonWithEnv, "encryptJsonWithEnv");
async function decryptJsonWithEnv(env, b64) {
  try {
    const key = await importAesKeyFromEnv(env);
    if (!key)
      return null;
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const iv = bin.slice(0, 12);
    const ct = bin.slice(12);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return JSON.parse(new TextDecoder().decode(new Uint8Array(pt)));
  } catch {
    return null;
  }
}
__name(decryptJsonWithEnv, "decryptJsonWithEnv");
async function seedIfEmpty(env) {
  const { results } = await env.DB.prepare("SELECT COUNT(*) as n FROM users").all();
  const n = results?.[0]?.n || 0;
  if (n === 0) {
    const salt = "04d50a51b292e28ad3c16c774a0c80fa";
    const pass_hash = "6c5e217b8d7a837de1868736ad3f5e000153853639126c9346f2222378ecfa0e";
    await env.DB.prepare("INSERT INTO users (username, pass_hash, salt) VALUES (?, ?, ?)").bind("tim.ottowitz@gmail.com", pass_hash, salt).run();
  }
}
__name(seedIfEmpty, "seedIfEmpty");
async function ghGetFile(env, path) {
  const repo = env.GITHUB_REPO;
  const token = env.GITHUB_TOKEN;
  const branch = env.GITHUB_BRANCH || "main";
  if (!repo || !token)
    return null;
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
  const resp = await fetch(url, { headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json", "User-Agent": "CAMA-Pilates-API" } });
  if (!resp.ok)
    return null;
  const j = await resp.json();
  const content = j.content ? atob(j.content.replace(/\n/g, "")) : "";
  return { sha: j.sha, content };
}
__name(ghGetFile, "ghGetFile");
async function ghPutFile(env, path, content, message, sha) {
  const repo = env.GITHUB_REPO;
  const token = env.GITHUB_TOKEN;
  const branch = env.GITHUB_BRANCH || "main";
  if (!repo || !token)
    throw new Error("GitHub not configured");
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`;
  const body = { message, content: btoa(unescape(encodeURIComponent(content))), branch, sha };
  const resp = await fetch(url, { method: "PUT", headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json", "User-Agent": "CAMA-Pilates-API" }, body: JSON.stringify(body) });
  if (!resp.ok)
    throw new Error(`GitHub PUT failed: ${await resp.text()}`);
}
__name(ghPutFile, "ghPutFile");
app.get("/api/admin/health", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT COUNT(*) as n FROM users").all();
    const n = results?.[0]?.n || 0;
    return c.json({ db: true, users: Number(n) });
  } catch (error) {
    return c.json({ db: false, users: 0, error: error.message }, 500);
  }
});
app.post("/api/admin/login", async (c) => {
  const url = new URL(c.req.url);
  const { username, password, captcha_token } = await c.req.json().catch(() => ({}));
  if (!username || !password) {
    return c.json({ error: "username and password required" }, 400);
  }
  await seedIfEmpty(c.env);
  const row = await c.env.DB.prepare("SELECT id, username, pass_hash, salt FROM users WHERE username = ?").bind(username).first();
  if (!row) {
    console.log("User not found:", username);
    return c.json({ error: "Invalid credentials" }, 401);
  }
  const hash = await sha256Hex(`${row.salt}:${password}`);
  console.log("Login attempt:", { username, providedHash: hash, storedHash: row.pass_hash, match: hash === row.pass_hash });
  if (hash !== row.pass_hash) {
    return c.json({ error: "Invalid credentials" }, 401);
  }
  const token = randToken();
  const ttl = 60 * 60 * 24;
  const expires = Math.floor(Date.now() / 1e3) + ttl;
  await c.env.DB.prepare("INSERT INTO sessions (token, user_id, expires) VALUES (?, ?, ?)").bind(token, row.id, expires).run();
  const isDevelopment = url.hostname === "localhost" || url.hostname === "127.0.0.1" || c.env.ENVIRONMENT === "development";
  const cookieValue = setCookie("admint", token, url, ttl, isDevelopment);
  return c.json({ success: true, user: row.username }, 200, {
    "Set-Cookie": cookieValue
  });
});
app.get("/api/admin/session", async (c) => {
  const token = getCookie(c.req.raw, "admint");
  if (!token) {
    return c.json({ authenticated: false }, 401);
  }
  const row = await c.env.DB.prepare("SELECT s.token, s.expires, u.username FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?").bind(token).first();
  const now = Math.floor(Date.now() / 1e3);
  if (!row || row.expires < now) {
    return c.json({ authenticated: false }, 401);
  }
  return c.json({ authenticated: true, user: row.username });
});
app.post("/api/admin/logout", async (c) => {
  const url = new URL(c.req.url);
  const token = getCookie(c.req.raw, "admint");
  if (token) {
    await ensureSchema(c.env).catch(() => {
    });
    await c.env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run().catch(() => {
    });
  }
  const isDevelopment = url.hostname === "localhost" || url.hostname === "127.0.0.1" || c.env.ENVIRONMENT === "development";
  const cookieValue = setCookie("admint", "deleted", url, 1, isDevelopment);
  return c.json({ success: true }, 200, {
    "Set-Cookie": cookieValue
  });
});
app.get("/api/admin/captcha", async (c) => {
  return c.json({ siteKey: null });
});
app.get("/api/admin/users", async (c) => {
  await ensureSchema(c.env);
  const { results } = await c.env.DB.prepare("SELECT username FROM users ORDER BY username ASC").all();
  const users = (results || []).map((r) => r.username);
  return c.json({ users });
});
app.post("/api/admin/users", async (c) => {
  await ensureSchema(c.env);
  const { username, password } = await c.req.json().catch(() => ({}));
  if (!username || !password || String(password).length < 8)
    return c.json({ error: "username and password (min 8 chars) required" }, 400);
  const salt = randToken();
  const pass_hash = await sha256Hex(`${salt}:${password}`);
  try {
    await c.env.DB.prepare("INSERT INTO users (username, pass_hash, salt) VALUES (?1,?2,?3)").bind(String(username), pass_hash, salt).run();
  } catch (e) {
    return c.json({ error: "could_not_create" }, 400);
  }
  return c.json({ success: true });
});
app.delete("/api/admin/users/:username", async (c) => {
  await ensureSchema(c.env);
  const username = c.req.param("username");
  if (!username)
    return c.json({ error: "username required" }, 400);
  await c.env.DB.prepare("DELETE FROM users WHERE username = ?1").bind(username).run();
  return c.json({ success: true });
});
app.get("/api/admin/sessions", async (c) => {
  await ensureSchema(c.env);
  const { results } = await c.env.DB.prepare("SELECT s.token, s.expires, u.username FROM sessions s JOIN users u ON u.id = s.user_id ORDER BY s.expires DESC").all();
  const items = (results || []).map((r) => ({ token: r.token, tokenShort: String(r.token).slice(0, 8), username: r.username, expires: Number(r.expires) }));
  return c.json({ items });
});
app.post("/api/admin/sessions/revoke", async (c) => {
  await ensureSchema(c.env);
  const { token } = await c.req.json().catch(() => ({}));
  if (!token)
    return c.json({ error: "token required" }, 400);
  await c.env.DB.prepare("DELETE FROM sessions WHERE token = ?1").bind(String(token)).run();
  return c.json({ success: true });
});
app.post("/api/admin/password", async (c) => {
  await ensureSchema(c.env);
  const cookieHeader = c.req.header("Cookie") || "";
  const token = cookieHeader.split(";").map((s) => s.trim()).find((s) => s.startsWith("admint="))?.split("=")[1];
  if (!token)
    return c.json({ error: "unauthorized" }, 401);
  const row = await c.env.DB.prepare("SELECT u.id, u.username, u.pass_hash, u.salt FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?1").bind(token).first();
  if (!row)
    return c.json({ error: "unauthorized" }, 401);
  const body = await c.req.json().catch(() => ({}));
  const cur = String(body?.current_password || "");
  const next = String(body?.new_password || "");
  if (next.length < 8)
    return c.json({ error: "new password too short" }, 400);
  const curHash = await sha256Hex(`${row.salt}:${cur}`);
  if (curHash !== row.pass_hash)
    return c.json({ error: "invalid current password" }, 403);
  const newSalt = randToken();
  const newHash = await sha256Hex(`${newSalt}:${next}`);
  await c.env.DB.prepare("UPDATE users SET pass_hash=?1, salt=?2 WHERE id=?3").bind(newHash, newSalt, row.id).run();
  return c.json({ success: true });
});
app.get("/api/auth/google/status", async (c) => {
  return c.json({ connected: false });
});
app.post("/api/admin/init", async (c) => {
  const { username, password } = await c.req.json().catch(() => ({}));
  if (!username || !password) {
    return c.json({ error: "username and password required" }, 400);
  }
  const { results } = await c.env.DB.prepare("SELECT COUNT(*) as n FROM users").all();
  const n = results?.[0]?.n || 0;
  if (n > 0) {
    return c.json({ error: "Already initialized" }, 409);
  }
  const salt = randToken();
  const pass_hash = await sha256Hex(`${salt}:${password}`);
  await c.env.DB.prepare("INSERT INTO users (username, pass_hash, salt) VALUES (?, ?, ?)").bind(username, pass_hash, salt).run();
  return c.json({ success: true });
});
app.get("/api/settings/vertex", async (c) => {
  await ensureSchema(c.env);
  try {
    const row = await c.env.DB.prepare("SELECT value FROM app_settings WHERE key = ?").bind("vertex_config").first();
    if (!row?.value)
      return c.json({ configured: false });
    const cfg = await decryptJsonWithEnv(c.env, row.value);
    if (!cfg)
      return c.json({ configured: false, error: "Decryption failed or missing CONFIG_ENC_KEY" });
    return c.json({ configured: true, ...cfg, hasPrivateKey: Boolean(cfg.serviceAccountPrivateKey) });
  } catch (e) {
    return c.json({ configured: false, error: e?.message || String(e) }, 500);
  }
});
app.post("/api/settings/vertex", async (c) => {
  await ensureSchema(c.env);
  const body = await c.req.json().catch(() => ({}));
  const cfg = {
    projectId: String(body.projectId || ""),
    location: String(body.location || "us-central1"),
    model: String(body.model || "imagegeneration@006"),
    serviceAccountEmail: body.serviceAccountEmail ? String(body.serviceAccountEmail) : void 0,
    serviceAccountPrivateKey: body.serviceAccountPrivateKey ? String(body.serviceAccountPrivateKey) : void 0,
    oauthClientId: body.oauthClientId ? String(body.oauthClientId) : void 0,
    oauthClientSecret: body.oauthClientSecret ? String(body.oauthClientSecret) : void 0
  };
  if (!cfg.projectId)
    return c.json({ error: "projectId required" }, 400);
  const enc = await encryptJsonWithEnv(c.env, cfg);
  if (!enc)
    return c.json({ error: "CONFIG_ENC_KEY not set" }, 400);
  const ts = Math.floor(Date.now() / 1e3);
  await c.env.DB.prepare("INSERT INTO app_settings (key, value, updated_at) VALUES (?1,?2,?3) ON CONFLICT(key) DO UPDATE SET value=?2, updated_at=?3").bind("vertex_config", enc, ts).run();
  return c.json({ success: true });
});
app.get("/api/blog/status", async (c) => {
  const slug = c.req.query("slug");
  if (!slug)
    return c.json({ error: "slug parameter required" }, 400);
  try {
    const u = new URL(c.req.url);
    const origin = `${u.protocol}//${u.host}`;
    const head = await fetch(`${origin}/blog-planning/research/${encodeURIComponent(slug)}.md`, { method: "HEAD" });
    const researchExists = head.ok;
    if (researchExists)
      return c.json({ slug, researchExists, blogExists: false, qualityScore: null });
  } catch {
  }
  const { results } = await c.env.DB.prepare("SELECT * FROM blog_suggestions WHERE slug = ?").bind(slug).all();
  if (results && results.length > 0) {
    const s = results[0];
    return c.json({ slug: s.slug, status: s.status || "pending", title: s.title, category: s.category, created_at: s.created_at });
  }
  return c.json({ slug, status: "not_found", title: null, category: null, created_at: null });
});
app.get("/api/blog/suggestions", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM blog_suggestions ORDER BY created_at DESC LIMIT 50").all();
  return c.json({
    suggestions: results || [],
    items: results || []
  });
});
app.post("/api/blog/suggestions", async (c) => {
  const { title, slug, category, keywords, source } = await c.req.json().catch(() => ({}));
  if (!title || !slug) {
    return c.json({ error: "title and slug required" }, 400);
  }
  const now = Math.floor(Date.now() / 1e3);
  await c.env.DB.prepare("INSERT OR REPLACE INTO blog_suggestions (slug, title, category, keywords_json, source, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(slug, title, category, JSON.stringify(keywords || []), source || "manual", "pending", now).run();
  return c.json({ success: true, slug, status: "created" });
});
app.post("/api/blog/pipeline", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const action = String(body?.action || "").toLowerCase();
  const now = Math.floor(Date.now() / 1e3);
  const queued = [];
  await ensureSchema(c.env);
  if (action === "trigger" && body?.slug) {
    const slug = String(body.slug);
    const title = body.title || slug.replace(/-/g, " ");
    const category = body.category || "General";
    const keywords = Array.isArray(body.keywords) ? body.keywords : [];
    await c.env.DB.prepare("INSERT OR REPLACE INTO blog_suggestions (slug, title, category, keywords_json, source, status, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)").bind(slug, title, category, JSON.stringify(keywords), "admin_ui", "queued", now).run();
    queued.push(slug);
    try {
      if (c.env.GITHUB_REPO && c.env.GITHUB_TOKEN) {
        const researchPath = `blog-planning/research/${slug}.md`;
        const todoPath = `blog-planning/BLOG_TODO.md`;
        const existing = await ghGetFile(c.env, researchPath);
        if (!existing) {
          const content = `# RESEARCH: ${title}

**Status**: \u{1F52C} Research needed
**Priority**: High

## Objetivo
Reunir informaci\xF3n mexicana y de calidad para desarrollar un art\xEDculo completo sobre ${title.toLowerCase()}.

## Palabras clave y SEO
- Primaria: ${title.split(" ").slice(0, 2).join(" ")}

## Estructura sugerida
1) Resumen e intenci\xF3n de b\xFAsqueda
2) Beneficios y precauciones (contexto mexicano)
3) Desarrollo t\xE9cnico y ejercicios
4) Recomendaciones CAMA Pilates
5) FAQ pr\xE1ctica
`;
          await ghPutFile(c.env, researchPath, content, `chore(research): scaffold ${slug}`);
        }
        const todo = await ghGetFile(c.env, todoPath);
        if (todo) {
          const lines = todo.content.split("\n");
          const hdr = `## CATEGOR\xCDA: ${category}`;
          let idx = lines.findIndex((l) => l.startsWith("## CATEGOR\xCDA:") && l.includes(category));
          if (idx === -1) {
            lines.push("", hdr, "");
            idx = lines.length - 2;
          }
          const block = [
            `### \u{1F52C} ${title}`,
            `**Slug:** ${slug}`,
            `**Research File:** [${slug}](./research/${slug}.md)`,
            `**Keywords:** ${(keywords || []).join(", ")}`,
            ""
          ];
          let insertAt = idx + 1;
          for (let i = idx + 1; i < lines.length; i++) {
            if (lines[i].startsWith("## CATEGOR\xCDA:") || lines[i].trim() === "---") {
              insertAt = i;
              break;
            }
          }
          lines.splice(insertAt, 0, ...block);
          await ghPutFile(c.env, todoPath, lines.join("\n"), `chore(todo): add ${slug}`, todo.sha);
        }
      }
    } catch (e) {
      console.log("pipeline/github error", e.message);
    }
  } else if (action === "batch" && Array.isArray(body?.topics)) {
    for (const slugRaw of body.topics) {
      const slug = String(slugRaw);
      const title = slug.replace(/-/g, " ");
      await c.env.DB.prepare("INSERT OR REPLACE INTO blog_suggestions (slug, title, category, keywords_json, source, status, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)").bind(slug, title, "General", JSON.stringify([]), "admin_ui", "queued", now).run();
      queued.push(slug);
    }
  } else {
    return c.json({ error: "invalid_request" }, 400);
  }
  return c.json({ success: true, queued, message: `Queued ${queued.length} topic(s)` });
});
app.post("/api/blog/topics/find", async (c) => {
  await ensureSchema(c.env);
  const { prompt, limit = 10, queries } = await c.req.json().catch(() => ({}));
  const seeds = Array.isArray(queries) && queries.length ? queries : ["pilates reformer", "cama de pilates", "reformer pilates", "pilates mexico", "pilates casa", "precio reformer"];
  const subs = ["pilates", "fitness", "flexibility", "physicaltherapy"];
  const pool = [];
  for (const s of subs) {
    for (const q of seeds) {
      const u = new URL(`https://www.reddit.com/r/${s}/search.json`);
      u.searchParams.set("q", q);
      u.searchParams.set("restrict_sr", "1");
      u.searchParams.set("sort", "top");
      u.searchParams.set("t", "year");
      try {
        const resp = await fetch(u.toString(), { headers: { "user-agent": "CAMA-Pilates-TopicFinder/1.0" } });
        if (!resp.ok)
          continue;
        const j = await resp.json();
        (j?.data?.children || []).forEach((child) => {
          const d = child?.data;
          const title = String(d?.title || "").trim();
          if (!title || !/pilates|reformer|cama/i.test(title))
            return;
          pool.push({
            title,
            url: `https://reddit.com${d?.permalink || ""}`.replace(/\/$/, ""),
            score: Number(d?.score || 0),
            num_comments: Number(d?.num_comments || 0)
          });
        });
      } catch (e) {
        console.log("Reddit search error:", e);
      }
    }
  }
  const norm = /* @__PURE__ */ __name((s) => s.toLowerCase().replace(/\s+/g, " ").replace(/[^a-z0-9\sáéíóúñü]/gi, "").trim(), "norm");
  const seen = /* @__PURE__ */ new Set();
  const ranked = pool.sort((a, b) => b.score + b.num_comments * 2 - (a.score + a.num_comments * 2)).filter((r) => {
    const k = norm(r.title);
    if (seen.has(k))
      return false;
    seen.add(k);
    return true;
  }).slice(0, Math.min(30, Math.max(3, Number(limit || 10))));
  const guessCategory = /* @__PURE__ */ __name((t) => {
    const lc = t.toLowerCase();
    if (/vs|contra|comparativa/.test(lc))
      return "Comparativas";
    if (/precio|cost|comprar|guia/.test(lc))
      return "Gu\xEDas de compra";
    if (/mantenimiento|cuidado|accesorio|equipo/.test(lc))
      return "Equipo y mantenimiento";
    if (/ejercicio|rutina|dolor|rehabilit|salud/.test(lc))
      return "Ejercicios y salud";
    return "Estudio";
  }, "guessCategory");
  const toSlug2 = /* @__PURE__ */ __name((t) => t.toLowerCase().replace(/[áàäâã]/g, "a").replace(/[éèëê]/g, "e").replace(/[íìïî]/g, "i").replace(/[óòöôõ]/g, "o").replace(/[úùüû]/g, "u").replace(/[ñ]/g, "n").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/--+/g, "-").replace(/^-+|-+$/g, ""), "toSlug");
  const suggestions = ranked.map((r) => {
    const title = /mexico|méxico/i.test(r.title) ? r.title : `${r.title} (M\xE9xico)`;
    const slug = toSlug2(title).slice(0, 80);
    const category = guessCategory(title);
    const keywords = Array.from(new Set(title.toLowerCase().split(/[^a-z0-9áéíóúñü]+/).filter(Boolean))).slice(0, 5);
    return { slug, title, category, keywords, source: r.url };
  });
  const ts = Math.floor(Date.now() / 1e3);
  for (const s of suggestions) {
    await c.env.DB.prepare("INSERT OR REPLACE INTO blog_suggestions (slug, title, category, keywords_json, source, status, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)").bind(s.slug, s.title, s.category, JSON.stringify(s.keywords), s.source, "in_review", ts).run();
  }
  return c.json({ suggestions });
});
app.post("/api/blog/suggestions/accept", async (c) => {
  await ensureSchema(c.env);
  const { slug } = await c.req.json().catch(() => ({}));
  if (!slug)
    return c.json({ error: "slug required" }, 400);
  await c.env.DB.prepare("UPDATE blog_suggestions SET status=?1 WHERE slug=?2").bind("accepted", slug).run();
  return c.json({ success: true });
});
app.post("/api/blog/suggestions/decline", async (c) => {
  await ensureSchema(c.env);
  const { slug } = await c.req.json().catch(() => ({}));
  if (!slug)
    return c.json({ error: "slug required" }, 400);
  await c.env.DB.prepare("UPDATE blog_suggestions SET status=?1 WHERE slug=?2").bind("declined", slug).run();
  return c.json({ success: true });
});
app.post("/api/blog/topics/update", async (c) => {
  const { slug, title, category, keywords } = await c.req.json().catch(() => ({}));
  if (!slug)
    return c.json({ error: "slug required" }, 400);
  await ensureSchema(c.env);
  if (title || category || keywords) {
    const updates = [];
    const values = [];
    if (title) {
      updates.push("title=?");
      values.push(title);
    }
    if (category) {
      updates.push("category=?");
      values.push(category);
    }
    if (Array.isArray(keywords)) {
      updates.push("keywords_json=?");
      values.push(JSON.stringify(keywords));
    }
    if (updates.length > 0) {
      values.push(slug);
      await c.env.DB.prepare(`UPDATE blog_suggestions SET ${updates.join(", ")} WHERE slug=?`).bind(...values).run();
    }
  }
  return c.json({ success: true });
});
app.post("/api/blog/pipeline/trigger", async (c) => {
  const { slug, title, category, keywords } = await c.req.json().catch(() => ({}));
  if (!slug)
    return c.json({ error: "slug required" }, 400);
  const now = Math.floor(Date.now() / 1e3);
  await ensureSchema(c.env);
  await c.env.DB.prepare("INSERT OR REPLACE INTO blog_suggestions (slug, title, category, keywords_json, source, status, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)").bind(String(slug), title || String(slug).replace(/-/g, " "), category || "General", JSON.stringify(Array.isArray(keywords) ? keywords : []), "admin_ui", "queued", now).run();
  try {
    if (c.env.GITHUB_REPO && c.env.GITHUB_TOKEN) {
      const researchPath = `blog-planning/research/${slug}.md`;
      const existing = await ghGetFile(c.env, researchPath);
      if (!existing) {
        await ghPutFile(c.env, researchPath, `# RESEARCH: ${title || slug.replace(/-/g, " ")}

**Status**: \u{1F52C} Research needed
`, `chore(research): scaffold ${slug}`);
      }
    }
  } catch (e) {
    console.log("pipeline/github error", e.message);
  }
  return c.json({ success: true, queued: [String(slug)] });
});
app.post("/api/blog/keywords", async (c) => {
  await ensureSchema(c.env);
  const body = await c.req.json().catch(() => ({}));
  const keywords = Array.isArray(body?.keywords) ? body.keywords : [];
  const enc = await encryptJsonWithEnv(c.env, { keywords });
  const ts = Math.floor(Date.now() / 1e3);
  await c.env.DB.prepare("INSERT INTO app_settings (key, value, updated_at) VALUES (?1,?2,?3) ON CONFLICT(key) DO UPDATE SET value=?2, updated_at=?3").bind("keywords_store", enc || JSON.stringify({ keywords }), ts).run();
  return c.json({ success: true, keywords });
});
function toSlug(s) {
  return s.toLowerCase().replace(/[áàäâã]/g, "a").replace(/[éèëê]/g, "e").replace(/[íìïî]/g, "i").replace(/[óòöôõ]/g, "o").replace(/[úùüû]/g, "u").replace(/[ñ]/g, "n").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/--+/g, "-").replace(/^-+|-+$/g, "");
}
__name(toSlug, "toSlug");
function titleCase(s) {
  return s.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
}
__name(titleCase, "titleCase");
function todayISO() {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
__name(todayISO, "todayISO");
function buildBlogMarkdown(meta) {
  const { title, description, category, tags, slug } = meta;
  const publishDate = meta.publishDate || todayISO();
  const fm = [
    "---",
    `title: "${title}"`,
    `description: "${description}"`,
    `category: "${category}"`,
    `tags: [${tags.slice(0, 3).map((t) => `"${t}"`).join(", ")}]`,
    `publishDate: "${publishDate}"`,
    'author: "CAMA Pilates"',
    `slug: "${slug}"`,
    "featured: false",
    "---",
    "",
    `# ${title}`,
    "",
    "> Nota: Contenido informativo; no es asesoramiento m\xE9dico.",
    "",
    "## Resumen",
    `${description}`,
    "",
    "## Criterios clave para elegir",
    "- Seguridad y progresi\xF3n adecuada",
    "- Adaptaci\xF3n al espacio y presupuesto",
    "- Calidad del equipo y soporte",
    "",
    "## Desarrollo y puntos clave",
    "### Beneficios y contexto mexicano",
    "En M\xE9xico, el inter\xE9s por Pilates crece por su bajo impacto y mejoras en control postural.",
    "",
    "### Ejercicios y t\xE9cnica",
    "Prioriza control, respiraci\xF3n y alineaci\xF3n. Trabaja con progresiones y evita dolor agudo.",
    "",
    '<see-also limit="3" />',
    "",
    "## Recomendaciones CAMA Pilates",
    "Nuestros Reformers ofrecen calidad premium con ingenier\xEDa y manufactura local, soporte y refacciones en M\xE9xico.",
    "",
    '<hub-list category="Gu\xEDas de compra" limit="5" title="M\xE1s gu\xEDas de compra" />',
    "",
    "## FAQ",
    "### \xBFCu\xE1l es la mejor opci\xF3n para casa?",
    "Depende del espacio, nivel y presupuesto; busca estabilidad, ajustes y soporte local.",
    "",
    "### \xBFVale la pena invertir en calidad?",
    "S\xED: mayor durabilidad, precisi\xF3n en el movimiento y mejor experiencia a largo plazo.",
    ""
  ].join("\n");
  return fm;
}
__name(buildBlogMarkdown, "buildBlogMarkdown");
app.post("/api/blog/pipeline/run", async (c) => {
  await ensureSchema(c.env);
  const { slug: rawSlug } = await c.req.json().catch(() => ({}));
  const slug = toSlug(String(rawSlug || ""));
  if (!slug)
    return c.json({ error: "slug required" }, 400);
  const srow = await c.env.DB.prepare("SELECT title, category, keywords_json FROM blog_suggestions WHERE slug = ?1").bind(slug).first();
  const title = srow?.title ? String(srow.title) : titleCase(slug);
  const category = srow?.category ? String(srow.category) : "Estudio";
  let tags = [];
  try {
    tags = JSON.parse(srow?.keywords_json || "[]");
  } catch {
  }
  if (tags.length === 0)
    tags = title.toLowerCase().split(/[^a-z0-9áéíóúñü]+/).filter(Boolean).slice(0, 3);
  const description = `Gu\xEDa pr\xE1ctica sobre ${title.toLowerCase()} en M\xE9xico: criterios, beneficios y recomendaciones.`;
  if (c.env.GITHUB_REPO && c.env.GITHUB_TOKEN) {
    const researchPath = `blog-planning/research/${slug}.md`;
    const existing = await ghGetFile(c.env, researchPath);
    if (!existing) {
      const content = `# RESEARCH: ${title}

**Status**: \u{1F52C} Research needed
**Priority**: High

## Objetivo
Reunir informaci\xF3n mexicana y de calidad para desarrollar un art\xEDculo completo sobre ${title.toLowerCase()}.

## Palabras clave y SEO
- Primaria: ${tags[0] || title.split(" ")[0]}
`;
      await ghPutFile(c.env, researchPath, content, `chore(research): scaffold ${slug}`);
    }
  }
  if (!c.env.GITHUB_REPO || !c.env.GITHUB_TOKEN)
    return c.json({ error: "GitHub not configured" }, 500);
  const blogPath = `src/content/blog/${slug}.md`;
  const md = buildBlogMarkdown({ title, description, category, tags, slug });
  const existingBlog = await ghGetFile(c.env, blogPath);
  await ghPutFile(c.env, blogPath, md, existingBlog ? `feat(blog): update ${slug}` : `feat(blog): add ${slug}`, existingBlog?.sha);
  try {
    const todo = await ghGetFile(c.env, "blog-planning/BLOG_TODO.md");
    if (todo) {
      const lines = todo.content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(slug) && lines[i].includes("\u{1F52C}")) {
          lines[i] = lines[i].replace("\u{1F52C}", "\u2705");
          break;
        }
      }
      await ghPutFile(c.env, "blog-planning/BLOG_TODO.md", lines.join("\n"), `chore(todo): mark ${slug} done`, todo.sha);
    }
  } catch {
  }
  await c.env.DB.prepare("INSERT OR REPLACE INTO blog_suggestions (slug, title, category, keywords_json, source, status, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)").bind(slug, title, category, JSON.stringify(tags), "worker", "completed", Math.floor(Date.now() / 1e3)).run();
  return c.json({ success: true, slug, committed: blogPath });
});
app.get("/api/images/list", async (c) => {
  await ensureSchema(c.env);
  const rows = await c.env.DB.prepare('SELECT slug, hero_url, updated_at FROM blog_images WHERE hero_url IS NOT NULL AND hero_url != "" ORDER BY updated_at DESC').all();
  const items = (rows?.results || []).map((r) => ({ slug: r.slug, hero_url: r.hero_url, updated_at: r.updated_at }));
  return c.json({ items });
});
app.all("/api/images/meta", async (c) => {
  await ensureSchema(c.env);
  const slug = c.req.query("slug") || "";
  if (c.req.method === "GET") {
    if (!slug)
      return c.json({ error: "slug required" }, 400);
    const row = await c.env.DB.prepare("SELECT slug, hero_url, sections_json, updated_at FROM blog_images WHERE slug = ?").bind(slug).first();
    if (!row)
      return c.json({ slug, hero_url: null, sections: [] });
    let sections = [];
    try {
      sections = JSON.parse(row.sections_json || "[]");
    } catch {
      sections = [];
    }
    return c.json({ slug: row.slug, hero_url: row.hero_url, sections, updated_at: row.updated_at });
  }
  if (c.req.method === "POST") {
    const body = await c.req.json().catch(() => ({}));
    const s = String(body?.slug || slug || "");
    if (!s)
      return c.json({ error: "slug required" }, 400);
    const sections_json = JSON.stringify(body?.sections || []);
    const updated_at = Math.floor(Date.now() / 1e3);
    await c.env.DB.prepare("INSERT INTO blog_images (slug, hero_url, sections_json, updated_at) VALUES (?1,?2,?3,?4) ON CONFLICT(slug) DO UPDATE SET hero_url=excluded.hero_url, sections_json=excluded.sections_json, updated_at=excluded.updated_at").bind(s, body?.hero_url || null, sections_json, updated_at).run();
    return c.json({ success: true });
  }
  return c.json({ error: "Method Not Allowed" }, 405);
});
function trimWords(s, max = 70) {
  const words = s.trim().split(/\s+/);
  return words.length > max ? words.slice(0, max).join(" ") + "\u2026" : s.trim();
}
__name(trimWords, "trimWords");
function summarize(text, maxChars = 350) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > maxChars ? cleaned.slice(0, maxChars - 1) + "\u2026" : cleaned;
}
__name(summarize, "summarize");
function buildNegativePrompt() {
  return [
    "texto, marca de agua, tipografia, logo, texto en la imagen",
    "arte de dibujos animados, CGI obvio, caricatura, 3D, render",
    "manos o dedos extra, anatom\xEDa incorrecta, deformaciones",
    "rostros distorsionados, desenfoque excesivo, ruido digital fuerte",
    "colores fluorescentes antinaturales, halos, aberraci\xF3n crom\xE1tica"
  ].join(", ");
}
__name(buildNegativePrompt, "buildNegativePrompt");
function buildHeroPrompt(headline, extra) {
  return [
    `Fotograf\xEDa hiperrealista 16:9 que ilustre: \u201C${headline.trim()}\u201D.`,
    "Ambientaci\xF3n mexicana aut\xE9ntica (hogar o estudio moderno en M\xE9xico), luz natural c\xE1lida de ma\xF1ana, detalles de madera y acero pulido.",
    "Muestra equipo de Pilates Reformer de alta gama (sin marcas visibles), tonos neutros y elegantes. Composici\xF3n limpia con sujeto principal en primer tercio.",
    "\xD3ptica: 50mm, f/2.8, ISO 200, velocidad 1/250; profundidad de campo suave, bokeh natural.",
    "Evita cualquier texto o marca en la imagen, sensaci\xF3n premium, realista y acogedora.",
    extra ? `Instrucciones adicionales: ${extra.trim()}` : ""
  ].filter(Boolean).join(" ");
}
__name(buildHeroPrompt, "buildHeroPrompt");
function buildChapterPrompt(heading, summary) {
  return [
    `Fotograf\xEDa hiperrealista 4:3 que represente el cap\xEDtulo \u201C${heading.trim()}\u201D.`,
    `Contenido clave: ${trimWords(summary, 40)}.`,
    "Ambientaci\xF3n mexicana coherente con el art\xEDculo, iluminaci\xF3n natural, tono editorial premium.",
    "Si aplica, incluir discretamente un Reformer o accesorios de Pilates en contexto realista (sin logos).",
    "\xD3ptica: 50mm o 35mm, f/2.8\u20134, estilo natural sin exageraciones, sin texto ni marcas."
  ].join(" ");
}
__name(buildChapterPrompt, "buildChapterPrompt");
async function loadVertexConfig(env) {
  try {
    await ensureSchema(env);
    const row = await env.DB.prepare("SELECT value FROM app_settings WHERE key = ?").bind("vertex_config").first();
    if (!row?.value)
      return {};
    const cfg = await decryptJsonWithEnv(env, row.value);
    return cfg || {};
  } catch {
    return {};
  }
}
__name(loadVertexConfig, "loadVertexConfig");
async function getAccessTokenFromSA(env) {
  const sa = env.VERTEX_SA_EMAIL;
  const keyPem = env.VERTEX_SA_PRIVATE_KEY;
  if (!sa || !keyPem)
    return null;
  const now = Math.floor(Date.now() / 1e3);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = { iss: sa, sub: sa, aud: "https://oauth2.googleapis.com/token", scope: "https://www.googleapis.com/auth/cloud-platform", iat: now, exp: now + 3600 };
  const enc = /* @__PURE__ */ __name((obj) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj)))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_"), "enc");
  const data = `${enc(header)}.${enc(payload)}`;
  const pem = keyPem.replace(/\n/g, "\n");
  const keyData = pem.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sigBuf = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(data));
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwt = `${data}.${sig}`;
  const resp = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }) });
  if (!resp.ok)
    return null;
  const tok = await resp.json();
  return tok.access_token || null;
}
__name(getAccessTokenFromSA, "getAccessTokenFromSA");
app.post("/api/images/generate", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const slug = String(body?.slug || "");
  const headline = String(body?.headline || "");
  if (!slug || !headline)
    return c.json({ error: "slug and headline required" }, 400);
  const cfg = await loadVertexConfig(c.env);
  if (cfg?.serviceAccountEmail && cfg?.serviceAccountPrivateKey) {
    ;
    c.env.VERTEX_SA_EMAIL = cfg.serviceAccountEmail;
    c.env.VERTEX_SA_PRIVATE_KEY = cfg.serviceAccountPrivateKey;
  }
  const project = cfg?.projectId || c.env.VERTEX_PROJECT_ID;
  const location = cfg?.location || c.env.VERTEX_LOCATION || "us-central1";
  const model = cfg?.model || c.env.VERTEX_MODEL_IMAGE || "imagegeneration@006";
  const limit = Math.max(2, Math.min(3, Number(body?.limit ?? 3)));
  const sections = Array.isArray(body?.sections) ? body.sections : [];
  const chapters = sections.filter((s) => s?.heading && !/^FAQ\b/i.test(s.heading)).slice(0, limit);
  const heroPrompt = buildHeroPrompt(headline, body?.additionalPrompt);
  const chapterPrompts = chapters.map((ch) => ({ heading: ch.heading, summary: summarize(String(ch.text || "")), prompt: buildChapterPrompt(ch.heading, summarize(String(ch.text || ""))) }));
  const shouldCallVertex = Boolean(project);
  const result = { success: true, usedVertex: false, hero: { prompt: heroPrompt }, chapters: chapterPrompts.map((p) => ({ ...p })) };
  if (body?.testOnly) {
    const token = await getAccessTokenFromSA(c.env);
    return c.json({ success: Boolean(token), usedVertex: Boolean(token), tested: true });
  }
  if (shouldCallVertex) {
    const getToken = /* @__PURE__ */ __name(async () => {
      if (c.env.VERTEX_ACCESS_TOKEN)
        return c.env.VERTEX_ACCESS_TOKEN;
      const t = await getAccessTokenFromSA(c.env);
      if (t)
        c.env.VERTEX_ACCESS_TOKEN = t;
      return t;
    }, "getToken");
    const access = await getToken();
    if (!access)
      return c.json({ error: "Missing Vertex access (token or service account creds)" }, 400);
    const baseUrl = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateImage`;
    const gen = /* @__PURE__ */ __name(async (prompt, aspect) => {
      const resp = await fetch(baseUrl, { method: "POST", headers: { authorization: `Bearer ${access}`, "content-type": "application/json" }, body: JSON.stringify({ instances: [{ prompt, negativePrompt: buildNegativePrompt() }], parameters: { sampleCount: 1, aspectRatio: aspect } }) });
      if (!resp.ok)
        return { prompt, error: `Vertex error: ${resp.status} ${await resp.text()}` };
      const data = await resp.json();
      const b64 = data?.predictions?.[0]?.bytesBase64Encoded || data?.images?.[0]?.bytesBase64Encoded;
      if (!b64)
        return { prompt, error: "No image in response" };
      return { prompt, b64, mime: "image/png" };
    }, "gen");
    const hero = await gen(heroPrompt, "16:9");
    result.hero = hero;
    for (let i = 0; i < result.chapters.length; i++) {
      const r = await gen(result.chapters[i].prompt, "4:3");
      result.chapters[i] = { ...result.chapters[i], ...r };
    }
    result.usedVertex = true;
  }
  const bucket = c.env.IMAGES_R2;
  const base = c.env.IMAGES_PUBLIC_BASE?.replace(/\/$/, "");
  if (bucket && base) {
    const folder = `blog/${slug}`;
    const put = /* @__PURE__ */ __name(async (key, b64, mime = "image/png") => {
      await bucket.put(key, Uint8Array.from(atob(b64), (c2) => c2.charCodeAt(0)), { httpMetadata: { contentType: mime, cacheControl: "public, max-age=31536000, immutable" } });
      return `${base}/${key}`;
    }, "put");
    if (result.hero?.b64)
      result.hero.url = await put(`${folder}/hero.png`, result.hero.b64, result.hero.mime);
    for (let i = 0; i < result.chapters.length; i++) {
      const cpt = result.chapters[i];
      if (cpt?.b64)
        result.chapters[i].url = await put(`${folder}/chapter-${i + 1}.png`, cpt.b64, cpt.mime);
    }
  }
  return c.json(result);
});
app.get("/", (c) => {
  return c.json({
    message: "CAMA Pilates API",
    endpoints: [
      "GET /api/admin/health",
      "POST /api/admin/login",
      "GET /api/admin/session",
      "POST /api/admin/logout",
      "GET /api/admin/captcha",
      "POST /api/admin/init",
      "GET /api/settings/vertex",
      "POST /api/settings/vertex",
      "GET /api/blog/status",
      "GET /api/blog/suggestions",
      "POST /api/blog/suggestions",
      "GET /api/images/list",
      "GET/POST /api/images/meta",
      "POST /api/images/generate"
    ]
  });
});
var src_default = app;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// .wrangler/tmp/bundle-vFAeHm/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-vFAeHm/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
