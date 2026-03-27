import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="bg-background text-on-surface min-h-screen relative overflow-x-hidden">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 bg-[#0e1416]/80 backdrop-blur-lg border-b border-outline/10">
                <div className="section-container h-20 flex justify-between items-center">
                    <div className="text-2xl font-black font-headline tracking-tighter text-white">Recruito</div>
                    <div className="hidden md:flex items-center gap-8 font-headline font-semibold text-sm">
                        <Link className="text-on-surface-variant hover:text-white transition-colors" to="/employer/dashboard">Employers</Link>
                        <Link className="text-on-surface-variant hover:text-white transition-colors" to="/freelancer/dashboard">Freelancers</Link>
                        <a className="text-on-surface-variant hover:text-white transition-colors" href="#">About</a>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link className="text-on-surface-variant font-headline font-bold hover:text-white text-sm" to="/login">Log In</Link>
                        <Link className="kinetic-gradient text-on-primary px-6 py-2.5 rounded-pill font-headline font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20" to="/signup">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero */}
                <section className="relative pt-40 pb-32 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] -z-10 rounded-full"></div>
                    <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="z-10">
                            <h1 className="font-headline text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] mb-8">
                                Hire Top <span className="text-primary italic">Talent</span>, Faster
                            </h1>
                            <p className="text-lg md:text-xl text-on-surface-variant max-w-lg mb-12 leading-relaxed">
                                The modern marketplace where elite freelancers and forward-thinking companies build the future together.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link className="kinetic-gradient text-on-primary px-8 py-4 rounded-pill font-headline font-bold uppercase tracking-widest text-sm shadow-xl shadow-primary/20 flex items-center gap-2" to="/signup">
                                    Find Talent
                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </Link>
                                <Link className="glass-panel text-white px-8 py-4 rounded-pill font-headline font-bold uppercase tracking-widest text-sm border border-white/10" to="/signup">
                                    Get Hired
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="rounded-card overflow-hidden shadow-2xl border border-white/5">
                                <img alt="Professional Talent" className="w-full aspect-auto object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXdyEFhA7wUTF0AHrkFIR2564Oh0HsHbtPpn8dxdsDa5P-aDU5gpJkVyGiEq1ZH_wMFCh_W7fFmBMhA-YHeM3hakpL2Xt7ZjV-G3kMw-wqvIhvkvJB-0LIlYYmLbzG7vvJ8rXHvf2CZtzsKcEKvfRbsNRGf586NcQz7fqx2N-IQ5Q_hQu0T4xQnFD9uzAZBc-FIRBzUx_XjnZSOrDqkXDTHTQizh3kBOPtxQwCDXa0A_APr8xtxo7XLT92AtjK85jHy7mlq75qnpoL"/>
                            </div>
                            <div className="absolute -bottom-8 -left-8 glass-panel p-6 rounded-card border border-primary/30 max-w-[240px]">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-primary">verified</span>
                                    <span className="font-bold text-sm tracking-tight">Verified Expert</span>
                                </div>
                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-2/3"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits */}
                <section className="py-24 bg-surface/50 border-y border-white/5">
                    <div className="section-container grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <span className="material-symbols-outlined text-4xl text-primary mb-4">bolt</span>
                            <h3 className="text-xl font-bold mb-2">Instant Matches</h3>
                            <p className="text-on-surface-variant text-sm">Find the right skills within minutes, not weeks.</p>
                        </div>
                        <div>
                            <span className="material-symbols-outlined text-4xl text-primary mb-4">chat</span>
                            <h3 className="text-xl font-bold mb-2">Direct Messaging</h3>
                            <p className="text-on-surface-variant text-sm">Communicate straight with decision makers.</p>
                        </div>
                        <div>
                            <span className="material-symbols-outlined text-4xl text-primary mb-4">shield</span>
                            <h3 className="text-xl font-bold mb-2">Secure Deals</h3>
                            <p className="text-on-surface-variant text-sm">Protected payments and verified contracts.</p>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-32">
                    <div className="section-container">
                        <h2 className="text-center font-headline text-4xl md:text-5xl font-bold mb-20">Trusted by the Best</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { name: "Sarah Chen", role: "CTO @ TechFlow", quote: "Recruito found us a lead dev in 48 hours. Incredible speed." },
                                { name: "James Wilson", role: "Design Lead", quote: "The most transparent platform I've ever used for hiring." },
                                { name: "Elena Rodriguez", role: "Founder", quote: "Finally, a direct marketplace that actually works for startups." }
                            ].map((t, i) => (
                                <div key={i} className="glass-panel p-8 rounded-card">
                                    <p className="text-on-surface-variant italic mb-6 leading-relaxed">"{t.quote}"</p>
                                    <div>
                                        <p className="font-bold text-white">{t.name}</p>
                                        <p className="text-xs text-primary font-medium tracking-wide">{t.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 mb-32">
                    <div className="section-container">
                        <div className="bg-surface border border-white/5 p-16 rounded-section text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
                            <h2 className="font-headline text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter">Ready to <span className="text-primary italic">scale</span>?</h2>
                            <p className="text-on-surface-variant mb-12 text-lg">Join the thousands already building with Recruito.</p>
                            <Link className="kinetic-gradient text-on-primary px-12 py-5 rounded-pill font-headline font-bold uppercase tracking-widest text-lg inline-flex items-center gap-3" to="/signup">
                                Start Now
                                <span className="material-symbols-outlined">north_east</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#080f11] py-20 border-t border-white/5">
                <div className="section-container grid grid-cols-2 md:grid-cols-4 gap-12 text-sm text-on-surface-variant">
                    <div className="col-span-2 md:col-span-1">
                        <div className="text-xl font-bold text-white mb-6 font-headline">Recruito</div>
                        <p className="leading-relaxed">Building the global workspace of 2030, today.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Explore</h4>
                        <div className="flex flex-col gap-3">
                            <a href="#" className="hover:text-primary">Employers</a>
                            <a href="#" className="hover:text-primary">Freelancers</a>
                            <a href="#" className="hover:text-primary">Success Stories</a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <div className="flex flex-col gap-3">
                            <a href="#" className="hover:text-primary">About</a>
                            <a href="#" className="hover:text-primary">Careers</a>
                            <a href="#" className="hover:text-primary">Contact</a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Legal</h4>
                        <div className="flex flex-col gap-3">
                            <a href="#" className="hover:text-primary">Privacy</a>
                            <a href="#" className="hover:text-primary">Terms</a>
                        </div>
                    </div>
                </div>
                <div className="section-container mt-20 pt-10 border-t border-white/5 text-center opacity-50 text-xs">
                    © 2024 Recruito. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
