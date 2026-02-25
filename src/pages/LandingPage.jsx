import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLandingStore } from '../stores/landingStore';
import { useBillingStore } from '../stores/billingStore';
import { useConfigStore } from '../stores/configStore';

export default function LandingPage() {
    const navigate = useNavigate();
    const cursorRef = useRef(null);
    const { content, loading: landingLoading, loadContent } = useLandingStore();
    const { packages, loadPackages } = useBillingStore();
    const { appName, appLogo } = useConfigStore();

    useEffect(() => {
        if (!content) loadContent();
        if (packages.length === 0) loadPackages();
    }, [content, loadContent, loadPackages, packages.length]);

    useEffect(() => {
        // 1. NAVBAR SCROLL
        const handleScroll = () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        };
        window.addEventListener('scroll', handleScroll);

        // 2. FADE-IN AO SCROLL (IntersectionObserver)
        const animateElements = document.querySelectorAll('[data-animate]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    // 4. ANIMATED COUNTERS
                    if (entry.target.hasAttribute('data-count-to')) {
                        const targetStats = entry.target.querySelectorAll('.stat-number');
                        targetStats.forEach(stat => {
                            if (stat.dataset.animated) return;
                            stat.dataset.animated = "true";
                            const stop = parseInt(stat.getAttribute('data-val'), 10);
                            const duration = 2000;
                            const frameRate = 1000 / 60;
                            const totalFrames = Math.round(duration / frameRate);
                            let frame = 0;
                            const counter = setInterval(() => {
                                frame++;
                                const progress = frame / totalFrames;
                                const currentVal = Math.round(stop * progress);
                                stat.innerText = currentVal;
                                if (frame === totalFrames) {
                                    clearInterval(counter);
                                    stat.innerText = stop + (stat.getAttribute('data-suffix') || '');
                                }
                            }, frameRate);
                        });
                    }
                }
            });
        }, { threshold: 0.1 });

        animateElements.forEach(el => observer.observe(el));

        // 3. CUSTOM CURSOR
        const moveCursor = (e) => {
            if (cursorRef.current && window.innerWidth > 1024) {
                cursorRef.current.style.left = e.clientX + 'px';
                cursorRef.current.style.top = e.clientY + 'px';
            }
        };
        window.addEventListener('mousemove', moveCursor);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', moveCursor);
            observer.disconnect();
        };
    }, [content, landingLoading]);

    // Mobile Menu Toggle
    const toggleMobileMenu = () => {
        const menu = document.getElementById('mobile-menu');
        if (menu) {
            menu.classList.toggle('hidden');
            menu.classList.toggle('flex');
        }
    };

    // FAQ Toggle
    const toggleFaq = (e) => {
        const item = e.currentTarget.parentElement;
        item.classList.toggle('open');
        const contentEl = item.querySelector('.faq-content');
        if (item.classList.contains('open')) {
            contentEl.style.maxHeight = contentEl.scrollHeight + "px";
        } else {
            contentEl.style.maxHeight = "0px";
        }
    };

    if (!content || landingLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-mesh text-white">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-sm font-medium text-slate-900 animate-pulse tracking-widest uppercase">A carregar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="landing-root font-sans text-slate-900 bg-white min-h-screen relative overflow-x-hidden selection:bg-primary/10">
            {/* Custom Cursor */}
            <div ref={cursorRef} className="custom-cursor hidden lg:block"></div>

            {/* Ambient Background Gradients for the whole page */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
                <div className="absolute top-[40%] left-[-5%] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[20%] right-[5%] w-[350px] h-[350px] bg-accent/5 rounded-full blur-[100px]"></div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

                .landing-root {
                    --bg-page: #FB8E7E;
                    --ink: #0f172a;
                    --slate-900: #0f172a;
                    --slate-800: #1e293b;
                    --slate-700: #334155;
                    --slate-600: #475569;
                    --slate-500: #64748b;
                    --slate-400: #94a3b8;
                    --slate-300: #cbd5e1;
                    --slate-200: #e2e8f0;
                    --slate-100: #f1f5f9;
                    --white: #ffffff;
                    --magenta: #db2777;
                    --magenta-light: #f472b6;
                    --primary: #7c3aed; /* Vibrant Purple */
                    --primary-light: #a78bfa;
                    --primary-dark: #5b21b6;
                    --gold: #b8952a;
                    --gold-light: #d4af37;
                    --accent: #f43f5e; /* Vivid Pink/Rose */
                    --radius: 12px;
                    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    --font-serif: 'Cormorant Garamond', serif;
                    font-family: 'Outfit', sans-serif;
                    color: var(--ink);
                    background-color: var(--bg-page);
                }

                .bg-magenta { background-color: var(--magenta); }
                .bg-gold { background-color: var(--gold); }
                .bg-primary { background-color: var(--primary); }
                .text-magenta { color: var(--magenta); }
                .text-gold { color: var(--gold); }
                .text-primary { color: var(--primary); }
                .text-ink { color: var(--ink); }
                .bg-slate-50 { background-color: #f8fafc; }
                .bg-slate-100 { background-color: #f1f5f9; }
                .border-slate-200 { border-color: #e2e8f0; }
                .border-slate-100 { border-color: #f1f5f9; }

                .landing-root h1, .landing-root h2, .landing-root h3, .landing-root h4 {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
}

                /* Mesh Gradient Backgrounds */
                .bg-mesh {
                    background-color: var(--bg-page);
                    background-image: 
                        radial-gradient(circle at 10% 20%, rgba(124, 58, 237, 0.04) 0%, transparent 40%),
                        radial-gradient(circle at 90% 80%, rgba(245, 158, 11, 0.04) 0%, transparent 40%),
                        radial-gradient(circle at 50% 50%, rgba(219, 39, 119, 0.03) 0%, transparent 60%);
                    background-attachment: fixed;
                }

                .bg-vibrant-light {
    background: radial-gradient(circle at top left, hsla(253, 100%, 95%, 1), transparent),
                radial-gradient(circle at bottom right, hsla(339, 100%, 95%, 1), transparent);
}

                /* Glow Text */
                .glow-text {
    background: linear-gradient(to right, var(--primary), var(--accent), var(--gold));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.2));
}

                .landing-root a { cursor: none; }
                .landing-root button { cursor: none; }

                /* Custom Cursor */
                .custom-cursor {
    position: fixed;
    top: 0; left: 0;
    width: 20px; height: 20px;
    background-color: var(--gold);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease-out, background-color 0.3s ease;
    mix-blend-mode: difference; /* Better visibility on all colors */
}

                .landing-root *:hover ~ .custom-cursor {
    transform: scale(1.5);
}

                /* Layout Utilities */
                .section-padding { padding-top: 8rem; padding-bottom: 8rem; }
@media(max-width: 768px) { .section-padding { padding-top: 5rem; padding-bottom: 5rem; } }
                .container-main { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

                /* Components */
                .btn-vibrant {
    background: linear-gradient(135deg, #db2777 0%, #4f46e5 100%);
    color: var(--white);
    padding: 1rem 2rem;
    border-radius: var(--radius);
    font-weight: 700;
    letter-spacing: 0.02em;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 0 10px 30px rgba(79, 70, 229, 0.2);
}
                .btn-vibrant:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(219, 39, 119, 0.3); filter: brightness(1.1); }

                .btn-outline {
    border: 1px solid var(--gold);
    color: var(--gold);
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius);
    transition: var(--transition);
    font-weight: 600;
}
                .btn-outline:hover { background: var(--gold); color: var(--slate-900); }

/* Navbar */
#navbar {
    position: fixed; top: 0; width: 100%; z-index: 100;
    transition: var(--transition);
    padding: 1.5rem 0;
    background: transparent;
}
#navbar.scrolled {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(16px);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding: 1rem 0;
    color: var(--ink);
}

/* Removed grain texture overlay as requested */

/* Animations */
[data-animate] {
    opacity: 0;
    transform: translateY(32px);
    transition: opacity 0.7s ease, transform 0.7s ease;
}
[data-animate].visible {
    opacity: 1;
    transform: translateY(0);
}
[data-animate]:nth-child(2) { transition-delay: 0.1s; }
[data-animate]:nth-child(3) { transition-delay: 0.2s; }
[data-animate]:nth-child(4) { transition-delay: 0.3s; }

/* Separator */
hr.decor {
    border: none;
    border-top: 1px solid var(--gold);
    opacity: 0.4;
    margin: 0;
}

                /* Hero Blob */
                .hero-blob {
    position: absolute; right: -10%; top: -10%;
    width: 60%; height: 80%;
    background: radial-gradient(circle, var(--magenta) 0%, transparent 60%);
    opacity: 0.15;
    z-index: 0;
    filter: blur(80px);
}

                /* Secondary Blob */
                .secondary-blob {
    position: absolute; left: -10%; top: 40%;
    width: 50%; height: 60%;
    background: radial-gradient(circle, var(--gold) 0%, transparent 60%);
    opacity: 0.1;
    z-index: 0;
    filter: blur(80px);
    pointer-events: none;
}

/* Report Mockup */
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
}
                .report-mockup {
    animation: float 5s ease-in-out infinite;
    background: var(--white);
    border-radius: 8px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
    padding: 2rem;
    max-width: 320px;
    margin: 0 auto;
    border: 1px solid rgba(184, 149, 42, 0.1);
}
                @keyframes scan {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(5000%); }
}
                .animate-scan {
    animation: scan 4s linear infinite;
}
                .group:hover .animate-scan {
    animation-duration: 2s;
}

                /* Swatch */
                .swatch-circle {
    width: clamp(60px, 8vw, 100px);
    height: clamp(60px, 8vw, 100px);
    border-radius: 50%;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
    display: flex; align-items: center; justify-content: center;
    position: absolute;
    transition: var(--transition);
}
                .swatch-circle:hover { transform: scale(1.05); }
                .swatch-label {
    opacity: 0; font-size: 0.75rem; text-align: center; font-weight: 500;
    background: rgba(255, 255, 255, 0.9); padding: 2px 6px; border-radius: 4px;
    transition: var(--transition);
}
                .swatch-circle:hover .swatch-label { opacity: 1; }

                /* Animations */
                @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
}
                .scroll-down { animation: bounce 2s infinite; opacity: 0.5; }
