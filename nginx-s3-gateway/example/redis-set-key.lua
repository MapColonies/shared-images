local value = assert(ngx.req.get_body_data(), "no value found")
local key = assert(ngx.var.request_uri, "no key found")
local redis = require "resty.redis"
local red, err = redis:new()
if not red then
    ngx.log(ngx.ERR, "Failed to create redis variable, error -> ", err)
    return    
end
red:set_keepalive(os.getenv("REDIS_MAX_IDLE_TIMEOUT"), os.getenv("REDIS_POOL_SIZE"))
red:set_timeouts(os.getenv("REDIS_CONNECT_TIMEOUT"), os.getenv("REDIS_SEND_TIMEOUT"), os.getenv("REDIS_READ_TIMEOUT"))
local ok, err = red:connect(os.getenv("REDIS_HOST"), os.getenv("REDIS_PORT"))
if not ok then
    ngx.log(ngx.ERR, "Failed to connect to redis, error -> ", err)
    return
end
local data, err = red:set(key, value)
if data == ngx.null then
    ngx.log(ngx.ERR, "Didn't managed to set key, error -> ", err)
    return ngx.exit(500)
end
red:expire(key, os.getenv("REDIS_CACHE_EXPIRATION_TIME"))
ngx.print(data)