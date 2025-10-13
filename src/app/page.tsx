'use client';

export const dynamic = 'force-dynamic';

import Layout from '@/components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { FaSkull, FaCode, FaBug, FaShieldAlt, FaTerminal, FaEdit, FaSave, FaTimes, FaCog } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import machinesData from '@/data/machines.json';

interface Tool {
  id: string;
  name: string;
  description: string;
  link?: string;
  tags: string[];
  stars?: number;
  language?: string;
  lastUpdated?: string;
  publishedAt?: string;
}

interface Machine {
  id: string;
  name: string;
  os: string;
  difficulty: string;
  status: string;
  dateCompleted: string | null;
  tags: string[];
  writeup: string | null;
  platform?: 'HTB' | 'THM'; // Add platform identifier
}

interface THMRoom {
  id: string;
  title: string;
  name: string;
  difficulty: string;
  status: string;
  dateCompleted: string | null;
  date_completed: string | null;
  tags: string | string[];
  writeup: string | null;
  roomCode: string;
  points: number;
}

interface HTBStats {
  machinesPwned: number;
  globalRanking: number;
  finalScore: number;
  htbRank: string;
  lastUpdated: string;
}

interface THMStats {
  thm_rank: string;
  rooms_completed: number;
  streak: number;
  badges: Array<{ name: string; icon: string; description: string }>;
  last_updated: string;
}

export default function Home() {
  const [displayText, setDisplayText] = useState('');
  const [, setMachines] = useState<Machine[]>([]);
  const [latestMachines, setLatestMachines] = useState<Machine[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [htbStats, setHtbStats] = useState<HTBStats>({
    machinesPwned: 127,
    globalRanking: 15420,
    finalScore: 890,
    htbRank: 'Hacker',
    lastUpdated: new Date().toISOString()
  });

  const [thmStats, setThmStats] = useState<THMStats>({
    thm_rank: 'Beginner',
    rooms_completed: 5,
    streak: 3,
    badges: [],
    last_updated: new Date().toISOString()
  });

  const [adminMode, setAdminMode] = useState(false);

  // Check for admin session from new authentication system
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await fetch('/api/admin/auth');
        const data = await response.json();
        setAdminMode(data.authenticated || false);
      } catch (error) {
        console.error('Error checking admin session:', error);
        setAdminMode(false);
      }
    };
    
    checkAdminSession();
    
    // Listen for admin mode changes from header
    const handleAdminModeChange = () => {
      checkAdminSession();
    };
    
    window.addEventListener('adminModeChanged', handleAdminModeChange);
    
    return () => {
      window.removeEventListener('adminModeChanged', handleAdminModeChange);
    };
  }, []);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingThmField, setEditingThmField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<HTBStats>(htbStats);
  const [editThmValues, setEditThmValues] = useState<THMStats>(thmStats);
  const [saveMessage, setSaveMessage] = useState('');

