'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import CyberMemePopup from '@/components/CyberMemePopup';
import { FaReddit, FaStackOverflow, FaArrowUp, FaCommentAlt, FaLaugh } from 'react-icons/fa';

interface ForumPost {
  title: string;
  link: string;
  upvotes: number;
  comments: number;
  source: string;
}

const Forums = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [allPosts, setAllPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reddit');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMemePopup, setShowMemePopup] = useState(false);

  // Check if user should see the daily meme (once per day)
  useEffect(() => {
    const today = new Date().toDateString();
    const lastMemeDate = localStorage.getItem('lastMemeDate');
    
    console.log('Meme check - Last meme date:', lastMemeDate, 'Today:', today);
    console.log('Should show meme?', lastMemeDate !== today);
    
    if (lastMemeDate !== today) {
      console.log('Showing daily meme popup...');
      // Show meme popup after a short delay for better UX
      const timer = setTimeout(() => {
        console.log('Setting showMemePopup to true');
        setShowMemePopup(true);
        localStorage.setItem('lastMemeDate', today);
      }, 2000); // 2 second delay
      
      return () => clearTimeout(timer);
    } else {
      console.log('Meme already shown today, skipping auto-popup');
    }
  }, []);

  // Check for URL search parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  // Fetch posts data
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/forums?source=${activeTab}&fresh=true&t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        const data = await response.json();
        setAllPosts(data);
        setPosts(data);
      } catch (error) {
        console.error(`Failed to fetch ${activeTab} posts:`, error);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [activeTab]);

  // Filter posts based on search term
  useEffect(() => {
    if (searchTerm && allPosts.length > 0) {
      const filtered = allPosts.filter((post: ForumPost) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setPosts(filtered);
    } else {
      setPosts(allPosts);
    }
  }, [searchTerm, allPosts]);

  const renderPost = (post: ForumPost, index: number) => (
    <div 
      key={index} 
      className="bg-card-bg border border-cyber-green/30 rounded-lg p-4 sm:p-6 hover:border-cyber-blue transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <h2 className="text-base sm:text-lg font-bold text-cyber-green mb-3 sm:mb-2 leading-tight">
        <a href={post.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {post.title}
        </a>
      </h2>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0 text-sm text-gray-400">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-1">
            <FaArrowUp className="text-orange-500 text-sm" />
            <span>{post.upvotes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaCommentAlt className="text-blue-400 text-sm" />
            <span>{post.comments}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {post.source === 'Reddit' && <FaReddit className="text-orange-600" />}
          {post.source === 'Stack Overflow' && <FaStackOverflow className="text-orange-500" />}
          <span>{post.source}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="py-6 sm:py-8 lg:py-12">
        <header className="text-center mb-8 sm:mb-10 lg:mb-12 px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-cyber font-bold" data-text="Forum Feeds">
            Forum Feeds
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-cyber-blue mt-3 sm:mt-4">
            [ Real-time discussions from the community ]
          </p>
          
          {/* Daily Meme Button */}
          <div className="mt-4 sm:mt-6">
            <button
              onClick={() => setShowMemePopup(true)}
              className="inline-flex items-center space-x-2 bg-cyber-purple text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold hover:bg-cyber-pink transition-all duration-300 shadow-lg hover:shadow-cyber-purple/50 transform hover:scale-105 text-sm sm:text-base"
            >
              <FaLaugh className="animate-bounce text-sm sm:text-base" />
              <span>Daily Cyber Meme</span>
            </button>
            <p className="text-xs text-gray-400 mt-2">
              🎭 Premium cybersecurity humor - curated & fresh daily!
            </p>
          </div>
        </header>

        <div className="flex justify-center mb-6 sm:mb-8 px-4">
          <div className="bg-card-bg border border-cyber-green/30 rounded-lg p-1.5 sm:p-2 flex space-x-1 sm:space-x-2 w-full max-w-md">
            <button
              onClick={() => setActiveTab('reddit')}
              className={`flex-1 px-4 sm:px-6 py-2 rounded-md font-bold transition-colors text-sm sm:text-base ${
                activeTab === 'reddit' ? 'bg-cyber-green text-white' : 'text-cyber-green hover:bg-cyber-green/20'
              }`}
            >
              Reddit
            </button>
            <button
              onClick={() => setActiveTab('stackoverflow')}
              className={`flex-1 px-4 sm:px-6 py-2 rounded-md font-bold transition-colors text-sm sm:text-base ${
                activeTab === 'stackoverflow' ? 'bg-cyber-green text-white' : 'text-cyber-green hover:bg-cyber-green/20'
              }`}
            >
              Stack Overflow
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className="max-w-lg mx-auto mb-6 sm:mb-8 px-4">
          <input
            type="text"
            placeholder="Search forum posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-terminal-bg border border-cyber-green/50 px-3 sm:px-4 py-2 rounded text-cyber-green focus:border-cyber-green focus:outline-none text-sm sm:text-base"
          />
          {searchTerm && (
            <p className="text-xs sm:text-sm text-cyber-blue mt-2 text-center">
              Found {posts.length} posts matching &quot;{searchTerm}&quot;
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center px-4">
            <p className="text-lg sm:text-xl animate-pulse">Loading feed from {activeTab}...</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-4">
            {posts.map(renderPost)}
          </div>
        )}
      </div>

      {/* Meme Popup */}
      {showMemePopup && (
        <CyberMemePopup onClose={() => setShowMemePopup(false)} />
      )}
    </Layout>
  );
};

export default Forums;
