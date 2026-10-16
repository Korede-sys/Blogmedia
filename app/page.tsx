'use client';

import React, { useState, useMemo } from "react";
import { 
  Sun, 
  Moon, 
  Search, 
  BookOpen, 
  ShoppingBag, 
  FileText, 
  ArrowUpRight, 
  Layers 
} from "lucide-react";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  cover_image_url: string;
  read_time: string;
  published_at: string;
}

interface EBookItem {
  id: string;
  title: string;
  description: string;
  price: number;
  cover_image_url: string;
  download_url: string;
  pages: number;
  format: string;
}

const SAMPLE_ARTICLES: ArticleItem[] = [
  {
    id: "1",
    title: "Scaling Modern Web Architectures with React & Next.js",
    slug: "scaling-modern-web-architectures",
    excerpt: "Discover patterns for building high-performance digital agency platforms with clean component structures.",
    category: "Engineering",
    cover_image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    read_time: "5 min read",
    published_at: "Oct 12, 2026"
  },
  {
    id: "2",
    title: "The Future of Digital Branding and UI Systems",
    slug: "future-of-digital-branding",
    excerpt: "How cohesive design tokens and motion design elevate brand perception and user conversion rates.",
    category: "Design",
    cover_image_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    read_time: "4 min read",
    published_at: "Oct 08, 2026"
  }
];

const SAMPLE_EBOOKS: EBookItem[] = [
  {
    id: "eb-1",
    title: "The Full-Stack Developer Playbook 2026",
    description: "Comprehensive guide to mastering modern frontend architecture, backend scaling, and AI workflows.",
    price: 29,
    cover_image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    download_url: "#",
    pages: 180,
    format: "PDF + Source Code"
  },
  {
    id: "eb-2",
    title: "Digital Agency Scaling & Client Acquisition Blueprint",
    description: "Step-by-step frameworks for closing high-ticket agency clients and automating project delivery.",
    price: 49,
    cover_image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    download_url: "#",
    pages: 220,
    format: "PDF Workbook"
  }
];

export default function BlissMediaPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"agency" | "articles" | "ebooks">("agency");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const isDark = theme === "dark";

  const filteredArticles = useMemo(() => {
    return SAMPLE_ARTICLES.filter((art) => {
      const matchCat = selectedCategory === "All" || art.category === selectedCategory;
      const matchSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans ${
      isDark ? "bg-[#030d09] text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Navbar */}
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
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`p-2.5 rounded-xl border transition ${
                isDark 
                  ? "border-emerald-800/60 bg-emerald-950/60 text-amber-400 hover:bg-emerald-900/60" 
                  : "border-slate-200 bg-slate-100 text-emerald-800 hover:bg-slate-200"
              }`}
              title="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button 
              onClick={() => setActiveTab("ebooks")}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <BookOpen size={16} />
              <span>Buy E-Books</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {activeTab === "ebooks" && (
          <section className="space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Digital Bookstore</span>
              <h1 className="text-3xl md:text-5xl font-black">E-Books & Premium Resources</h1>
              <p className={`max-w-xl mx-auto text-xs md:text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Download professional guides, technical handbooks, and strategy playbooks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {SAMPLE_EBOOKS.map((ebook) => (
                <div 
                  key={ebook.id}
                  className={`rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                    isDark ? "bg-[#061c14] border-emerald-900/40 hover:border-emerald-500/60" : "bg-white border-slate-200 shadow-md"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="relative h-60 overflow-hidden bg-emerald-950/40">
                      <img src={ebook.cover_image_url} alt={ebook.title} className="w-full h-full object-cover" />
                      <span className="absolute top-4 right-4 bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-lg">
                        ${ebook.price}
                      </span>
                    </div>
                    <div className="p-6 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-emerald-400">
                        <span>{ebook.format}</span>
                        <span>•</span>
                        <span>{ebook.pages} Pages</span>
                      </div>
                      <h3 className="text-xl font-bold leading-snug">{ebook.title}</h3>
                      <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {ebook.description}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <a 
                      href={ebook.download_url} 
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={15} />
                      <span>Purchase E-Book</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "articles" && (
          <section className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-900/30">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Articles & Media</span>
                <h1 className="text-3xl font-black">Published Insights</h1>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs w-72 ${
                isDark ? "bg-[#061c14] border-emerald-900/60" : "bg-slate-100 border-slate-200"
              }`}>
                <Search size={15} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {filteredArticles.map((art) => (
                <article 
                  key={art.id}
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between ${
                    isDark ? "bg-[#061c14] border-emerald-900/40 hover:border-emerald-500/50" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="h-48 overflow-hidden relative">
                      <img src={art.cover_image_url} alt={art.title} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 bg-black/70 text-emerald-400 font-bold text-[10px] uppercase px-2.5 py-1 rounded-md backdrop-blur">
                        {art.category}
                      </span>
                    </div>
                    <div className="p-5 space-y-2">
                      <span className="text-[10px] text-emerald-400 font-semibold">{art.read_time} • {art.published_at}</span>
                      <h3 className="font-bold text-base leading-snug">{art.title}</h3>
                      <p className={`text-xs line-clamp-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{art.excerpt}</p>
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <a href={`/article/${art.slug}`} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                      <span>Read Article</span> <ArrowUpRight size={14} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "agency" && (
          <section className="text-center py-16 space-y-6">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ⚡ BlissMedia — Digital Agency & Store Platform
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
              Crafting High-Converting <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Digital Experiences & E-Products
              </span>
            </h1>
            <p className={`max-w-xl mx-auto text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              BlissMedia merges high-end digital design with your backend CMS for seamless article publishing and e-book sales.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <button 
                onClick={() => setActiveTab("ebooks")}
                className="bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider"
              >
                Browse E-Book Store
              </button>
              <button 
                onClick={() => setActiveTab("articles")}
                className={`px-6 py-3 rounded-xl text-xs font-bold border ${isDark ? "border-emerald-800 text-slate-200" : "border-slate-300 text-slate-800"}`}
              >
                Read Articles
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className={`border-t py-8 text-center text-xs ${
        isDark ? "border-emerald-900/40 bg-[#020906] text-slate-400" : "border-slate-200 bg-white text-slate-500"
      }`}>
        <p>© {new Date().getFullYear()} BlissMedia. All rights reserved.</p>
      </footer>
    </div>
  );
}
