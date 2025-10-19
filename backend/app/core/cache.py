"""
Cache utility for FastAPI endpoints with invalidation support.
Uses in-memory caching with TTL and manual invalidation.
"""
from typing import Optional, Any, Dict
from datetime import datetime, timedelta
from functools import wraps
import asyncio
import hashlib
import json


class CacheStore:
    """Simple in-memory cache store with TTL and invalidation support"""

    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired"""
        async with self._lock:
            if key not in self._cache:
                return None

            item = self._cache[key]
            if datetime.utcnow() > item['expires_at']:
                # Expired, remove it
                del self._cache[key]
                return None

            return item['value']

    async def set(self, key: str, value: Any, ttl_seconds: int = 3600):
        """Set value in cache with TTL"""
        async with self._lock:
            self._cache[key] = {
                'value': value,
                'expires_at': datetime.utcnow() + timedelta(seconds=ttl_seconds),
                'created_at': datetime.utcnow()
            }

    async def delete(self, key: str):
        """Delete specific key from cache"""
        async with self._lock:
            if key in self._cache:
                del self._cache[key]

    async def clear_pattern(self, pattern: str):
        """Clear all keys matching a pattern (simple prefix match)"""
        async with self._lock:
            keys_to_delete = [k for k in self._cache.keys() if k.startswith(pattern)]
            for key in keys_to_delete:
                del self._cache[key]

    async def clear_all(self):
        """Clear entire cache"""
        async with self._lock:
            self._cache.clear()

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            'total_keys': len(self._cache),
            'keys': list(self._cache.keys())
        }


# Global cache instance
cache_store = CacheStore()


def generate_cache_key(prefix: str, *args, **kwargs) -> str:
    """Generate a cache key from prefix and arguments"""
    key_parts = [prefix]

    # Add positional arguments
    for arg in args:
        if arg is not None:
            key_parts.append(str(arg))

    # Add keyword arguments (sorted for consistency)
    for k, v in sorted(kwargs.items()):
        if v is not None:
            key_parts.append(f"{k}={v}")

    # Hash the key parts if too long
    key_str = ":".join(key_parts)
    if len(key_str) > 200:
        key_hash = hashlib.md5(key_str.encode()).hexdigest()
        return f"{prefix}:{key_hash}"

    return key_str


async def get_cached(key: str) -> Optional[Any]:
    """Get value from cache"""
    return await cache_store.get(key)


async def set_cached(key: str, value: Any, ttl_seconds: int = 3600):
    """Set value in cache"""
    await cache_store.set(key, value, ttl_seconds)


async def invalidate_cache(key: str):
    """Invalidate specific cache key"""
    await cache_store.delete(key)


async def invalidate_cache_pattern(pattern: str):
    """Invalidate all cache keys matching pattern"""
    await cache_store.clear_pattern(pattern)


async def clear_all_cache():
    """Clear entire cache"""
    await cache_store.clear_all()


def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics"""
    return cache_store.get_stats()
