local connectTimeout = os.getenv("REDIS_CONNECT_TIMEOUT")
local sendTimeout = os.getenv("REDIS_SEND_TIMEOUT")
local readTimeout = os.getenv("REDIS_READ_TIMEOUT")
local maxIdleTimeout = os.getenv("REDIS_MAX_IDLE_TIMEOUT")
local poolSize = os.getenv("REDIS_POOL_SIZE")
local host = os.getenv("REDIS_HOST")
local port = os.getenv("REDIS_PORT")
local expirationTime = os.getenv("REDIS_CACHE_EXPIRATION_TIME")

local value = assert(ngx.req.get_body_data(), "no value found")
local key = assert(ngx.var.request_uri, "no key found")
local redis = require "resty.redis"
local red, err = redis:new()
if not red then
    ngx.log(ngx.ERR, "Failed to create redis variable, error -> ", err)
    return
end
red:set_timeouts(connectTimeout, sendTimeout, readTimeout)
red:set_keepalive(maxIdleTimeout, poolSize)
local ok, err = red:connect(host, port)
if not ok then
    ngx.log(ngx.ERR, "Failed to connect to redis, error -> ", err)
    return
end
local data, err = red:set(key, value)
if data == ngx.null then
    ngx.log(ngx.ERR, "failed to set key, error -> ", err)
    return ngx.exit(500)
end
red:expire(key, expirationTime)
ngx.print(data)
