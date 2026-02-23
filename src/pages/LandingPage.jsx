import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLandingStore } from '../stores/landingStore';
import { useBillingStore } from '../stores/billingStore';
import { useConfigStore } from '../stores/configStore';

export default function LandingPage() {
    const navigate = useNavigate();
    const cursorRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { content, loading: landingLoading, loadContent } = useLandingStore();
    const { packages, loadPackages } = useBillingStore();
    const { appName, appLogo, loadConfig } = useConfigStore();

    useEffect(() => {
        if (!content) loadContent();
        if (packages.length === 0) loadPackages();
    }, []);

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
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
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
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-ink animate-pulse">A carregar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="landing-root font-sans text-ink bg-cream min-h-screen relative overflow-x-hidden selection:bg-gold/20">
            {/* Custom Cursor */}
            <div ref={cursorRef} className="custom-cursor hidden lg:block"></div>

            {/* Ambient Background Gradients for the whole page */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-wine/5 rounded-full blur-[100px]"></div>
                <div className="absolute top-[50%] left-[-10%] w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-wine/10 rounded-full blur-[100px]"></div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

                .landing-root {
    --cream: #f8fafc;
    --ink: #0f172a;
    --gold: #db2777; /* Pink */
    --gold-light: #fbcfe8;
    --wine: #7c3aed; /* Purple */
    --blush: #e0e7ff;
    --sage: #c4b5fd;
    --white: #ffffff;
    --muted: #475569;
    --surface: #ffffff;
    --radius: 0.75rem;
    --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: 'Jost', sans-serif;
}

                .landing-root h1, .landing-root h2, .landing-root h3, .landing-root h4, .landing-root.font-serif {
    font-family: 'Cormorant Garamond', serif;
}

                .landing-root a { cursor: none; }
                .landing-root button { cursor: none; }

                /* Custom Cursor */
                .custom-cursor {
    position: fixed;
    top: 0; left: 0;
    width: 12px; height: 12px;
    background-color: var(--gold);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate3d(-100px, -100px, 0);
    transition: transform 0.1s ease-out;
    mix-blend-mode: multiply;
}

                .landing-root *:hover ~ .custom-cursor {
    transform: scale(1.5);
}

                /* Layout Utilities */
                .section-padding { padding-top: 8rem; padding-bottom: 8rem; }
@media(max-width: 768px) { .section-padding { padding-top: 5rem; padding-bottom: 5rem; } }
                .container-main { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

                /* Components */
                .btn-wine {
    background-color: var(--wine);
    color: var(--white);
    padding: 1rem 2rem;
    border-radius: var(--radius);
    font-weight: 500;
    letter-spacing: 0.05em;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}
                .btn-wine:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(107, 31, 42, 0.15); }

                .btn-outline {
    border: 1px solid var(--gold);
    color: var(--ink);
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius);
    transition: var(--transition);
}
                .btn-outline:hover { background: var(--gold); color: var(--white); }

/* Navbar */
#navbar {
    position: fixed; top: 0; width: 100%; z-index: 100;
    transition: var(--transition);
    padding: 1.5rem 0;
    background: transparent;
}
#navbar.scrolled {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 25px rgba(124, 58, 237, 0.1);
    border-bottom: 1px solid rgba(124, 58, 237, 0.1);
    padding: 1rem 0;
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
    background: radial-gradient(circle, var(--wine) 0%, transparent 60%);
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
    border: 1px solid rgba(184, 149, 42, 0.1);
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

                /* Pricing Cards */
                .pricing-card {
    background: var(--surface);
    padding: 3rem 2rem;
    border-radius: var(--radius);
    transition: var(--transition);
    position: relative;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}
                .pricing-card.highlight {
    background: var(--wine) !important;
    color: var(--white);
    transform: scale(1.08); /* Increased scale slightly */
    box-shadow: 0 25px 50px -12px rgba(124, 58, 237, 0.5);
    z-index: 10;
    padding-top: 4rem; /* Make it feel taller */
    padding-bottom: 4rem;
}
@media(max-width: 1024px) {
                    .pricing-card.highlight { transform: scale(1); }
}
                .pricing-card:hover { box-shadow: 0 20px 60px rgba(184, 149, 42, 0.15); transform: translateY(-5px); }
                .pricing-card.highlight:hover { transform: scale(1.05) translateY(-5px); }
