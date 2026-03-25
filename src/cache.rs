use std::collections::HashMap;
use std::time::{Duration, Instant};

pub struct LRUCache<K, V> {
    capacity: usize,
    cache: HashMap<K, (V, Instant)>,
    order: Vec<K>,
}

impl<K: Copy + Eq + std::hash::Hash, V> LRUCache<K, V> {
    pub fn new(capacity: usize) -> Self {
        Self { 
            capacity,
            cache: HashMap::new(),
            order: Vec::new(),
        }
    }

    pub fn set(&mut self, key: K, value: V, ttl: Duration) {
        if self.cache.len() >= self.capacity {
            let oldest_key = self.order.remove(0);
            self.cache.remove(&oldest_key);
        }
        let expiration_time = Instant::now() + ttl;
        self.cache.insert(key, (value, expiration_time));
        self.order.push(key);
    }

    pub fn get(&mut self, key: K) -> Option<&V> {
        if let Some(&(ref value, expiration)) = self.cache.get(&key) {
            if Instant::now() < expiration {
                return Some(value);
            }
            self.cache.remove(&key);
            self.order.retain(|k| *k != key);
        }
        None
    }

    pub fn clear(&mut self) {
        self.cache.clear();
        self.order.clear();
    }
}

// Usage example:
// let mut cache = LRUCache::new(10000);
// cache.set("key", "value", Duration::new(60, 0)); // 60 seconds TTL
// let value = cache.get("key");
// cache.clear();