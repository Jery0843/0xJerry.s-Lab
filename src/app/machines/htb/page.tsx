'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import MachineCard from '@/components/MachineCard';
import AddMachineModal from '@/components/AddMachineModal';
import { FaPlus, FaFilter, FaSearch, FaSync } from 'react-icons/fa';
import machinesData from '@/data/machines.json';

interface Machine {
  id: string;
  name: string;
  os: string;
  difficulty: string;
  status: string;
  dateCompleted: string | null;
  tags: string[];
  writeup: string | null;
}

const Machines = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOS, setFilterOS] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch machines from D1 database
  const fetchMachines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/htb-machines-d1');
      const data = await response.json();
      
      if (response.ok) {
        // Handle both direct array and object with machines property
        const machinesArray = Array.isArray(data) ? data : (data.machines || []);
        setMachines(machinesArray);
      } else {
        // Fallback to default data if API fails
        console.warn('D1 API not available, using fallback data:', data.error);
        setMachines(machinesData);
        setError('Using cached data - database temporarily unavailable');
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      setMachines(machinesData);
      setError('Failed to load machines from database');
    } finally {
      setLoading(false);
    }
  };

  // Load machines data on component mount and check admin session
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await fetch('/api/admin/auth');
        const data = await response.json();
        setIsAdminMode(data.authenticated || false);
      } catch (error) {
        console.error('Error checking admin session:', error);
        setIsAdminMode(false);
      }
    };
    
    checkAdminSession();
    fetchMachines();
  }, []);

  // Listen for admin mode changes from header
  useEffect(() => {
    const handleAdminModeChange = async () => {
      try {
        const response = await fetch('/api/admin/auth');
        const data = await response.json();
        setIsAdminMode(data.authenticated || false);
      } catch (error) {
        console.error('Error checking admin session:', error);
        setIsAdminMode(false);
      }
    };

    window.addEventListener('adminModeChanged', handleAdminModeChange);

    return () => {
      window.removeEventListener('adminModeChanged', handleAdminModeChange);
    };
  }, []);

  useEffect(() => {
    let filtered = machines;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(machine =>
        machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // OS filter
    if (filterOS !== 'All') {
      filtered = filtered.filter(machine => machine.os === filterOS);
    }

    // Difficulty filter
    if (filterDifficulty !== 'All') {
      filtered = filtered.filter(machine => machine.difficulty === filterDifficulty);
    }

    // Status filter
    if (filterStatus !== 'All') {
      filtered = filtered.filter(machine => machine.status === filterStatus);
    }

    setFilteredMachines(filtered);
  }, [machines, searchTerm, filterOS, filterDifficulty, filterStatus]);

  const handleAddMachine = async (newMachine: Omit<Machine, 'id'>) => {
    try {
      setError(null);
      const response = await fetch('/api/admin/htb-machines-d1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newMachine),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle development mode gracefully
        if (response.status === 503 && errorData.error?.includes('Database not available')) {
          setError('⚠️ Running in development mode - database operations not available');
          return;
        }
        
        throw new Error(errorData.error || 'Failed to add machine');
      }

      const result = await response.json();
      const addedMachine = result.machine;
      setMachines(prev => [...prev, addedMachine]);
      
      // Show success message
      setError('✅ Machine added successfully!');
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('Error adding machine:', error);
      setError(`❌ Failed to add machine: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateMachine = async (updatedMachine: Machine) => {
    try {
      setError(null);
      const response = await fetch('/api/admin/htb-machines-d1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedMachine),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle development mode gracefully
        if (response.status === 503 && errorData.error?.includes('Database not available')) {
          setError('⚠️ Running in development mode - database operations not available');
          return;
        }
        
        throw new Error(errorData.error || 'Failed to update machine');
      }

      const result = await response.json();
      const updated = result.machine;
      setMachines(prev => prev.map(m => m.id === updated.id ? updated : m));
      
      // Show success message
      setError('✅ Machine updated successfully!');
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('Error updating machine:', error);
      setError(`❌ Failed to update machine: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteMachine = async (machineId: string) => {
    if (!confirm('Are you sure you want to delete this machine?')) {
      return;
    }
    
    try {
      setError(null);
      const response = await fetch(`/api/admin/htb-machines-d1?id=${machineId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete machine');
      }

      setMachines(prev => prev.filter(m => m.id !== machineId));
      
      // Show success message
      setError('✅ Machine deleted successfully!');
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('Error deleting machine:', error);
      setError(`❌ Failed to delete machine: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleViewWriteup = (machine: Machine) => {
    // Redirect to individual machine page
    window.location.href = `/machines/htb/${machine.id}`;
  };

  const stats = {
    total: machines.length,
    completed: machines.filter(m => m.status === 'Completed').length,
    inProgress: machines.filter(m => m.status === 'In Progress').length,
    easy: machines.filter(m => m.difficulty === 'Easy').length,
    medium: machines.filter(m => m.difficulty === 'Medium').length,
    hard: machines.filter(m => m.difficulty === 'Hard').length,
  };

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-cyber font-bold" data-text="HTB Machines">
              HTB Machines
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchMachines}
              disabled={loading}
              className="bg-cyber-blue text-white px-4 py-3 rounded-lg font-bold hover:bg-cyber-purple transition-colors flex items-center space-x-2 border-2 border-cyber-blue"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            {isAdminMode && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-cyber-green text-black px-6 py-3 rounded-lg font-bold hover:bg-cyber-blue hover:text-white transition-colors flex items-center space-x-2 shadow-lg border-2 border-cyber-green"
              >
                <FaPlus />
                <span>Add Machine</span>
              </button>
            )}
          </div>
        </div>

        {/* Error/Success Banner */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg border ${error.includes('✅') ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-red-900/20 border-red-500/50 text-red-400'}`}>
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-6 p-4 rounded-lg bg-cyber-blue/20 border border-cyber-blue/50 text-cyber-blue">
            <div className="flex items-center space-x-2">
              <FaSync className="animate-spin" />
              <span>Loading machines from database...</span>
            </div>
          </div>
        )}

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-card-bg border border-cyber-green/30 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-cyber-green">{stats.total}</div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
          <div className="bg-card-bg border border-cyber-green/30 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="bg-card-bg border border-cyber-green/30 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
            <div className="text-sm text-gray-400">In Progress</div>
          </div>
          <div className="bg-card-bg border border-cyber-green/30 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">{stats.easy}</div>
            <div className="text-sm text-gray-400">Easy</div>
          </div>
          <div className="bg-card-bg border border-cyber-green/30 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.medium}</div>
            <div className="text-sm text-gray-400">Medium</div>
          </div>
          <div className="bg-card-bg border border-cyber-green/30 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-400">{stats.hard}</div>
            <div className="text-sm text-gray-400">Hard</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card-bg border border-cyber-green/30 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-green" />
              <input
                type="text"
                placeholder="Search machines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-terminal-bg border border-cyber-green/50 pl-10 pr-4 py-2 rounded text-cyber-green focus:border-cyber-green focus:outline-none"
              />
            </div>

            {/* OS Filter */}
            <select
              value={filterOS}
              onChange={(e) => setFilterOS(e.target.value)}
              className="bg-terminal-bg border border-cyber-green/50 px-4 py-2 rounded text-cyber-green focus:border-cyber-green focus:outline-none [&>option]:text-white [&>option]:bg-gray-800"
            >
              <option value="All">All OS</option>
              <option value="Linux">Linux</option>
              <option value="Windows">Windows</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-terminal-bg border border-cyber-green/50 px-4 py-2 rounded text-cyber-green focus:border-cyber-green focus:outline-none [&>option]:text-white [&>option]:bg-gray-800"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-terminal-bg border border-cyber-green/50 px-4 py-2 rounded text-cyber-green focus:border-cyber-green focus:outline-none [&>option]:text-white [&>option]:bg-gray-800"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterOS('All');
                setFilterDifficulty('All');
                setFilterStatus('All');
              }}
              className="bg-cyber-green text-black px-4 py-2 rounded font-bold hover:bg-cyber-blue transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Machine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMachines.map((machine) => (
            <MachineCard
              key={machine.id}
              machine={machine}
              isAdminMode={isAdminMode}
              basePath="/machines/htb"
              onViewWriteup={handleViewWriteup}
              onEdit={(machine) => {
                setSelectedMachine(machine);
                setShowAddModal(true);
              }}
              onDelete={handleDeleteMachine}
            />
          ))}
        </div>

        {filteredMachines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No machines found matching your criteria.</p>
          </div>
        )}

        {/* Modals */}
        {showAddModal && (
          <AddMachineModal
            machine={selectedMachine}
            onSave={selectedMachine ? handleUpdateMachine : handleAddMachine}
            onClose={() => {
              setShowAddModal(false);
              setSelectedMachine(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Machines;