`}} />

            {/* 1. NAVBAR */}
            <nav id="navbar" className="fixed w-full z-50 transition-all duration-300">
                <div className="container-main flex justify-between items-center">
                    <a href="#" className="flex items-center gap-2 group">
                        {appLogo ? (
                            <img src={appLogo} alt="Logo" className="h-8 w-auto object-contain" />
                        ) : (
                            <span className="text-gold text-xl group-hover:rotate-45 transition-transform duration-500">✦</span>
                        )}
                        <span className="font-serif text-2xl font-bold tracking-tight text-slate-900">
                            {appName}
                        </span>
                    </a>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-10">
                        <a href="#como-funciona" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors tracking-wide">COMO FUNCIONA</a>
                        <a href="#servicos" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors tracking-wide">SERVIÇOS</a>
                        <a href="#precos" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors tracking-wide">PREÇOS</a>
                        <a href="#faq" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors tracking-wide">FAQ</a>
                        <div className="w-[1px] h-4 bg-slate-200 mx-2"></div>
                        <Link to="/login" className="text-sm font-bold text-slate-900 hover:text-primary transition-colors tracking-wide">LOGIN</Link>
                        <button onClick={() => navigate('/register')} className="bg-gradient-to-r from-[#db2777] to-[#4f46e5] text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">COMEÇAR</button>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="lg:hidden text-slate-900 p-2" onClick={toggleMobileMenu}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                <div id="mobile-menu" className="hidden flex-col bg-white/95 backdrop-blur-xl fixed inset-0 z-[100] p-8 pt-24 gap-8 items-center text-2xl font-serif text-slate-900">
                    <button className="absolute top-6 right-6 text-slate-900" onClick={toggleMobileMenu}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                    <a href="#como-funciona" onClick={toggleMobileMenu} className="hover:text-primary transition-colors">Como Funciona</a>
                    <a href="#servicos" onClick={toggleMobileMenu} className="hover:text-primary transition-colors">Serviços</a>
                    <a href="#precos" onClick={toggleMobileMenu} className="hover:text-primary transition-colors">Preços</a>
                    <a href="#faq" onClick={toggleMobileMenu} className="hover:text-primary transition-colors">FAQ</a>
                    <div className="w-12 h-px bg-slate-200"></div>
                    <button onClick={() => { toggleMobileMenu(); navigate('/login'); }} className="hover:text-primary transition-colors">Login</button>
                    <button onClick={() => navigate('/register')} className="bg-gradient-to-r from-[#db2777] to-[#4f46e5] text-white w-full justify-center mt-4 py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/20">Começar Agora</button>
                </div>
            </nav>

            {/* 2. HERO */}
            <header className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
                <div className="hero-blob opacity-20"></div>
                <div className="container-main relative z-10 w-full">
                    <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">

                        {/* Left Col */}
                        <div className="lg:col-span-7" data-animate>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/10 mb-8">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">{content?.hero?.badge}</span>
                            </div>

                            <h1 className="text-6xl md:text-[5.5rem] leading-[0.9] font-black mb-8 text-slate-900 uppercase tracking-tighter">
                                <span className="glow-text">Descubra</span><br />
                                As Suas Cores
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 max-w-lg mb-10 leading-relaxed font-medium">
                                {content?.hero?.subtitle}
                            </p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-12">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="bg-gradient-to-r from-[#db2777] to-[#4f46e5] text-white px-8 py-4 rounded-xl text-lg font-bold shadow-[0_20px_40px_rgba(79,70,229,0.2)] hover:scale-105 transition-all duration-300"
                                >
                                    → {content?.hero?.ctaText}
                                </button>
                                <a href="#como-funciona" className="text-sm font-bold tracking-[0.2em] uppercase text-slate-800 hover:text-primary transition-colors flex items-center gap-2 group">
                                    Ver como funciona <span className="scroll-down text-primary group-hover:translate-y-1 transition-transform">↓</span>
                                </a>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
                                {content?.hero?.stats?.map((stat, i) => (
                                    <div key={i} className="space-y-1" data-animate data-count-to>
                                        <div className="text-4xl font-bold text-slate-900 stat-number" data-val={stat.value} data-suffix={stat.suffix}>0</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Col - Visual Composition */}
                        <div className="lg:col-span-5 relative h-[500px]" data-animate>
                            <div className="relative w-full h-full flex items-center justify-end lg:pr-12">
                                {/* Main Image: Draping */}
                                <div className="relative z-10 w-full max-w-[440px] aspect-square rounded-[2rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-slate-200 rotate-1 group-hover:rotate-0 transition-all duration-700 bg-white group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 z-20 pointer-events-none"></div>
                                    <img
                                        src="/assets/hero-draping.png"
                                        alt="Color Draping"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                    />

                                    {/* AI Scanning Effect */}
                                    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent animate-scan"></div>
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                    </div>

                                    {/* Decorative UI labels */}
                                    <div className="absolute bottom-6 left-6 z-40 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-200 text-[10px] font-bold tracking-[0.2em] text-slate-900 uppercase shadow-xl flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                        Análise de Cores Realista
                                    </div>
                                </div>

                                {/* Floating Color Swatches - "Gain Form" */}
                                <div className="absolute -bottom-6 -left-12 z-40 flex flex-col gap-3" data-animate>
                                    {['#C0583A', '#B87333', '#B8860B'].map((c, i) => (
                                        <div key={i} className="w-10 h-10 rounded-lg shadow-2xl border-2 border-slate-900/50" style={{ backgroundColor: c, transform: `translateX(${i * 10}px)` }}></div>
                                    ))}
                                </div>

                                {/* Floating Color Wheel */}
                                <div className="absolute -top-16 -right-12 z-20 w-56 h-56 rounded-full overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.4)] animate-spin-slow hover:pause border-[6px] border-slate-900/80 backdrop-blur-sm lg:block hidden">
                                    <img
                                        src="/assets/hero-wheel.png"
                                        alt="Color Wheel"
                                        className="w-full h-full object-cover scale-110"
                                    />
                                </div>

                                {/* Decorative Dots/Shapes */}
                                <div className="absolute top-1/4 -left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                <div className="absolute bottom-1/4 -right-5 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-pulse delay-700"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 3. SOCIAL PROOF */}
            <div className="py-12 border-y border-slate-200 bg-slate-50 relative z-10">
                <div className="container-main">
                    <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-8">Utilizado por profissionais de</p>
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 font-serif text-xl tracking-wider text-slate-700 font-medium">
                        {content?.hero?.showcases?.map((prof, i) => (
                            <React.Fragment key={i}>
                                <span className="hover:text-primary transition-colors">{prof}</span>
                                {i < (content?.hero?.showcases?.length || 0) - 1 && <span className="text-primary/20">✦</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. COMO FUNCIONA */}
            <section id="como-funciona" className="section-padding">
                <div className="container-main">
                    <div className="text-center max-w-2xl mx-auto mb-20" data-animate>
                        <h2 className="text-sm font-sans uppercase tracking-widest text-primary font-bold mb-4">{content?.howItWorks?.title}</h2>
                        <p className="text-4xl md:text-5xl font-medium font-serif leading-tight text-slate-900">{content?.howItWorks?.headline}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
                        {content?.howItWorks?.steps?.map((step, i) => (
                            <div key={i} className="relative group" data-animate>
                                <div className="text-[6rem] leading-none font-serif font-bold text-primary opacity-5 group-hover:opacity-10 transition-opacity duration-500 absolute -top-12 -left-6 z-0 pointer-events-none">{step.num}</div>
                                <div className="relative z-10 pt-8">
                                    <hr className="decor mb-6 border-primary/10 group-hover:border-primary transition-colors" />
                                    <h3 className="text-xl font-bold mb-4 text-slate-900">{step.title}</h3>
                                    <p className="text-slate-600 font-medium leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. SERVIÇOS & 6. PREVIEW */}
            <section id="servicos" className="section-padding">
                <div className="container-main">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">

                        {/* Funcionalidades */}
                        <div data-animate>
                            <h2 className="text-4xl md:text-5xl font-serif font-light mb-12 leading-tight max-w-lg text-slate-900">{content?.services?.headline}</h2>

                            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-12 mb-12">
                                {content?.services?.features?.map((feat, i) => (
                                    <div key={i}>
                                        <div className="text-primary mb-4"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
                                        <h4 className="font-bold mb-2 text-lg text-slate-900">{feat.title}</h4>
                                        <p className="text-sm text-slate-600 font-medium">{feat.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white text-slate-900 p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                                <h4 className="font-serif text-2xl italic mb-6 flex items-center gap-3">
                                    <span className="text-primary">✦</span> E ainda inclui...
                                </h4>
                                <p className="text-base leading-relaxed text-slate-600 font-medium">
                                    {content?.services?.extraText}
                                </p>
                            </div>
                        </div>

                        {/* Mockup */}
                        <div className="lg:pl-10" data-animate>
                            <p className="text-sm font-sans uppercase tracking-widest text-primary mb-8">Vê um relatório real</p>
                            <div className="report-mockup bg-white text-slate-900 p-10 rounded-2xl shadow-2xl relative">
                                <div className="absolute -top-4 -right-4 bg-gold text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Premium Report</div>
                                <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
                                    <div>
                                        <h3 className="font-serif text-3xl mb-1 text-slate-900">Ana Silva</h3>
                                        <p className="text-xs tracking-wider text-slate-400 uppercase font-bold">Análise de Coloração</p>
                                    </div>
                                    <div className="bg-cream px-4 py-2 text-sm font-serif italic text-[#db2777] rounded-lg border border-[#db2777]/10">Outono Quente</div>
                                </div>

                                <h4 className="font-serif text-lg mb-4">Paleta Pessoal</h4>
                                <div className="grid grid-cols-4 gap-3 mb-8">
                                    {[
                                        { c: '#C0583A', n: 'Terracota' }, { c: '#B87333', n: 'Cobre' },
                                        { c: '#6B7B3A', n: 'Musgo' }, { c: '#6B3F2A', n: 'Chocolate' },
                                        { c: '#B8860B', n: 'Dourado' }, { c: '#CC5500', n: 'Ocre' },
                                        { c: '#708238', n: 'Oliva' }, { c: '#800020', n: 'Bordô' }
                                    ].map((color, i) => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <div className="h-10 w-full rounded shadow-sm border border-slate-900/5 rotate-1 hover:rotate-0 transition-transform" style={{ backgroundColor: color.c }}></div>
                                            <span className="text-[10px] text-slate-500 truncate text-center uppercase font-bold">{color.n}</span>
                                        </div>
                                    ))}
                                </div>

                                <h4 className="font-serif text-lg mb-6 text-slate-800 font-bold border-l-2 border-gold pl-3">Vestuário Recomendado</h4>
                                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                    Privilegie cores ricas e texturas pesadas. O branco off-white ou creme deve substituir o branco puro. Opte por tecidos como veludo, camurça e linho pesado para maximizar a sua coloração terrosa.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. PRICING */}
            <section id="precos" className="section-padding">
                <div className="container-main">
                    <div className="text-center max-w-2xl mx-auto mb-20" data-animate>
                        <h2 className="text-4xl md:text-5xl font-medium font-serif mb-6 text-slate-900">{content?.pricing?.headline}</h2>
                        <p className="text-slate-600 font-medium">{content?.pricing?.subheadline}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-center mb-16 relative" data-animate>
                        {packages.map((pack) => (
                            <div key={pack.id} className={`pricing-card text-center flex flex-col transition-all duration-700 relative ${pack.is_popular ? 'bg-gradient-to-br from-primary via-accent to-magenta rounded-[2.5rem] py-14 px-10 scale-110 z-30 shadow-[0_40px_100px_rgba(124,58,237,0.4)] border border-white/20' : 'bg-white border border-slate-200 shadow-xl z-10 hover:z-20 hover:scale-[1.02] p-8 rounded-3xl'} `}>
                                {pack.is_popular && <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gold text-white text-[11px] font-bold px-6 py-2 rounded-full uppercase tracking-widest shadow-[0_10px_20px_rgba(245,158,11,0.3)] z-40">✦ MAIS POPULAR</div>}
                                <h3 className={`text-sm font-bold uppercase tracking-[0.2em] ${pack.is_popular ? 'text-white/80' : 'text-slate-400'} mb-8`}>Pack {pack.name}</h3>
                                <div className={`text-base font-black tracking-widest ${pack.is_popular ? 'text-gold-light' : 'text-primary'} mb-2`}>
                                    {pack.credits} ANÁLISES
                                </div>
                                <div className={`text-[3.5rem] leading-tight mb-8 font-black tracking-tighter ${pack.is_popular ? 'text-white' : 'text-slate-900'}`}>
                                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(pack.price)}
                                </div>

                                <hr className={`border-t mb-8 ${pack.is_popular ? 'border-white/20' : 'border-slate-100'}`} />

                                <ul className={`text-sm font-medium text-left space-y-5 mb-12 flex-1 ${pack.is_popular ? 'text-white/90' : 'text-slate-600'}`}>
                                    <li className="flex items-center gap-3"><span className={pack.is_popular ? 'text-gold-light' : 'text-primary'}>✦</span> {pack.description}</li>
                                    <li className="flex items-center gap-3"><span className={pack.is_popular ? 'text-gold-light' : 'text-primary'}>✦</span> Validade de 1 mês</li>
                                    <li className="flex items-center gap-3"><span className={pack.is_popular ? 'text-gold-light' : 'text-primary'}>✦</span> Análise completa</li>
                                    <li className="flex items-center gap-3"><span className={pack.is_popular ? 'text-gold-light' : 'text-primary'}>✦</span> PDF exportável</li>
                                    <li className="flex items-center gap-3"><span className={pack.is_popular ? 'text-gold-light' : 'text-primary'}>✦</span> CRM integrado</li>
                                    {pack.is_popular && <li className="flex items-center gap-3"><span className="text-gold-light font-bold">✦</span> Suporte prioritário</li>}
                                </ul>
                                <button
                                    onClick={() => navigate('/register')}
                                    className={`w-full py-4 px-6 rounded-2xl transition-all font-bold tracking-widest uppercase text-xs ${pack.is_popular ? 'bg-white text-primary shadow-xl hover:bg-gold hover:text-white' : 'bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100'} transform active:scale-95`}
                                >
                                    Comprar Agora
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-50 p-8 rounded-2xl text-sm text-slate-600 font-medium text-center max-w-3xl mx-auto border border-slate-200 shadow-xl" data-animate>
                        <span className="text-primary font-serif italic text-lg mr-2 font-bold">i</span>
                        <strong>Como funciona a activação:</strong> {content?.pricing?.activationInfo}
                        <div className="mt-6 pt-6 border-t border-slate-100 text-slate-400">
                            Tem questões? <a href={`mailto:${content?.footer?.contactEmail}`} className="text-slate-900 hover:text-primary transition-colors font-bold underline decoration-primary/30">{content?.footer?.contactEmail}</a> &nbsp;&middot;&nbsp; WhatsApp: +244 9XX XXX XXX
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. FAQ */}
            <section id="faq" className="section-padding">
                <div className="container-main max-w-4xl">
                    <div className="text-center mb-16" data-animate>
                        <h2 className="text-4xl md:text-5xl font-serif font-light mb-4">{content?.faq?.headline}</h2>
                    </div>

                    <div className="space-y-4" data-animate>
                        {content?.faq?.items?.map((faq, i) => (
                            <div key={i} className="faq-item bg-white border border-slate-200 rounded-2xl px-8 mb-4 group hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <button className="faq-header w-full text-left focus:outline-none focus-visible:text-primary text-slate-900 flex items-center justify-between py-7" onClick={toggleFaq} >
                                    <span className="text-lg font-medium tracking-wide pr-6">{faq.q}</span>
                                    <svg className="faq-icon w-6 h-6 text-slate-400 transition-transform duration-300 transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                <div className="faq-content text-slate-600 text-sm leading-relaxed overflow-hidden">
                                    <div className="faq-content-inner pb-8 border-t border-slate-100 pt-6">{faq.a}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 10. FINAL CTA */}
            <section className="py-32 bg-white text-slate-900 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="container-main relative z-10" data-animate>
                    <h2 className="text-4xl md:text-7xl font-serif font-bold mb-8 max-w-4xl mx-auto leading-tight text-slate-900">{content?.cta?.headline}</h2>
                    <p className="text-lg md:text-xl text-slate-600 font-medium mb-12 max-w-2xl mx-auto">{content?.cta?.subheadline}</p>
                    <button onClick={() => navigate('/register')} className="bg-gradient-to-r from-[#db2777] to-[#4f46e5] text-white px-12 py-5 rounded-xl text-xl font-bold shadow-2xl shadow-primary/20 mb-12 hover:scale-105 transition-all">→ {content?.cta?.btnText}</button>
                    <p className="text-sm text-primary font-bold uppercase tracking-[0.2em]">Dúvidas? <a href={`mailto:${content?.footer?.contactEmail} `} className="text-slate-900 hover:text-primary transition-colors underline decoration-primary/30">{content?.footer?.contactEmail}</a></p>
                </div>
            </section>

            {/* 11. FOOTER */}
            <footer className="bg-slate-950 text-white py-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
                </div>
                <div className="container-main relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">
                        <div className="col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <span className="text-xl">✦</span>
                                </div>
                                <span className="font-serif text-3xl font-bold tracking-tight text-white">{appName}</span>
                            </div>
                            <p className="text-slate-400 font-medium max-w-sm leading-relaxed mb-8">{content?.footer?.description}</p>
                        </div>
                        <div>
                            <h5 className="font-serif font-bold text-gold mb-4 uppercase tracking-wider text-xs">Produto</h5>
                            <ul className="space-y-3 text-sm text-slate-400 font-medium">
                                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a></li>
                                <li><a href="#servicos" className="hover:text-white transition-colors">Serviços</a></li>
                                <li><a href="#precos" className="hover:text-white transition-colors">Preços</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-serif font-bold text-gold mb-4 uppercase tracking-wider text-xs">Empresa</h5>
                            <ul className="space-y-3 text-sm text-slate-400 font-medium">
                                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Termos de Serviço</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-serif font-bold text-gold mb-4 uppercase tracking-wider text-xs">Suporte</h5>
                            <ul className="space-y-3 text-sm text-slate-400 font-medium">
                                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                                <li><a href={`mailto:${content?.footer?.contactEmail} `} className="hover:text-white transition-colors">Email</a></li>
                                {content?.footer?.socialLinks?.instagram && (
                                    <li><a href={content?.footer?.socialLinks?.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        <p>{content?.footer?.copyright}</p>
                        <p className="mt-4 md:mt-0">Desenvolvido com sofisticação em Angola 🇦🇴</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

