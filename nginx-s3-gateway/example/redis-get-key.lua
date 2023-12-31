local connectTimeout = os.getenv("REDIS_CONNECT_TIMEOUT")
local sendTimeout = os.getenv("REDIS_SEND_TIMEOUT")
local readTimeout = os.getenv("REDIS_READ_TIMEOUT")
local maxIdleTimeout = os.getenv("REDIS_MAX_IDLE_TIMEOUT")
local poolSize = os.getenv("REDIS_POOL_SIZE")
local host = os.getenv("REDIS_HOST")
local port = os.getenv("REDIS_PORT")
local requirePassword = os.getenv("REDIS_REQUIRE_PASSWORD")
local password = os.getenv("REDIS_PASSWORD")

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
if requirePassword == "true" then
    local ok, err = red:auth(password)
    if not ok then
        ngx.log(ngx.ERR, "Failed to authenticate redis, error -> ", err)
        return ngx.exit(403)
    end    
end
local data = red:get(key)
if data == ngx.null then
    return ngx.exit(404)
end
ngx.print(data)