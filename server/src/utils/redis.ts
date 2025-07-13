import { redisClient } from "../config/redis";

// Cache utility functions
export const getCachedData = async (key: string) => {
  try {
    const cachedData = await redisClient.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error("Error getting cached data:", error);
    return null;
  }
};

export const setCachedData = async (
  key: string,
  data: any,
  ttlInSeconds: number
) => {
  try {
    await redisClient.setEx(key, ttlInSeconds, JSON.stringify(data));
  } catch (error) {
    console.error("Error setting cached data:", error);
  }
};

export const deleteCachedData = async (key: string) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error("Error deleting cached data:", error);
  }
};

export const bulkDeleteCache = async (pattern: string) => {
  try {
    for await (const key of redisClient.scanIterator({ MATCH: pattern })) {
      await redisClient.del(key);
    }
  } catch (error) {
    console.error("Error clearing all cache:", error);
  }
};

// Helper function to generate cache keys
export const generateCacheKey = (prefix: string, params: any) => {
  const paramString = JSON.stringify(params);
  return `${prefix}:${Buffer.from(paramString).toString("base64")}`;
};
