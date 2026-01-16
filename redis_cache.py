import os
import json
import logging
from functools import wraps
from flask import request
from upstash_redis import Redis

# Initialize Redis client
redis_client = None

def init_redis():
    """Initialize Redis client"""
    global redis_client
    
    # # TEMPORARILY DISABLED FOR DEBUGGING
    # logging.warning("⚠️ Redis cache is DISABLED for debugging")
    # redis_client = None
    # return False
    
    # Support both REDIS_URL and UPSTASH_REDIS_REST_URL
    redis_url = os.getenv('REDIS_URL') or os.getenv('UPSTASH_REDIS_REST_URL')
    redis_token = os.getenv('REDIS_TOKEN') or os.getenv('UPSTASH_REDIS_REST_TOKEN')
    
    if redis_url and redis_token:
        try:
            redis_client = Redis(url=redis_url, token=redis_token)
            # Test connection
            redis_client.ping()
            logging.info("✅ Redis cache initialized successfully")
            return True
        except Exception as e:
            logging.error(f"❌ Redis initialization failed: {e}")
            redis_client = None
            return False
    else:
        logging.warning("⚠️ Redis not configured (REDIS_URL/REDIS_TOKEN missing)")
        return False

def cache_key(prefix, *args, **kwargs):
    """Generate cache key from arguments"""
    key_parts = [prefix]
    key_parts.extend(str(arg) for arg in args)
    key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
    return ":".join(key_parts)

def get_cache(key):
    """Get value from cache"""
    if not redis_client:
        return None
    
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception as e:
        logging.error(f"Cache get error: {e}")
        return None

def set_cache(key, value, expire=300):
    """Set value in cache with expiration (seconds)"""
    if not redis_client:
        return False
    
    try:
        redis_client.set(key, json.dumps(value), ex=expire)
        return True
    except Exception as e:
        logging.error(f"Cache set error: {e}")
        return False

def delete_cache(key):
    """Delete key from cache"""
    if not redis_client:
        return False
    
    try:
        redis_client.delete(key)
        return True
    except Exception as e:
        logging.error(f"Cache delete error: {e}")
        return False

def delete_pattern(pattern):
    """Delete all keys matching pattern"""
    if not redis_client:
        return False
    
    try:
        # Get all keys matching pattern
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
        return True
    except Exception as e:
        logging.error(f"Cache pattern delete error: {e}")
        return False

def cached(prefix, expire=300, key_func=None):
    """
    Decorator to cache function results
    
    Args:
        prefix: Cache key prefix
        expire: Expiration time in seconds (default: 5 minutes)
        key_func: Function to generate cache key (optional)
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Generate cache key
            if key_func:
                key = key_func(*args, **kwargs)
            else:
                key = cache_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_value = get_cache(key)
            if cached_value is not None:
                logging.debug(f"Cache HIT: {key}")
                return cached_value
            
            # Cache miss - call function
            logging.debug(f"Cache MISS: {key}")
            result = f(*args, **kwargs)
            
            # Store in cache
            set_cache(key, result, expire)
            
            return result
        
        return decorated_function
    return decorator

def invalidate_user_cache(user_id):
    """Invalidate all cache for a specific user"""
    patterns = [
        f"dashboard:{user_id}:*",
        f"content:{user_id}:*",
        f"stats:{user_id}:*"
    ]
    
    for pattern in patterns:
        delete_pattern(pattern)
    
    logging.info(f"Invalidated cache for user {user_id}")

def get_cache_stats():
    """Get cache statistics"""
    if not redis_client:
        return None
    
    try:
        info = redis_client.info()
        return {
            'hits': info.get('keyspace_hits', 0),
            'misses': info.get('keyspace_misses', 0),
            'keys': redis_client.dbsize(),
            'memory': info.get('used_memory_human', 'N/A')
        }
    except Exception as e:
        logging.error(f"Error getting cache stats: {e}")
        return None