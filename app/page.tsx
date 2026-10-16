'use client';

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Sun, 
  Moon, 
  Search, 
  BookOpen, 
  ShoppingBag, 
  FileText, 
  ArrowUpRight, 
  Sparkles,
  Layers
} from "lucide-react";

// Initialize Supabase safely using environment variables or fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  cover_image_url: string;
  author_name: string;
  published_at: string;
  read_time: string;
}

interface EBook {
  id: string;
  title: string;
  description: string;
  price: number;
  cover_image_url: string;
  download_url?: string;
  pages: number;
  format: string;
}

export default function BlissMediaPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"agency" | "articles" | "ebooks">("agency");
  const [articles, setArticles] = useState<Article[]>([]);
  const [ebooks, setEbooks] = useState<EBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const isDark = theme === "dark";

  // Fetch data directly from Supabase tables
  useEffect(() => {
    async function loadSupabaseData() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [articlesRes, ebooksRes] = await Promise.all([
          supabase.from("articles").select("*").order("created_at", { ascending: false }),
          supabase.from("ebooks").select("*").order("created_at", { ascending: false })
        ]);

        if (articlesRes.data) setArticles(articlesRes.data);
        if (ebooksRes.data) setEbooks(ebooksRes.data);
      } catch (error) {
        console.error("Error fetching Supabase data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSupabaseData();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat = selectedCategory === "All" || art.category === selectedCategory;
      const matchSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans ${
      isDark ? "bg-[#030d09] text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Top Navbar */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
        isDark ? "bg-[#051610]/90 border-emerald-900/40" : "bg-white/90 border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("agency")}>
            <div className="p-2.5 bg-emerald-500 rounded-2xl text-slate-950 font-black text-xl tracking-wider shadow-lg shadow-emerald-500/20">
              BM
            </div>
            <div>
              <span className={`font-extrabold text-2xl tracking-tight block leading-none ${isDark ? "text-white" : "text-slate-900"}`}>
                Bliss<span className="text-emerald-400">Media</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">
                Digital Studio & E-Store
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <button 
              onClick={() => setActiveTab("agency")}
              className={`transition ${activeTab === "agency" ? "text-emerald-400 font-bold" : "hover:text-emerald-400"}`}
            >
              Agency Overview
            </button>
            <button 
              onClick={() => setActiveTab("articles")}
              className={`transition flex items-center gap-1.5 ${activeTab === "articles" ? "text-emerald-400 font-bold" : "hover:text-emerald-400"}`}
            >
              <FileText size={16} />
              <span>Articles & Blog</span>
            </button>
            <button 
              onClick={() => setActiveTab("ebooks")}
              className={`transition flex items-center gap-1.5 ${activeTab === "ebooks" ? "text-emerald-400 font-bold" : "hover:text-emerald-400"}`}
            >
              <ShoppingBag size={16} />
              <span>E-Books Store</span>
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(isDark ? "light" :