const fullText = "Chasing root one box at a time — crafting exploits, decoding patterns, and breathing life into logic. This is the digital dojo where exploits evolve into mastery.";

  const [randomChars, setRandomChars] = useState<string[]>(Array(20).fill(''));

  useEffect(() => {
    setRandomChars(Array.from({ length: 20 }, () => String.fromCharCode(65 + Math.random() * 26)));
  }, []);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, []);

  // Fetch tools from API with caching
  useEffect(() => {
    const fetchTools = async () => {
      try {
        // Check cache first (5 minutes for homepage)
        const cached = localStorage.getItem('homepage_tools');
        const cacheTimestamp = localStorage.getItem('homepage_tools_timestamp');
        const now = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        
        if (cached && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
          // Use cached data
          const cachedTools = JSON.parse(cached);
          console.log('Using cached tools:', cachedTools);
          setTools(cachedTools);
          return;
        }
        
        // Fetch fresh data from latest tools and payloads endpoints
        console.log('Fetching fresh tools and payloads data...');
        
        let allTools: Tool[] = [];
        
        // Fetch latest tools
        try {
          const toolsResponse = await fetch('/api/tools/latest?limit=20&fresh=true');
          if (toolsResponse.ok) {
            const toolsData = await toolsResponse.json();
            const latestTools = toolsData.tools || [];
            allTools = [...allTools, ...latestTools];
            console.log('Fetched latest tools:', latestTools.length);
          }
        } catch (error) {
          console.error('Error fetching latest tools:', error);
        }
        
        // Fetch latest payloads
        try {
          const payloadsResponse = await fetch('/api/tools/payloads?limit=20&fresh=true');
          if (payloadsResponse.ok) {
            const payloadsData = await payloadsResponse.json();
            const latestPayloads = (payloadsData.payloads || []).map((payload: any) => ({
              id: payload.id,
              name: payload.name,
              description: payload.description,
              link: undefined, // Payloads don't have external links
              tags: payload.tags || [],
              stars: undefined,
              language: payload.language,
              lastUpdated: payload.lastUpdated || new Date().toISOString()
            }));
            allTools = [...allTools, ...latestPayloads];
            console.log('Fetched latest payloads:', latestPayloads.length);
          }
        } catch (error) {
          console.error('Error fetching latest payloads:', error);
        }
        
        // Remove duplicates by ID and name
        const uniqueTools = allTools.filter((tool, index, self) => 
          index === self.findIndex(t => t.id === tool.id || t.name === tool.name)
        );
        
        // Sort by lastUpdated or publishedAt (newest first), then by stars as fallback
        const sortedTools = uniqueTools.sort((a, b) => {
          const dateA = new Date(a.lastUpdated || a.publishedAt || '1970-01-01').getTime();
          const dateB = new Date(b.lastUpdated || b.publishedAt || '1970-01-01').getTime();
          
          if (dateA !== dateB) {
            return dateB - dateA; // Newest first
          }
          
          // Fallback to stars if dates are the same
          return (b.stars || 0) - (a.stars || 0);
        });
        
        // Get top 3 tools for homepage
        const latestTools = sortedTools.slice(0, 3);
        
        console.log('Final latest tools selected:', latestTools);
        setTools(latestTools);
        
        // Cache the results
        localStorage.setItem('homepage_tools', JSON.stringify(latestTools));
        localStorage.setItem('homepage_tools_timestamp', now.toString());
      } catch (error) {
        console.error('Error fetching tools:', error);
        // Try to use cached data even if expired
        const cached = localStorage.getItem('homepage_tools');
        if (cached) {
          try {
            const cachedTools = JSON.parse(cached);
            console.log('Using expired cached tools due to error:', cachedTools);
            setTools(cachedTools);
          } catch (parseError) {
            console.error('Error parsing cached tools:', parseError);
          }
        }
      }
    };

    fetchTools();
  }, []);

  // Fetch HTB profile stats from D1 database
  useEffect(() => {
    const fetchHTBStats = async () => {
      try {
        // Try D1 API first
        const response = await fetch('/api/admin/htb-stats-d1');
        if (response.ok) {
          const data = await response.json();
          // Convert D1 format to component format
          const statsData = {
            machinesPwned: data.machines_pwned || data.machinesPwned || 127,
            globalRanking: data.global_ranking || data.globalRanking || 15420,
            finalScore: data.final_score || data.finalScore || 890,
            htbRank: data.htb_rank || data.htbRank || 'Hacker',
            lastUpdated: data.last_updated || data.lastUpdated || new Date().toISOString()
          };
          setHtbStats(statsData);
        } else {
          // Fallback to original API
          const fallbackResponse = await fetch('/api/htb-profile');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setHtbStats(fallbackData);
          }
        }
      } catch (error) {
        console.error('Error fetching HTB stats:', error);
        // Keep default stats if both APIs fail
      }
    };

    fetchHTBStats();
    
    // Refresh HTB stats every 5 minutes
    const interval = setInterval(fetchHTBStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch THM profile stats from D1 database
  useEffect(() => {
    const fetchTHMStats = async () => {
      try {
        const response = await fetch('/api/admin/thm-stats-d1');
        if (response.ok) {
          const data = await response.json();
          setThmStats(data);
        }
      } catch (error) {
        console.error('Error fetching THM stats:', error);
        // Keep default stats if API fails
      }
    };

    fetchTHMStats();
    
    // Refresh THM stats every 5 minutes
    const interval = setInterval(fetchTHMStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Load machines and get latest completed ones (both HTB and THM)
  useEffect(() => {
    const loadMachines = async () => {
      let machinesList: Machine[] = [];
      
      // Fetch HTB machines
      try {
        const response = await fetch('/api/admin/htb-machines-d1');
        if (response.ok) {
          const apiData = await response.json();
          if (Array.isArray(apiData) && apiData.length > 0) {
            machinesList = apiData.map((machine: any) => ({
              ...machine,
              platform: 'HTB' as const
            }));
          } else {
            // Fallback to static data
            machinesList = machinesData.map((machine: any) => ({
              ...machine,
              platform: 'HTB' as const
            }));
          }
        } else {
          // Fallback to static data
          machinesList = machinesData.map((machine: any) => ({
            ...machine,
            platform: 'HTB' as const
          }));
        }
      } catch (error) {
        console.error('Error fetching HTB machines from API, using static data:', error);
        machinesList = machinesData.map((machine: any) => ({
          ...machine,
          platform: 'HTB' as const
        }));
      }

      // Fetch THM rooms
      try {
        const thmResponse = await fetch('/api/admin/thm-rooms-d1');
        if (thmResponse.ok) {
          const thmData = await thmResponse.json();
          if (Array.isArray(thmData) && thmData.length > 0) {
            // Convert THM rooms to Machine format
            const thmMachines: Machine[] = thmData.map((room: THMRoom) => ({
              id: room.id,
              name: room.title || room.name,
              os: 'Linux', // Default OS for THM rooms
              difficulty: room.difficulty,
              status: room.status,
              dateCompleted: room.dateCompleted || room.date_completed,
              tags: Array.isArray(room.tags) ? room.tags : (room.tags ? room.tags.split(',').map(t => t.trim()) : []),
              writeup: room.writeup,
              platform: 'THM' as const
            }));
            
            // Merge THM rooms with HTB machines
            machinesList = [...machinesList, ...thmMachines];
          }
        }
      } catch (error) {
        console.error('Error fetching THM rooms:', error);
      }
      
      // Also check localStorage for any additional HTB machines
      const savedMachines = localStorage.getItem('htb-machines');
      if (savedMachines) {
        try {
          const localMachines = JSON.parse(savedMachines);
          if (Array.isArray(localMachines) && localMachines.length > 0) {
            // Merge with API/static data, preferring local data for existing IDs
            const mergedMachines = [...machinesList];
            localMachines.forEach(localMachine => {
              const existingIndex = mergedMachines.findIndex(m => m.id === localMachine.id);
              if (existingIndex >= 0) {
                mergedMachines[existingIndex] = {
                  ...localMachine,
                  platform: 'HTB' as const
                };
              } else {
                mergedMachines.push({
                  ...localMachine,
                  platform: 'HTB' as const
                });
              }
            });
            machinesList = mergedMachines;
          }
        } catch (error) {
          console.error('Error parsing saved machines:', error);
        }
      }
      
      setMachines(machinesList);
      
      // Get latest 3 completed machines (both HTB and THM) sorted by completion date
      const completedMachines = machinesList
        .filter(machine => machine.status === 'Completed' && machine.dateCompleted)
        .sort((a, b) => {
          if (!a.dateCompleted || !b.dateCompleted) return 0;
          return new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime();
        })
        .slice(0, 3);
      
      console.log('Latest completed machines (HTB + THM):', completedMachines);
      setLatestMachines(completedMachines);
    };

    loadMachines();
    
    // Listen for storage changes to update when machines are modified
    const handleStorageChange = () => {
      loadMachines();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically for updates (reduced frequency)
    const interval = setInterval(loadMachines, 30000); // Every 30 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'border-cyber-green';
      case 'medium':
        return 'border-cyber-blue';
      case 'hard':
        return 'border-cyber-pink';
      default:
        return 'border-cyber-purple';
    }
  };

  // Admin functions
  const handleEditField = (field: string) => {
    setEditingField(field);
    setEditValues(htbStats);
  };

  const handleSaveField = async (field: string) => {
    try {
      const updatedStats = {
        ...htbStats,
        [field]: editValues[field as keyof HTBStats],
        lastUpdated: new Date().toISOString()
      };

      // Try D1 API first
      const response = await fetch('/api/admin/htb-stats-d1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session authentication
        body: JSON.stringify({
          machines_pwned: updatedStats.machinesPwned,
          global_ranking: updatedStats.globalRanking,
          final_score: updatedStats.finalScore,
          htb_rank: updatedStats.htbRank,
          last_updated: updatedStats.lastUpdated
        }),
      });

      if (response.ok) {
        setHtbStats(updatedStats);
        setSaveMessage('✅ Saved to database successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        // Fallback to original API
        const fallbackResponse = await fetch('/api/admin/htb-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedStats),
        });
        
        if (fallbackResponse.ok) {
          setHtbStats(updatedStats);
          setSaveMessage('✅ Saved to fallback storage!');
          setTimeout(() => setSaveMessage(''), 3000);
        } else {
          setSaveMessage('❌ Error saving to both database and fallback');
        }
      }
    } catch (error) {
      console.error('Error saving:', error);
      setSaveMessage('❌ Error saving');
    }
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValues(htbStats);
    setEditThmValues(thmStats);
  };

  const handleEditValueChange = (field: keyof HTBStats, value: string | number) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // THM Admin functions
  const handleEditThmField = (field: string) => {
    setEditingThmField(field);
    setEditThmValues(thmStats);
  };

  const handleSaveThmField = async (field: string) => {
    try {
      const updatedStats = {
        ...thmStats,
        [field]: editThmValues[field as keyof THMStats],
        last_updated: new Date().toISOString()
      };

      // Try D1 API for THM
      const response = await fetch('/api/admin/thm-stats-d1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedStats),
      });

      if (response.ok) {
        setThmStats(updatedStats);
        setSaveMessage('✅ THM stats saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('❌ Error saving THM stats');
      }
    } catch (error) {
      console.error('Error saving THM stats:', error);
      setSaveMessage('❌ Error saving THM stats');
    }
    setEditingThmField(null);
  };

  const handleEditThmValueChange = (field: keyof THMStats, value: string | number) => {
    setEditThmValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancelThmEdit = () => {
    setEditingThmField(null);
    setEditThmValues(thmStats);
  };

  // Render editable field
  const renderEditableField = (field: keyof HTBStats, value: string | number, displayValue: string) => {
    if (editingField === field) {
      if (field === 'htbRank') {
        return (
          <div className="flex items-center space-x-2">
            <select
              value={editValues[field] as string}
              onChange={(e) => handleEditValueChange(field, e.target.value)}
              className="text-2xl font-bold text-cyber-blue bg-gray-800 border border-cyber-green rounded px-2"
            >
              <option value="Noob">Noob</option>
              <option value="Script Kiddie">Script Kiddie</option>
              <option value="Hacker">Hacker</option>
              <option value="Pro Hacker">Pro Hacker</option>
              <option value="Elite Hacker">Elite Hacker</option>
              <option value="Guru">Guru</option>
              <option value="Omniscient">Omniscient</option>
            </select>
            <button onClick={() => handleSaveField(field)} className="text-cyber-green hover:text-cyber-green/80">
              <FaSave />
            </button>
            <button onClick={handleCancelEdit} className="text-red-400 hover:text-red-300">
              <FaTimes />
            </button>
          </div>
        );
      } else {
        return (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={editValues[field] as number}
              onChange={(e) => handleEditValueChange(field, parseInt(e.target.value) || 0)}
              className="text-2xl font-bold text-cyber-blue bg-gray-800 border border-cyber-green rounded px-2 w-32"
            />
            <button onClick={() => handleSaveField(field)} className="text-cyber-green hover:text-cyber-green/80">
              <FaSave />
            </button>
            <button onClick={handleCancelEdit} className="text-red-400 hover:text-red-300">
              <FaTimes />
            </button>
          </div>
        );
      }
    }

    return (
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold text-cyber-blue">{displayValue}</span>
        {adminMode && (
          <button
            onClick={() => handleEditField(field)}
            className="text-cyber-green hover:text-cyber-green/80 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FaEdit />
          </button>
        )}
      </div>
    );
  };

  // Render editable THM field
  const renderEditableThmField = (field: keyof THMStats, value: string | number, displayValue: string) => {
    if (editingThmField === field) {
      const thmRankOptions = [
        "0x1 [Neophyte]",
        "0x2 [Apprentice]",
        "0x3 [Pathfinder]",
        "0x4 [Seeker]",
        "0x5 [Visionary]",
        "0x6 [Voyager]",
        "0x7 [Adept]",
        "0x8 [Hacker]",
        "0x9 [Mage]",
        "0xA [Wizard]",
        "0xB [Master]",
        "0xC [Guru]",
        "0xD [Legend]",
        "0xE [Guardian]",
        "0xF [TITAN]",
        "0x10 [SAGE]",
        "0x11 [VANGUARD]",
        "0x12 [SHOGUN]",
        "0x13 [ASCENDED]",
        "0x14 [MYTHIC]",
        "0x15 [ETERNAL]"
      ];

      return (
        <div className="flex items-center space-x-2">
          <select
            value={editThmValues[field as keyof THMStats] as string}
            onChange={(e) => handleEditThmValueChange(field, e.target.value)}
            className="text-lg font-bold text-cyber-purple bg-gray-800 border border-cyber-purple rounded px-2 py-1"
          >
            {thmRankOptions.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
          <button onClick={() => handleSaveThmField(field as string)} className="text-cyber-green hover:text-cyber-green/80">
            <FaSave />
          </button>
          <button onClick={handleCancelThmEdit} className="text-red-400 hover:text-red-300">
            <FaTimes />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold text-cyber-purple">{displayValue}</span>
        {adminMode && (
          <button
            onClick={() => handleEditThmField(field as string)}
            className="text-cyber-green hover:text-cyber-green/80 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FaEdit />
          </button>
        )}
      </div>
    );
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="text-center py-8 sm:py-12 lg:py-16 xl:py-20 relative px-4">
        <div className="absolute inset-0 opacity-10">
<div className="matrix-rain text-matrix-green text-base sm:text-lg lg:text-xl font-mono">
            {randomChars.map((char, i) => (
              <div key={i} className="animate-matrix-rain" style={{ animationDelay: `${i * 0.5}s` }}>
                {char}
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-cyber font-black mb-3 sm:mb-4 lg:mb-6">
            <span data-text="0xJerry">
              0xJerry
            </span>
          </h1>
          
          <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 min-h-[3rem] sm:min-h-[4rem] lg:min-h-[5rem] xl:min-h-[6rem] px-2 sm:px-4 lg:px-8">
            <span className="terminal-cursor inline-block leading-relaxed break-words">{displayText}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-6 xl:space-x-8 mb-6 sm:mb-8 lg:mb-12">
            <div className="flex items-center space-x-2 text-cyber-blue text-xs sm:text-sm lg:text-base">
              <FaSkull className="animate-pulse flex-shrink-0" />
              <span>Penetration Testing</span>
            </div>
            <div className="flex items-center space-x-2 text-cyber-purple text-xs sm:text-sm lg:text-base">
              <FaBug className="animate-pulse flex-shrink-0" />
              <span>Bug Hunting</span>
            </div>
            <div className="flex items-center space-x-2 text-cyber-pink text-xs sm:text-sm lg:text-base">
              <FaShieldAlt className="animate-pulse flex-shrink-0" />
              <span>Red Teaming</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6">
            <Link 
              href="/machines" 
              className="border-2 border-cyber-green text-cyber-green px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-lg font-bold hover:bg-cyber-green hover:text-black transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/50 transform hover:scale-105 text-sm sm:text-base"
            >
              View HTB Labs
            </Link>
            <Link 
              href="/about" 
              className="border border-cyber-green text-cyber-green px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-lg font-bold hover:bg-cyber-green hover:text-black transition-all duration-300 text-sm sm:text-base"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
      

      {/* Stats Dashboard */}
      <section className="py-8 sm:py-12 lg:py-16 px-4">
        {adminMode && (
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center space-x-2 bg-cyber-green/10 border border-cyber-green/30 px-3 sm:px-4 py-2 rounded-lg">
              <FaCog className="text-cyber-green animate-spin text-sm sm:text-base" />
              <span className="text-cyber-green text-xs sm:text-sm font-bold">Admin Mode Active - Hover over stats to edit</span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
          <div className="bg-card-bg border border-cyber-blue/30 p-3 sm:p-4 lg:p-6 rounded-lg hover:border-cyber-blue transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
              <FaShieldAlt className="text-lg sm:text-xl lg:text-2xl text-cyber-blue group-hover:animate-pulse flex-shrink-0" />
              {renderEditableField('htbRank', htbStats.htbRank, htbStats.htbRank)}
            </div>
            <h3 className="text-xs sm:text-sm lg:text-base font-semibold mb-1 lg:mb-2">HTB Rank</h3>
            <p className="text-xs text-gray-400">Current tier level</p>
            {saveMessage && <div className="text-xs mt-2 text-green-400">{saveMessage}</div>}
          </div>
          
          <div className="bg-card-bg border border-cyber-purple/30 p-3 sm:p-4 lg:p-6 rounded-lg hover:border-cyber-purple transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
              <FaShieldAlt className="text-lg sm:text-xl lg:text-2xl text-cyber-purple group-hover:animate-pulse flex-shrink-0" />
              {renderEditableThmField('thm_rank', thmStats.thm_rank, thmStats.thm_rank.toString())}
            </div>
            <h3 className="text-xs sm:text-sm lg:text-base font-semibold mb-1 lg:mb-2">THM Level</h3>
            <p className="text-xs text-gray-400">Current rank</p>
            {saveMessage && <div className="text-xs mt-2 text-green-400">{saveMessage}</div>}
          </div>
        </div>

        {/* THM Badges Section */}
        {thmStats.badges && thmStats.badges.length > 0 && (
          <div className="mt-6 sm:mt-8 max-w-7xl mx-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-cyber-purple text-center">TryHackMe Badges</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {thmStats.badges.slice(0, 4).map((badge, index) => (
                <div key={index} className="bg-card-bg border border-cyber-purple/30 p-3 sm:p-4 rounded-lg text-center hover:border-cyber-purple transition-all duration-300">
                  <div className="text-xl sm:text-2xl mb-2">{badge.icon}</div>
                  <h4 className="font-semibold text-cyber-purple text-xs sm:text-sm mb-1">{badge.name}</h4>
                  <p className="text-xs text-gray-400 leading-tight">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      
      {/* Recent Activity */}
      <section className="py-12 md:py-16 px-4">
        <h2 className="text-2xl md:text-3xl font-cyber font-bold mb-6 md:mb-8 text-center">
          <span data-text="Recent Activity">
            Recent Activity
          </span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-7xl mx-auto">
          {/* Latest Writeups */}
          <div className="bg-card-bg border border-cyber-green/30 p-4 md:p-6 rounded-lg">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-cyber-green">Latest Writeups</h3>
            <div className="space-y-3 md:space-y-4">
              {latestMachines.length > 0 ? (
                latestMachines.map(machine => (
                  <div 
                    key={machine.id} 
                    className={`border-l-4 ${getDifficultyColor(machine.difficulty)} pl-3 md:pl-4 transition-all duration-300 hover:bg-cyber-green/10 py-2`}
                  >
                    <Link href={machine.platform === 'THM' ? `/machines/thm/${machine.id}` : `/machines/htb/${machine.id}`}>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold hover:text-cyber-blue cursor-pointer text-sm md:text-base break-words flex items-center gap-2">
                          {machine.name}
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                            machine.platform === 'HTB' 
                              ? 'bg-cyber-blue/20 text-cyber-blue' 
                              : 'bg-cyber-purple/20 text-cyber-purple'
                          }`}>
                            {machine.platform}
                          </span>
                        </h4>
                      </div>
                    </Link>
                    <p className="text-xs md:text-sm text-gray-400 mb-1 md:mb-2">
                      {machine.platform === 'HTB' ? machine.os : 'TryHackMe'} | {machine.difficulty} | {machine.dateCompleted ? getTimeAgo(machine.dateCompleted) : 'N/A'}
                    </p>
                    {machine.tags && (
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(machine.tags) ? machine.tags : [machine.tags]).slice(0, 3).map((tag, index) => (
                          <span key={index} className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                            machine.platform === 'HTB' 
                              ? 'bg-cyber-blue/20 text-cyber-blue' 
                              : 'bg-cyber-purple/20 text-cyber-purple'
                          }`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-2 text-sm md:text-base">No completed machines yet.</p>
                  <Link href="/machines" className="text-cyber-blue hover:text-cyber-green transition-colors text-sm md:text-base">
                    Start hacking →
                  </Link>
                </div>
              )}
            </div>
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-cyber-green/30">
              <Link href="/machines" className="text-cyber-blue hover:text-cyber-green transition-colors text-xs md:text-sm">
                View all machines →
              </Link>
            </div>
          </div>
          
{/* Tools & Exploits */}
          <div className="bg-card-bg border border-cyber-green/30 p-4 md:p-6 rounded-lg">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-lg md:text-xl font-bold text-cyber-green">Latest Tools & Payloads</h3>
              <button
                onClick={() => {
                  // Clear cache and refetch
                  localStorage.removeItem('homepage_tools');
                  localStorage.removeItem('homepage_tools_timestamp');
                  window.location.reload();
                }}
                className="text-cyber-blue hover:text-cyber-green transition-colors text-sm flex items-center space-x-1"
                title="Refresh tools"
              >
                <FaCode />
                <span>Refresh</span>
              </button>
            </div>
            <div className="space-y-3 md:space-y-4">
              {tools.length > 0 ? (
                tools.map((tool: Tool) => (
                  <div key={tool.id} className="border-l-4 border-cyber-purple pl-3 md:pl-4 hover:bg-cyber-green/10 transition-all duration-300">
                    {tool.link ? (
                      <Link href={tool.link} target="_blank" rel="noopener noreferrer">
                        <h4 className="font-semibold hover:text-cyber-blue cursor-pointer flex items-center gap-2 text-sm md:text-base break-words">
                          <span className="break-all">{tool.name}</span>
                          {tool.stars && <span className="text-xs text-yellow-400 whitespace-nowrap">⭐ {tool.stars}</span>}
                          {(tool.lastUpdated || tool.publishedAt) && (
                            <span className="text-xs text-cyber-green whitespace-nowrap">
                              🕒 {new Date(tool.lastUpdated || tool.publishedAt!).toLocaleDateString()}
                            </span>
                          )}
                        </h4>
                      </Link>
                    ) : (
                      <div>
                        <h4 className="font-semibold text-sm md:text-base break-words flex items-center gap-2">
                          <span className="break-all">{tool.name}</span>
                          <span className="text-xs px-2 py-1 bg-cyber-purple/20 text-cyber-purple rounded">PAYLOAD</span>
                          {(tool.lastUpdated || tool.publishedAt) && (
                            <span className="text-xs text-cyber-green whitespace-nowrap">
                              🕒 {new Date(tool.lastUpdated || tool.publishedAt!).toLocaleDateString()}
                            </span>
                          )}
                        </h4>
                      </div>
                    )}
                    <p className="text-xs md:text-sm text-gray-400 mb-1 md:mb-2 leading-relaxed line-clamp-2">{tool.description}</p>
                    {tool.tags && tool.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tool.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-cyber-green/20 text-cyber-green rounded whitespace-nowrap">
                            {tag}
                          </span>
                        ))}
                        {tool.tags.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-400 rounded">
                            +{tool.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-2 text-sm md:text-base">Loading latest tools and payloads...</p>
                  <Link href="/tools" className="text-cyber-blue hover:text-cyber-green transition-colors text-sm md:text-base">
                    View all tools →
                  </Link>
                </div>
              )}
            </div>
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-cyber-green/30">
              <Link href="/tools" className="text-cyber-blue hover:text-cyber-green transition-colors text-xs md:text-sm">
                View all tools & payloads →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
