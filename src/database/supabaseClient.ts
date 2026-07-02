import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL atau Anon Key belum dikonfigurasi di file .env. Halaman autentikasi dan database Supabase mungkin tidak berfungsi."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const toCamel = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamel(v));
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      let camelKey;
      if (key === "village_code") {
        camelKey = "VillageCode";
      } else if (key === "kasi_pemerintah") {
        camelKey = "kasipemerintah";
      } else {
        camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      }
      result[camelKey] = toCamel(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

export const toSnake = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => toSnake(v));
  } else if (obj !== null && obj !== undefined && (obj.constructor === Object || typeof obj.getMonth === 'function')) {
    // If it's a date, return as is (don't convert to object)
    if (obj instanceof Date) return obj;
    return Object.keys(obj).reduce((result, key) => {
      // Skip undefined fields so PostgreSQL defaults can work
      if (obj[key] === undefined) return result;
      
      let snakeKey;
      if (key === "VillageCode") {
        snakeKey = "village_code";
      } else if (key === "kasipemerintah") {
        snakeKey = "kasi_pemerintah";
      } else {
        snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      }
      result[snakeKey] = toSnake(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

