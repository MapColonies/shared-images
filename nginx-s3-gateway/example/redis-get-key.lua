local connectTimeout = os.getenv("REDIS_CONNECT_TIMEOUT")
local sendTimeout = os.getenv("REDIS_SEND_TIMEOUT")
local readTimeout = os.getenv("REDIS_READ_TIMEOUT")
local maxIdleTimeout = os.getenv("REDIS_MAX_IDLE_TIMEOUT")
local poolSize = os.getenv("REDIS_POOL_SIZE")
local host = os.getenv("REDIS_HOST")
local port = os.getenv("REDIS_PORT")

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
local data = red:get(key)
if data == ngx.null then
    return ngx.exit(404)
end
ngx.print(data)
