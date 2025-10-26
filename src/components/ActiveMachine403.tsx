"use client";

import Link from 'next/link';
import GlitchText from '@/components/GlitchText';
import { motion } from 'framer-motion';

interface ActiveMachine403Props {
    machineName?: string;
    summary?: string | null;
}

export default function ActiveMachine403({ machineName, summary }: ActiveMachine403Props) {
	return (
        <div className="relative min-h-[75vh] flex items-center justify-center px-4">
            {/* Ambient accents */}
            <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full bg-cyber-green/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-cyber-blue/10 blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-4xl"
            >
                {/* Animated neon border container */}
                <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-cyber-green/40 via-cyber-blue/30 to-cyber-purple/40">
                    <div className="rounded-2xl bg-card-bg/90 backdrop-blur-md p-6 md:p-8 border border-cyber-green/20">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-wider text-cyber-green border border-cyber-green/30 rounded-full px-3 py-1 bg-terminal-bg/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                            Access Gatekeeper
                        </div>

                        {/* Title */}
                        <div className="mt-4">
                            <GlitchText text={`403 — ACCESS DENIED`} className="text-3xl sm:text-5xl font-extrabold" />
                            {machineName && (
                                <p className="mt-1 text-cyber-blue text-sm">Target: {machineName}</p>
                            )}
                        </div>

                        {/* Description / Summary */}
                        <p className="mt-4 text-sm sm:text-base text-gray-300">
                            This write-up is <b className="text-pink-400">CLASSIFIED</b> until the HTB team files the retirement paperwork. No peeking.
                        </p>

                        {/* Access Request Notice */}
                        <div className="mt-4 rounded-xl border border-cyber-purple/30 bg-gradient-to-r from-cyber-purple/10 to-cyber-blue/10 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyber-purple/20 border border-cyber-purple/30 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-cyber-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-cyber-purple mb-1">Want Access to This Writeup?</p>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        Due to HackTheBox policy compliance, our writeups are now private. Register below to get approved access to all content.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-cyber-green/20 bg-terminal-bg/50 p-4">
                            {summary ? (
                                <p className="text-gray-300 text-sm leading-7">{summary}</p>
                            ) : (
                                <p className="text-gray-300 text-sm leading-7">
                                    Easy cowboy — the vault isn&apos;t open yet. When HTB stamps &quot;Retired,&quot; the walkthrough will parachute in with style.
                                </p>
                            )}
                        </div>

                        {/* Quick tips / features */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-lg border border-cyber-green/20 bg-terminal-bg/40 p-3">
                                <p className="text-xs text-gray-400">Status</p>
                                <p className="text-sm text-cyber-green font-semibold">Active — Write-up locked</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-lg border border-cyber-blue/20 bg-terminal-bg/40 p-3">
                                <p className="text-xs text-gray-400">What to do</p>
                                <p className="text-sm text-cyber-blue font-semibold">Request access below</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-lg border border-cyber-purple/20 bg-terminal-bg/40 p-3">
                                <p className="text-xs text-gray-400">Heads-up</p>
                                <p className="text-sm text-cyber-purple font-semibold">We respect HTB&apos;s rules</p>
                            </motion.div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex flex-wrap gap-3">
                            {/* Request Access Button - Primary CTA */}
                            <a
                                href="https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=lbZWMaiaIk6_D7mkunixOGT8tOexBK9KgvG_bi_PFrRUOFMyVVA1MTc1WjBSUTEwRkZYUTZOUk9VWC4u"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold text-terminal-bg bg-cyber-green border-2 border-cyber-green hover:bg-cyber-green/90 hover:shadow-lg hover:shadow-cyber-green/50 focus:outline-none focus:ring-2 focus:ring-cyber-green focus:ring-offset-2 focus:ring-offset-terminal-bg transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Request Access
                            </a>
                            
                            <Link
                                href="/machines/htb"
                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-gray-200 border border-cyber-green/30 hover:border-cyber-green hover:text-white focus:outline-none focus:ring-2 focus:ring-cyber-green focus:ring-offset-2 focus:ring-offset-terminal-bg transition"
                            >
                                ← Back to HTB Machines
                            </Link>
                            
                            <a
                                href="https://hackthebox.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-gray-200 border border-cyber-blue/30 hover:border-cyber-blue hover:text-white focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:ring-offset-2 focus:ring-offset-terminal-bg transition"
                            >
                                Hack another box
                            </a>
                        </div>
                    </div>

                    {/* Animated border glow */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl animate-pulse bg-gradient-to-r from-cyber-green/10 via-transparent to-cyber-blue/10" />
                </div>
            </motion.div>
        </div>
	);
}
