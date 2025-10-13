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

                        <div className="mt-4 rounded-xl border border-cyber-green/20 bg-terminal-bg/50 p-4">
                            {summary ? (
                                <p className="text-gray-300 text-sm leading-7">{summary}</p>
                            ) : (
                                <p className="text-gray-300 text-sm leading-7">Easy cowboy — the vault isn’t open yet. When HTB stamps “Retired,” the walkthrough will parachute in with style.</p>
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
                                <p className="text-sm text-cyber-blue font-semibold">Try similar machines</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-lg border border-cyber-purple/20 bg-terminal-bg/40 p-3">
                                <p className="text-xs text-gray-400">Heads-up</p>
                                <p className="text-sm text-cyber-purple font-semibold">We respect HTB’s rules</p>
                            </motion.div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/machines/htb"
                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white bg-cyber-green border-2 border-cyber-green hover:bg-cyber-blue focus:outline-none focus:ring-2 focus:ring-cyber-green focus:ring-offset-2 focus:ring-offset-terminal-bg transition"
                            >
                                ← Back to HTB Machines
                            </Link>
                            <a
                                href="https://hackthebox.com"
                                target="_blank"
                                rel="noopener"
                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-gray-200 border border-cyber-green/30 hover:border-cyber-green focus:outline-none focus:ring-2 focus:ring-cyber-green focus:ring-offset-2 focus:ring-offset-terminal-bg transition"
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