@media(max-width: 1024px) { .pricing-card.highlight:hover { transform: translateY(-5px); } }

                .badge-popular {
    position: absolute; top: -12px; right: 2rem;
    background: var(--gold); color: var(--white);
    padding: 4px 12px; font-size: 0.75rem; font-weight: 600;
    letter-spacing: 0.1em; transform: rotate(-2deg);
    border-radius: 2px;
}

                /* FAQ Accordion */
                .faq-item { border-bottom: 1px solid rgba(15, 23, 42, 0.1); }
                .faq-header { padding: 1.5rem 0; cursor: none; display: flex; justify-content: space-between; align-items: center; font-weight: 500; font-size: 1.1rem; color: var(--ink); }
                .faq-content { max-height: 0; overflow: hidden; transition: max-height 0.4s ease; color: var(--ink); line-height: 1.6; opacity: 0.8; }
                .faq-content-inner { padding-bottom: 1.5rem; }
                .faq-icon { transition: transform 0.3s ease; color: var(--gold); }
                .faq-item.open .faq-icon { transform: rotate(180deg); }

/* Scroll Down Indicator */
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
                        <span className="font-serif text-2xl font-semibold tracking-wide">
                            {appName}
                        </span>
                    </a>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#como-funciona" className="text-sm font-medium hover:text-gold transition-colors">Como Funciona</a>
                        <a href="#servicos" className="text-sm font-medium hover:text-gold transition-colors">Serviços</a>
                        <a href="#precos" className="text-sm font-medium hover:text-gold transition-colors">Preços</a>
                        <a href="#faq" className="text-sm font-medium hover:text-gold transition-colors">FAQ</a>
                        <div className="h-4 w-px bg-gold/30"></div>
                        <button onClick={() => navigate('/login')} className="text-sm font-medium hover:text-wine transition-colors">Login</button>
                        <button onClick={() => navigate('/register')} className="btn-wine text-sm py-2 px-6">→ Começar Agora</button>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-ink" onClick={toggleMobileMenu}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                <div id="mobile-menu" className="hidden flex-col bg-[#FAF9F6] fixed inset-0 z-40 p-8 pt-24 gap-6 items-center text-xl font-serif">
                    <button className="absolute top-6 right-6 text-ink" onClick={toggleMobileMenu}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                    <a href="#como-funciona" onClick={toggleMobileMenu}>Como Funciona</a>
                    <a href="#servicos" onClick={toggleMobileMenu}>Serviços</a>
                    <a href="#precos" onClick={toggleMobileMenu}>Preços</a>
                    <a href="#faq" onClick={toggleMobileMenu}>FAQ</a>
                    <button onClick={() => { toggleMobileMenu(); navigate('/login'); }} className="mt-4">Login</button>
                    <button onClick={() => navigate('/register')} className="btn-wine text-lg w-full justify-center mt-4">Começar Agora</button>
                </div>
            </nav>

            {/* 2. HERO */}
            <header className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                <div className="hero-blob"></div>
                <div className="container-main relative z-10 w-full">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">

                        {/* Left Col */}
                        <div className="lg:col-span-7" data-animate>
                            <div className="w-16 h-px bg-gold mb-8"></div>
                            <h1 className="text-6xl md:text-[5.5rem] leading-[0.9] font-light mb-8 text-ink">
                                {content?.hero?.title}
                            </h1>
                            <p className="text-lg md:text-xl text-ink/90 max-w-lg mb-10 leading-relaxed font-medium">
                                {content?.hero?.subtitle}
                            </p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-12">
                                <button onClick={() => navigate('/register')} className="btn-wine text-lg font-medium shadow-md">→ {content?.hero?.ctaText}</button>
                                <a href="#como-funciona" className="text-sm font-bold tracking-widest uppercase text-ink hover:text-wine transition-colors flex items-center gap-2">
                                    Ver como funciona <span className="scroll-down">↓</span>
                                </a>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm tracking-wide text-ink font-medium" data-animate data-count-to>
                                {content?.hero?.stats?.map((stat, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-gold">✦</span>
                                        <span className="font-serif text-3xl font-bold text-ink">
                                            <span className="stat-number" data-val={stat.value} data-suffix={stat.suffix}>0</span>
                                        </span> {stat.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Col - Visual Composition */}
                        <div className="lg:col-span-5 relative h-[500px] hidden md:block" data-animate>
                            {/* Central Focus */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/50 backdrop-blur-md border border-white p-4 rounded-xl shadow-xl z-20 flex items-center gap-3">
                                <span className="text-gold animate-pulse">✦</span>
                                <span className="font-serif text-xl tracking-wide">Outono Quente</span>
                            </div>

                            {/* Floating Swatches */}
                            <div className="swatch-circle z-10" style={{ backgroundColor: '#C0583A', top: '10%', left: '20%' }}>
                                <span className="swatch-label">Terracota</span>
                            </div>
                            <div className="swatch-circle z-0" style={{ backgroundColor: '#FFAD8F', top: '25%', right: '15%', width: '80px', height: '80px' }}>
                                <span className="swatch-label">Pêssego</span>
                            </div>
                            <div className="swatch-circle z-10" style={{ backgroundColor: '#B8860B', bottom: '20%', left: '10%', width: '110px', height: '110px' }}>
                                <span className="swatch-label">Dourado</span>
                            </div>
                            <div className="swatch-circle z-10" style={{ backgroundColor: '#6B7B3A', bottom: '15%', right: '25%' }}>
                                <span className="swatch-label">Verde Musgo</span>
                            </div>
                            <div className="swatch-circle z-0" style={{ backgroundColor: '#E8C5C5', top: '45%', left: '5%', width: '70px', height: '70px' }}>
                                <span className="swatch-label">Blush</span>
                            </div>
                            <div className="swatch-circle z-0" style={{ backgroundColor: '#B87333', top: '60%', right: '10%', width: '90px', height: '90px' }}>
                                <span className="swatch-label">Cobre</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 3. SOCIAL PROOF */}
            <div className="py-8 border-y border-gold/20 bg-surface/50 overflow-hidden">
                <div className="container-main">
                    <p className="text-center text-xs uppercase tracking-[0.2em] text-ink font-semibold mb-6">Utilizado por profissionais de</p>
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 font-serif text-xl tracking-wider text-ink font-medium">
                        {content?.hero?.showcases?.map((prof, i) => (
                            <React.Fragment key={i}>
                                <span>{prof}</span>
                                {i < (content?.hero?.showcases?.length || 0) - 1 && <span className="text-gold">✦</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. COMO FUNCIONA */}
            <section id="como-funciona" className="section-padding">
                <div className="container-main">
                    <div className="text-center max-w-2xl mx-auto mb-20" data-animate>
                        <h2 className="text-sm font-sans uppercase tracking-widest text-gold font-bold mb-4">{content?.howItWorks?.title}</h2>
                        <p className="text-4xl md:text-5xl font-medium font-serif leading-tight">{content?.howItWorks?.headline}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
                        {content?.howItWorks?.steps?.map((step, i) => (
                            <div key={i} className="relative group" data-animate>
                                <div className="text-[6rem] leading-none font-serif font-bold text-wine opacity-20 group-hover:opacity-40 transition-opacity duration-500 absolute -top-12 -left-6 z-0 pointer-events-none">{step.num}</div>
                                <div className="relative z-10 pt-8">
                                    <hr className="decor mb-6 border-gold/40 group-hover:border-wine transition-colors" />
                                    <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                                    <p className="text-ink/90 font-medium leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. SERVIÇOS & 6. PREVIEW */}
            <section id="servicos" className="section-padding bg-surface">
                <div className="container-main">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">

                        {/* Funcionalidades */}
                        <div data-animate>
                            <h2 className="text-4xl md:text-5xl font-serif font-light mb-12 leading-tight max-w-lg">{content?.services?.headline}</h2>

                            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-12 mb-12">
                                {content?.services?.features?.map((feat, i) => (
                                    <div key={i}>
                                        <div className="text-gold mb-4"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
                                        <h4 className="font-bold mb-2 text-lg">{feat.title}</h4>
                                        <p className="text-sm text-ink/90 font-medium">{feat.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-900 text-white p-8 rounded-lg shadow-lg">
                                <h4 className="font-serif text-xl italic mb-4">✦ E ainda inclui...</h4>
                                <p className="text-sm leading-relaxed text-white font-medium">
                                    {content?.services?.extraText}
                                </p>
                            </div>
                        </div>

                        {/* Mockup */}
                        <div className="lg:pl-10" data-animate>
                            <p className="text-sm font-sans uppercase tracking-widest text-gold mb-8">Vê um relatório real</p>
                            <div className="report-mockup bg-white text-ink">
                                <div className="flex justify-between items-start mb-8 border-b border-surface pb-6">
                                    <div>
                                        <h3 className="font-serif text-3xl mb-1">Ana Silva</h3>
                                        <p className="text-xs tracking-wider text-muted uppercase">Análise de Coloração</p>
                                    </div>
                                    <div className="bg-surface px-4 py-2 text-sm font-serif italic text-wine rounded">Outono Quente</div>
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
                                            <div className="h-10 w-full rounded shadow-sm border border-black/5" style={{ backgroundColor: color.c }}></div>
                                            <span className="text-[10px] text-muted truncate text-center uppercase">{color.n}</span>
                                        </div>
                                    ))}
                                </div>

                                <h4 className="font-serif font-bold text-lg mb-2">Vestuário Recomendado</h4>
                                <p className="text-sm text-ink font-medium leading-relaxed line-clamp-3">
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
                        <h2 className="text-4xl md:text-5xl font-medium font-serif mb-6">{content?.pricing?.headline}</h2>
                        <p className="text-ink/90 font-medium">{content?.pricing?.subheadline}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 lg:gap-6 items-stretch mb-16" data-animate>
                        {packages.map((pack) => (
                            <div key={pack.id} className={`pricing-card text-center flex flex-col ${pack.is_popular ? 'highlight' : 'border-2 border-slate-300 shadow-xl'} `}>
                                {pack.is_popular && <div className="badge-popular">✦ MAIS POPULAR</div>}
                                <h3 className={`text-base font-bold uppercase tracking-widest ${pack.is_popular ? 'text-white' : 'text-ink'} mb-6`}>Pack {pack.name}</h3>
                                <div className="mb-2">
                                    <span className="font-sans text-xl font-bold">{pack.credits}</span>
                                    <span className={`font-serif font-medium italic ${pack.is_popular ? 'text-white/90' : 'text-ink'} `}> créditos</span>
                                </div>
                                <div className={`font-serif text-[3.5rem] leading-tight mb-2 font-semibold ${pack.is_popular ? 'text-white' : 'text-ink'} `}>
                                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(pack.price)}
                                </div>
                                <div className={`text-sm font-bold ${pack.is_popular ? 'text-white/90' : 'text-ink/80'} mb-8 tracking-wide uppercase`}>
                                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(pack.price / pack.credits)} / análise
                                </div>

                                <hr className={pack.is_popular ? "border-t border-white/30 mb-8" : "border-t border-slate-300 mb-8"} />

                                <ul className={`text-base font-medium text-left space-y-4 mb-10 flex-1 ${pack.is_popular ? 'text-white' : 'text-ink'} `}>
                                    <li><span className={pack.is_popular ? "text-gold-light" : "text-wine"}>✦</span> {pack.description}</li>
                                    <li><span className={pack.is_popular ? "text-gold-light" : "text-wine"}>✦</span> Validade de 1 mês</li>
                                    <li><span className={pack.is_popular ? "text-gold-light" : "text-wine"}>✦</span> Análise completa</li>
                                    <li><span className={pack.is_popular ? "text-gold-light" : "text-wine"}>✦</span> PDF exportável</li>
                                    <li><span className={pack.is_popular ? "text-gold-light" : "text-wine"}>✦</span> CRM integrado</li>
                                    {pack.is_popular && <li><span className="text-gold-light font-bold">✦</span> Suporte prioritário</li>}
                                </ul>
                                <button
                                    onClick={() => navigate('/register')}
                                    className={pack.is_popular ? "w-full bg-gold hover:bg-gold-light text-white py-3 px-6 rounded transition-colors font-bold shadow-lg mt-auto" : "w-full bg-slate-900 text-white hover:bg-slate-800 py-3 px-6 rounded transition-colors font-bold shadow-md mt-auto"}
                                >
                                    → Comprar Pack
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-surface p-6 rounded text-sm text-ink font-medium text-center max-w-3xl mx-auto border border-slate-300 shadow-sm" data-animate>
                        <span className="text-gold font-serif italic text-lg mr-2">i</span>
                        <strong>Como funciona a activação:</strong> {content?.pricing?.activationInfo}
                        <div className="mt-4 pt-4 border-t border-gold/10">
                            Tem questões? <a href={`mailto:${content?.footer?.contactEmail}`} className="text-ink hover:text-wine">{content?.footer?.contactEmail}</a> &nbsp;&middot;&nbsp; WhatsApp: +244 9XX XXX XXX
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. TESTIMONIALS (Oculto a pedido do utilizador) */}
            {false && (
                <section className="section-padding bg-wine text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>
                    <div className="container-main relative z-10">
                        <h2 className="text-4xl md:text-5xl font-serif font-light text-center mb-16" data-animate>O que dizem os nossos clientes.</h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { q: "Passei a oferecer análise de coloração a todos os meus clientes de consultoria. O relatório é tão profissional que eles ficam impressionados.", n: "Mariana Costa", r: "Consultora de Imagem" },
                                { q: "Em 2 minutos tenho um relatório completo que antes me demorava 1 hora a preparar manualmente. Economizo tempo e impressiono os meus clientes.", n: "Sofia Rodrigues", r: "Personal Stylist" },
                                { q: "Uso o ChromaTest para as minhas alunas de estilismo. Os relatórios são perfeitos como material de estudo e de prática.", n: "Inês Ferreira", r: "Professora de Moda" }
                            ].map((t, i) => (
                                <div key={i} className="p-8 border border-white/20 rounded backdrop-blur-sm bg-white/5" data-animate>
                                    <div className="text-white text-6xl font-serif leading-none h-8 mb-4">"</div>
                                    <p className="text-white leading-relaxed mb-8 italic font-medium">"{t.q}"</p>
                                    <hr className="border-t border-white/20 mb-4" />
                                    <p className="font-serif text-xl font-medium text-white">{t.n}</p>
                                    <p className="text-sm uppercase tracking-wider text-white/80">{t.r}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 9. FAQ */}
            <section id="faq" className="section-padding">
                <div className="container-main max-w-4xl">
                    <div className="text-center mb-16" data-animate>
                        <h2 className="text-4xl md:text-5xl font-serif font-light mb-4">{content?.faq?.headline}</h2>
                    </div>

                    <div className="space-y-2" data-animate>
                        {content?.faq?.items?.map((faq, i) => (
                            <div key={i} className="faq-item">
                                <button className="faq-header w-full text-left focus:outline-none focus-visible:text-wine" onClick={toggleFaq} aria-expanded="false">
                                    <span className="pr-4">{faq.q}</span>
                                    <svg className="faq-icon w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                <div className="faq-content text-sm">
                                    <div className="faq-content-inner">{faq.a}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 10. FINAL CTA */}
            <section className="py-32 bg-slate-900 text-white text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-wine/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="container-main relative z-10" data-animate>
                    <div className="w-20 h-px bg-gold mx-auto mb-10"></div>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8 max-w-3xl mx-auto leading-tight text-white">{content?.cta?.headline}</h2>
                    <p className="text-lg text-white font-medium mb-12 max-w-xl mx-auto">{content?.cta?.subheadline}</p>
                    <button onClick={() => navigate('/register')} className="btn-wine text-lg font-bold px-10 py-4 shadow-2xl mb-8">→ {content?.cta?.btnText}</button>
                    <p className="text-sm text-gold font-bold uppercase tracking-widest">Tem perguntas? <a href={`mailto:${content?.footer?.contactEmail} `} className="text-white hover:text-gold-light transition-colors">{content?.footer?.contactEmail}</a></p>
                </div>
            </section>

            {/* 11. FOOTER */}
            <footer className="bg-slate-900 text-surface py-16">
                <div className="container-main">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                {appLogo ? (
                                    <img src={appLogo} alt="Logo" className="h-8 w-auto object-contain" />
                                ) : (
                                    <span className="text-gold">✦</span>
                                )}
                                <span className="font-serif text-xl font-bold">{appName}</span>
                            </div>
                            <p className="text-sm text-surface/90 font-medium max-w-xs">{content?.footer?.description}</p>
                        </div>
                        <div>
                            <h5 className="font-serif font-bold text-gold mb-4 uppercase tracking-wider text-xs">Produto</h5>
                            <ul className="space-y-3 text-sm text-surface/90 font-medium">
                                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a></li>
                                <li><a href="#servicos" className="hover:text-white transition-colors">Serviços</a></li>
                                <li><a href="#precos" className="hover:text-white transition-colors">Preços</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-serif font-bold text-gold mb-4 uppercase tracking-wider text-xs">Empresa</h5>
                            <ul className="space-y-3 text-sm text-surface/90 font-medium">
                                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Termos de Serviço</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-serif font-bold text-gold mb-4 uppercase tracking-wider text-xs">Suporte</h5>
                            <ul className="space-y-3 text-sm text-surface/90 font-medium">
                                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                                <li><a href={`mailto:${content?.footer?.contactEmail} `} className="hover:text-white transition-colors">Email</a></li>
                                {content?.footer?.socialLinks?.instagram && (
                                    <li><a href={content?.footer?.socialLinks?.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
                                )}
                            </ul>
                        </div>
                    </div>
                    <hr className="border-t border-surface/20 mb-8" />
                    <div className="flex flex-col md:flex-row justify-between items-center text-xs font-medium text-surface/80">
                        <p>{content?.footer?.copyright}</p>
                        <p className="mt-2 md:mt-0">Desenvolvido com sofisticação em Angola 🇦🇴</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

