import React, { useState, useEffect, useRef } from 'react';
import { Users, Trophy, Target, Calendar, Plus, Trash2, Star, ChevronLeft, ChevronRight, Play, Shuffle, X, ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

const Tournament = () => {
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentDate, setTournamentDate] = useState('');
  const [bracketType, setBracketType] = useState('single');
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isNewPlayerMember, setIsNewPlayerMember] = useState(false);
  const [bracket, setBracket] = useState(null);
  const [isDashboardHidden, setIsDashboardHidden] = useState(false);
  
  // New tournament state management
  const [tournamentState, setTournamentState] = useState('setup'); // setup, ready, inProgress, completed
  const [showShuffleDialog, setShowShuffleDialog] = useState(false);
  const [shuffleCount, setShuffleCount] = useState(1);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreData, setScoreData] = useState({ player1Score: '', player2Score: '' });
  
  // Bracket display controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const bracketContainerRef = useRef(null);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer = {
        id: Date.now(),
        name: newPlayerName.trim(),
        isMember: isNewPlayerMember
      };
      const updatedPlayers = [...players, newPlayer];
      setPlayers(updatedPlayers);
      setNewPlayerName('');
      setIsNewPlayerMember(false);
    }
  };

  const removePlayer = (playerId) => {
    const updatedPlayers = players.filter(player => player.id !== playerId);
    setPlayers(updatedPlayers);
  };

  // Auto-generate FULL bracket when players are added
  useEffect(() => {
    if (players.length >= 2 && tournamentName.trim()) {
      generateBracketForPlayers(players, false);
      setTournamentState('ready');
    } else if (players.length < 2) {
      setBracket(null);
      if (tournamentState !== 'setup') {
        setTournamentState('setup');
      }
    }
  }, [players, tournamentName, tournamentDate, bracketType]);

  const generateBracketForPlayers = (playerList, shouldShuffle = false) => {
    if (playerList.length < 2) {
      return;
    }

    let shuffledPlayers = shouldShuffle 
      ? [...playerList].sort(() => Math.random() - 0.5)
      : [...playerList];

    // Handle odd number of players by adding byes
    const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(shuffledPlayers.length)));
    const byesNeeded = powerOfTwo - shuffledPlayers.length;
    
    for (let i = 0; i < byesNeeded; i++) {
      shuffledPlayers.push({ id: `bye-${i}`, name: 'BYE', isBye: true });
    }
    
    // Calculate bracket size (next power of 2)
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(shuffledPlayers.length)));
    const totalRounds = Math.log2(bracketSize);
    
    // Create winners bracket first round
    const winnersFirstRound = [];
    for (let i = 0; i < bracketSize / 2; i++) {
      const player1 = shuffledPlayers[i * 2] || null;
      const player2 = shuffledPlayers[i * 2 + 1] || null;
      
      winnersFirstRound.push({
        id: `winners-1-${i}`,
        player1,
        player2,
        winner: null,
        player1Score: null,
        player2Score: null,
        completed: false,
        status: 'waiting', // waiting, inProgress, completed
        round: 1,
        bracket: 'winners'
      });
    }

    // Create additional winner rounds (empty for now)
    const winnersRounds = [winnersFirstRound];
    for (let round = 2; round <= totalRounds; round++) {
      const roundMatches = [];
      const previousRoundSize = winnersRounds[round - 2].length;
      
      for (let i = 0; i < previousRoundSize / 2; i++) {
        roundMatches.push({
          id: `winners-${round}-${i}`,
          player1: null,
          player2: null,
          winner: null,
          player1Score: null,
          player2Score: null,
          completed: false,
          status: 'waiting',
          round: round,
          bracket: 'winners'
        });
      }
      winnersRounds.push(roundMatches);
    }

    // Create losers bracket structure (double elimination)
    const losersRounds = [];
    if (bracketType === 'double') {
      // Losers bracket has more complex structure
      const losersRoundCount = (totalRounds - 1) * 2;
      
      for (let round = 1; round <= losersRoundCount; round++) {
        const roundMatches = [];
        let matchCount;
        
        if (round % 2 === 1) {
          // Odd rounds: players from winners bracket join
          matchCount = Math.floor(bracketSize / Math.pow(2, Math.floor((round + 1) / 2) + 1));
        } else {
          // Even rounds: only losers bracket progression
          matchCount = Math.floor(bracketSize / Math.pow(2, Math.floor(round / 2) + 2));
        }
        
        for (let i = 0; i < Math.max(1, matchCount); i++) {
          roundMatches.push({
            id: `losers-${round}-${i}`,
            player1: null,
            player2: null,
            winner: null,
            player1Score: null,
            player2Score: null,
            completed: false,
            status: 'waiting',
            round: round,
            bracket: 'losers'
          });
        }
        losersRounds.push(roundMatches);
      }
    }

    setBracket({
      name: tournamentName,
      date: tournamentDate,
      type: bracketType,
      winnersRounds,
      losersRounds,
      grandFinals: {
        id: 'grand-finals',
        player1: null,
        player2: null,
        winner: null,
        player1Score: null,
        player2Score: null,
        completed: false,
        status: 'waiting',
        bracket: 'finals'
      },
      totalPlayers: shuffledPlayers.length,
      bracketSize,
      totalRounds: winnersRounds.length,
      currentRound: 1,
      matchesCompleted: 0,
      totalMatches: winnersRounds.reduce((sum, round) => sum + round.length, 0) + 
                   losersRounds.reduce((sum, round) => sum + round.length, 0) + 1
    });
  };

  const startTournament = () => {
    setShowShuffleDialog(true);
  };

  const confirmStartTournament = (shouldShuffle) => {
    setShowShuffleDialog(false);
    if (shouldShuffle) {
      // Shuffle multiple times based on shuffleCount
      let shuffledPlayers = [...players];
      for (let i = 0; i < shuffleCount; i++) {
        shuffledPlayers = shuffledPlayers.sort(() => Math.random() - 0.5);
      }
      generateBracketForPlayers(shuffledPlayers, false);
    }
    setTournamentState('inProgress');
  };

  const handleMatchClick = (match, action = 'score') => {
    if (tournamentState === 'inProgress' && match.player1 && match.player2) {
      if (action === 'start' && match.status === 'waiting') {
        // Set match to in progress
        updateMatchStatus(match.id, 'inProgress');
      } else if (action === 'score' && !match.completed) {
        setSelectedMatch(match);
        setScoreData({ player1Score: '', player2Score: '' });
        setShowScoreModal(true);
      }
    }
  };

  const handlePlayerClick = (match, player, isPlayer1) => {
    if (tournamentState === 'inProgress' && !match.completed && match.player1 && match.player2) {
      setSelectedMatch(match);
      setSelectedPlayer(isPlayer1 ? 'player1' : 'player2');
      setScoreData({ player1Score: '', player2Score: '' });
      setShowScoreModal(true);
    }
  };

  const updateMatchStatus = (matchId, newStatus) => {
    if (!bracket) return;

    const updatedBracket = { ...bracket };
    let matchFound = false;

    // Update in winners rounds
    updatedBracket.winnersRounds.forEach(round => {
      round.forEach(match => {
        if (match.id === matchId) {
          match.status = newStatus;
          matchFound = true;
        }
      });
    });

    // Update in losers rounds
    updatedBracket.losersRounds.forEach(round => {
      round.forEach(match => {
        if (match.id === matchId) {
          match.status = newStatus;
          matchFound = true;
        }
      });
    });

    // Update grand finals
    if (updatedBracket.grandFinals.id === matchId) {
      updatedBracket.grandFinals.status = newStatus;
      matchFound = true;
    }

    if (matchFound) {
      setBracket(updatedBracket);
    }
  };

  const submitMatchScore = () => {
    if (!selectedMatch || !scoreData.player1Score || !scoreData.player2Score) {
      return;
    }

    const player1Score = parseInt(scoreData.player1Score);
    const player2Score = parseInt(scoreData.player2Score);
    
    if (player1Score === player2Score) {
      alert('Scores cannot be tied. Please enter different scores.');
      return;
    }

    const winner = player1Score > player2Score ? selectedMatch.player1 : selectedMatch.player2;
    const loser = player1Score > player2Score ? selectedMatch.player2 : selectedMatch.player1;

    // Update bracket with match result and advance winner
    const updatedBracket = { ...bracket };
    
    // Find and update the match
    let matchFound = false;
    let currentRound = 0;
    let currentBracket = '';
    
    // Check winners rounds
    updatedBracket.winnersRounds.forEach((round, roundIndex) => {
      round.forEach(match => {
        if (match.id === selectedMatch.id) {
          match.winner = winner;
          match.player1Score = player1Score;
          match.player2Score = player2Score;
          match.completed = true;
          match.status = 'completed';
          currentRound = roundIndex;
          currentBracket = 'winners';
          matchFound = true;

          // Advance winner to next round
          advanceWinnerToNextRound(updatedBracket, winner, roundIndex, 'winners');
          
          // Send loser to losers bracket (double elimination)
          if (bracketType === 'double' && roundIndex === 0) {
            // First round losers go directly to losers bracket
            advanceLoserToLosersBracket(updatedBracket, loser, roundIndex);
          }
        }
      });
    });
    
    // Check losers rounds
    updatedBracket.losersRounds.forEach((round, roundIndex) => {
      round.forEach(match => {
        if (match.id === selectedMatch.id) {
          match.winner = winner;
          match.player1Score = player1Score;
          match.player2Score = player2Score;
          match.completed = true;
          match.status = 'completed';
          matchFound = true;

          // Advance winner in losers bracket
          advanceWinnerToNextRound(updatedBracket, winner, roundIndex, 'losers');
          // Loser is eliminated (no further advancement)
        }
      });
    });
    
    // Check grand finals
    if (updatedBracket.grandFinals.id === selectedMatch.id) {
      updatedBracket.grandFinals.winner = winner;
      updatedBracket.grandFinals.player1Score = player1Score;
      updatedBracket.grandFinals.player2Score = player2Score;
      updatedBracket.grandFinals.completed = true;
      updatedBracket.grandFinals.status = 'completed';
      matchFound = true;
    }

    if (matchFound) {
      // Update match completion count
      updatedBracket.matchesCompleted += 1;
      
      // Check if tournament is complete
      if (updatedBracket.matchesCompleted === updatedBracket.totalMatches) {
        setTournamentState('completed');
      }
      
      setBracket(updatedBracket);
    }

    setShowScoreModal(false);
    setSelectedMatch(null);
    setSelectedPlayer(null);
  };

  const advanceWinnerToNextRound = (bracket, winner, currentRoundIndex, bracketType) => {
    if (bracketType === 'winners') {
      const nextRoundIndex = currentRoundIndex + 1;
      if (nextRoundIndex < bracket.winnersRounds.length) {
        const nextRound = bracket.winnersRounds[nextRoundIndex];
        const matchIndex = Math.floor(currentRoundIndex / 2);
        
        if (nextRound[matchIndex]) {
          if (!nextRound[matchIndex].player1) {
            nextRound[matchIndex].player1 = winner;
          } else if (!nextRound[matchIndex].player2) {
            nextRound[matchIndex].player2 = winner;
          }
        }
      } else if (bracket.type === 'double') {
        // Winner goes to grand finals
        if (!bracket.grandFinals.player1) {
          bracket.grandFinals.player1 = winner;
        }
      }
    } else if (bracketType === 'losers') {
      const nextRoundIndex = currentRoundIndex + 1;
      if (nextRoundIndex < bracket.losersRounds.length) {
        const nextRound = bracket.losersRounds[nextRoundIndex];
        const matchIndex = Math.floor(currentRoundIndex / 2);
        
        if (nextRound[matchIndex]) {
          if (!nextRound[matchIndex].player1) {
            nextRound[matchIndex].player1 = winner;
          } else if (!nextRound[matchIndex].player2) {
            nextRound[matchIndex].player2 = winner;
          }
        }
      } else {
        // Losers bracket champion goes to grand finals
        if (!bracket.grandFinals.player2) {
          bracket.grandFinals.player2 = winner;
        }
      }
    }
  };

  const advanceLoserToLosersBracket = (bracket, loser, roundIndex) => {
    if (bracket.losersRounds.length > 0) {
      const losersFirstRound = bracket.losersRounds[0];
      // Find available spot in losers bracket first round
      for (let match of losersFirstRound) {
        if (!match.player1) {
          match.player1 = loser;
          break;
        } else if (!match.player2) {
          match.player2 = loser;
          break;
        }
      }
    }
  };

  const calculateProgress = () => {
    if (!bracket || tournamentState !== 'inProgress') return 0;
    return Math.round((bracket.matchesCompleted / bracket.totalMatches) * 100);
  };

  const getCurrentRoundText = () => {
    if (!bracket) return '';
    if (tournamentState === 'completed') return 'Tournament Complete';
    return `Round ${bracket.currentRound} of ${bracket.totalRounds}`;
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const toggleDashboard = () => {
    setIsDashboardHidden(!isDashboardHidden);
  };

  return (
    <div className="min-h-screen bg-slate-800 flex relative">
      {/* Left Dashboard */}
      <div className={`${isDashboardHidden ? 'w-0' : 'w-80'} transition-all duration-300 ease-in-out bg-slate-900 overflow-hidden relative`}>
        <div className="p-4 h-full overflow-y-auto">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-600 p-2 rounded-full">
                <Trophy className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-white">Tournament Generator</h1>
            </div>

            {/* Tournament Setup */}
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader className="pb-3">
                <h2 className="text-lg font-semibold text-white">Tournament Details</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="tournament-name" className="text-slate-200 text-sm">Tournament Name</Label>
                  <Input
                    id="tournament-name"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    placeholder="Enter tournament name"
                    className="bg-slate-700 border-slate-600 text-white text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="tournament-date" className="text-slate-200 text-sm">Date</Label>
                  <Input
                    id="tournament-date"
                    type="date"
                    value={tournamentDate}
                    onChange={(e) => setTournamentDate(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white text-sm"
                  />
                </div>

                <div>
                  <Label className="text-slate-200 text-sm">Bracket Type</Label>
                  <div className="flex gap-3 mt-1">
                    <label className="flex items-center text-white text-sm">
                      <input
                        type="radio"
                        value="single"
                        checked={bracketType === 'single'}
                        onChange={(e) => setBracketType(e.target.value)}
                        className="mr-1"
                      />
                      Single
                    </label>
                    <label className="flex items-center text-white text-sm">
                      <input
                        type="radio"
                        value="double"
                        checked={bracketType === 'double'}
                        onChange={(e) => setBracketType(e.target.value)}
                        className="mr-1"
                      />
                      Double
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Players */}
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader className="pb-3">
                <h2 className="text-lg font-semibold text-white">Add Players</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Player name"
                      className="bg-slate-700 border-slate-600 text-white text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                    />
                  </div>
                  <Button onClick={addPlayer} size="sm" type="button" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-member"
                    checked={isNewPlayerMember}
                    onChange={(e) => setIsNewPlayerMember(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="is-member" className="text-slate-200 flex items-center gap-1 text-sm">
                    Member <Star className="h-3 w-3 text-yellow-400" />
                  </Label>
                </div>

                {/* Players List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-slate-700 p-2 rounded border border-slate-600"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{player.name}</span>
                        {player.isMember && (
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        )}
                      </div>
                      <Button
                        onClick={() => removePlayer(player.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-900/20 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="text-slate-400 text-xs">
                  Players: {players.length}
                </div>
              </CardContent>
            </Card>

            {/* Tournament Actions */}
            {tournamentState === 'ready' && (
              <Button
                onClick={startTournament}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Tournament
              </Button>
            )}

            {tournamentState === 'inProgress' && (
              <div className="space-y-3">
                <div className="bg-slate-700 p-3 rounded border border-slate-600">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm font-medium">Tournament Progress</span>
                    <span className="text-slate-300 text-xs">{calculateProgress()}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                  <div className="text-slate-400 text-xs mt-1">{getCurrentRoundText()}</div>
                </div>
              </div>
            )}

            {tournamentState === 'completed' && (
              <div className="bg-yellow-600 p-3 rounded border border-yellow-500">
                <div className="text-center">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-900" />
                  <div className="text-yellow-900 font-semibold text-sm">Tournament Complete!</div>
                  <div className="text-yellow-800 text-xs">Champion: {bracket?.grandFinals?.winner?.name || 'TBD'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Dashboard Arrow - positioned on the right side of dashboard */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <Button
            onClick={toggleDashboard}
            size="sm"
            className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded-l-md rounded-r-none p-2"
          >
            {isDashboardHidden ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Show Dashboard Arrow when hidden - positioned at left edge */}
      {isDashboardHidden && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
          <Button
            onClick={toggleDashboard}
            size="sm"
            className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded-r-md rounded-l-none p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Enhanced Shuffle Confirmation Dialog */}
      {showShuffleDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Start Tournament</h3>
            <p className="text-slate-300 mb-4">
              Would you like to shuffle the players to randomize the bracket seeding?
            </p>
            
            {/* Shuffle Options */}
            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <Label className="text-slate-200 text-sm font-medium mb-3 block">
                Shuffle Options
              </Label>
              <div className="flex items-center gap-3 mb-3">
                <Label className="text-slate-300 text-sm">
                  Number of shuffles:
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={shuffleCount}
                  onChange={(e) => setShuffleCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="w-20 bg-slate-600 border-slate-500 text-white text-center"
                />
              </div>
              <div className="text-slate-400 text-xs">
                Higher numbers = more randomization (1-10 shuffles)
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => confirmStartTournament(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Shuffle {shuffleCount}x & Start
              </Button>
              <Button
                onClick={() => confirmStartTournament(false)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start as Is
              </Button>
              <Button
                onClick={() => {
                  setShowShuffleDialog(false);
                  setShuffleCount(1);
                }}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Score Input Modal */}
      {showScoreModal && selectedMatch && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Enter Match Score</h3>
              <Button
                onClick={() => setShowScoreModal(false)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-200 text-sm">
                    {selectedMatch.player1?.name}
                    {selectedMatch.player1?.isMember && <span className="text-yellow-400 ml-1">★</span>}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={scoreData.player1Score}
                    onChange={(e) => setScoreData({...scoreData, player1Score: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    placeholder="Games won"
                  />
                </div>
                <div>
                  <Label className="text-slate-200 text-sm">
                    {selectedMatch.player2?.name}
                    {selectedMatch.player2?.isMember && <span className="text-yellow-400 ml-1">★</span>}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={scoreData.player2Score}
                    onChange={(e) => setScoreData({...scoreData, player2Score: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    placeholder="Games won"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={submitMatchScore}
                  disabled={!scoreData.player1Score || !scoreData.player2Score}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Submit Score
                </Button>
                <Button
                  onClick={() => setShowScoreModal(false)}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Side - Bracket Display */}
      <div className={`flex-1 relative ${isFullScreen ? 'fixed inset-0 z-50 bg-slate-800' : 'p-6'} overflow-hidden`}>
        {/* Enhanced Bracket Controls - Lower Right */}
        {bracket && (
          <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-3">
            {/* Main Controls */}
            <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-lg p-3">
              <div className="flex items-center gap-3">
                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-md transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  
                  <div className="bg-slate-700 px-3 py-1 rounded-md min-w-[50px] text-center">
                    <span className="text-slate-200 text-sm font-medium">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                  </div>
                  
                  <button
                    onClick={handleZoomIn}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-md transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="border-l border-slate-600 h-8"></div>
                
                {/* Utility Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetView}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-md transition-colors text-xs font-medium"
                    title="Reset View"
                  >
                    Reset
                  </button>
                  
                  <button
                    onClick={handleFullScreen}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-md transition-colors"
                    title="Toggle Fullscreen"
                  >
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Pan Instruction */}
            {!isFullScreen && (
              <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-lg px-3 py-2">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Move className="h-3 w-3" />
                  <span>Click and drag to pan</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bracket Container with Scroll Support */}
        <div 
          ref={bracketContainerRef}
          className="w-full h-full overflow-auto cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            maxHeight: isFullScreen ? '100vh' : '80vh',
            overflowX: 'auto',
            overflowY: 'auto'
          }}
        >
        {bracket ? (
          <div className="space-y-6">
            {/* Tournament Info */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">{bracket.name}</h2>
                  <div className="text-slate-300">
                    {bracket.date} • {bracket.type === 'single' ? 'Single' : 'Double'} Elimination
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Enhanced Large Bracket Visualization */}
            <div 
              className="w-full h-full min-h-screen relative"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
            >
              <svg 
                width="2000" 
                height="1600" 
                className="bg-slate-900 rounded-lg border border-slate-600"
                viewBox="0 0 2000 1600"
                style={{ minWidth: '2000px', minHeight: '1600px' }}
              >
                  {/* Winners Bracket */}
                  <text
                    x="200"
                    y="30"
                    fill="#10b981"
                    fontSize="18"
                    fontFamily="system-ui"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Winners Bracket
                  </text>

                  {/* Winners Bracket Tree Connecting Lines */}
                  {bracket.winnersRounds.map((round, roundIndex) => {
                    if (roundIndex < bracket.winnersRounds.length - 1) {
                      return round.map((match, matchIndex) => {
                        const currentXPos = 100 + (roundIndex * 300);
                        const currentYPos = 120 + (matchIndex * 180) * Math.pow(2, roundIndex);
                        const nextXPos = 100 + ((roundIndex + 1) * 300);
                        const nextYPos = 120 + (Math.floor(matchIndex / 2) * 180) * Math.pow(2, roundIndex + 1);
                        
                        return (
                          <g key={`connection-wr-${roundIndex}-${matchIndex}`}>
                            {/* Horizontal line from match to next round */}
                            <line
                              x1={currentXPos + 200}
                              y1={currentYPos + 60}
                              x2={currentXPos + 240}
                              y2={currentYPos + 60}
                              stroke="#10b981"
                              strokeWidth="2"
                            />
                            
                            {/* Vertical connector line for paired matches */}
                            {matchIndex % 2 === 0 && matchIndex + 1 < round.length && (
                              <>
                                <line
                                  x1={currentXPos + 240}
                                  y1={currentYPos + 60}
                                  x2={currentXPos + 240}
                                  y2={currentYPos + 240}
                                  stroke="#10b981"
                                  strokeWidth="2"
                                />
                                <line
                                  x1={currentXPos + 240}
                                  y1={currentYPos + 150}
                                  x2={nextXPos}
                                  y2={nextYPos + 60}
                                  stroke="#10b981"
                                  strokeWidth="2"
                                />
                              </>
                            )}
                            
                            {/* Single match advancement */}
                            {matchIndex % 2 === 1 && (
                              <line
                                x1={currentXPos + 240}
                                y1={currentYPos + 60}
                                x2={nextXPos}
                                y2={nextYPos + 60}
                                stroke="#10b981"
                                strokeWidth="2"
                              />
                            )}
                          </g>
                        );
                      });
                    }
                    return null;
                  })}
                  
                  {/* Winners Bracket Rounds */}
                  {bracket.winnersRounds.map((round, roundIndex) => {
                    return round.map((match, matchIndex) => {
                      const xPos = 100 + (roundIndex * 300);
                      const yPos = 120 + (matchIndex * 180) * Math.pow(2, roundIndex);
                      const matchHeight = 100;
                      
                      return (
                        <g key={match.id}>
                          {/* Match Box - Enhanced Interactive */}
                          <rect
                            x={xPos}
                            y={yPos}
                            width="200"
                            height={matchHeight + 20}
                            fill={
                              match.completed ? "#22c55e" : 
                              match.status === 'inProgress' ? "#f59e0b" : 
                              "#374151"
                            }
                            stroke={
                              match.completed ? "#16a34a" : 
                              match.status === 'inProgress' ? "#d97706" : 
                              "#10b981"
                            }
                            strokeWidth="2"
                            rx="8"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleMatchClick(match)}
                          />

                          {/* Match Status Indicator */}
                          <text
                            x={xPos + 100}
                            y={yPos + 15}
                            fill="white"
                            fontSize="10"
                            fontFamily="system-ui"
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            {match.status === 'waiting' ? 'WAITING FOR TABLE' :
                             match.status === 'inProgress' ? 'IN PROGRESS' :
                             match.completed ? 'COMPLETED' : ''}
                          </text>
                          
                          {/* Player 1 - Clickable */}
                          <rect
                            x={xPos + 5}
                            y={yPos + 20}
                            width={match.completed ? "150" : "190"}
                            height="36"
                            fill={match.winner === match.player1 ? "#16a34a" : "#1f2937"}
                            stroke={match.winner === match.player1 ? "#22c55e" : "#475569"}
                            strokeWidth="1"
                            rx="4"
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayerClick(match, match.player1, true);
                            }}
                          />
                          <text
                            x={xPos + 12}
                            y={yPos + 42}
                            fill={match.player1?.isBye ? "#94a3b8" : "white"}
                            fontSize="12"
                            fontFamily="system-ui"
                            fontStyle={match.player1?.isBye ? "italic" : "normal"}
                          >
                            {match.player1 ? (
                              match.player1.name.substring(0, 14) + 
                              (match.player1.isMember && !match.player1.isBye ? ' ★' : '')
                            ) : 'TBD'}
                          </text>
                          
                          {/* Player 1 Score */}
                          {match.completed && (
                            <>
                              <rect
                                x={xPos + 160}
                                y={yPos + 20}
                                width="35"
                                height="36"
                                fill="#0f172a"
                                rx="4"
                              />
                              <text
                                x={xPos + 177}
                                y={yPos + 42}
                                fill="white"
                                fontSize="16"
                                fontFamily="system-ui"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {match.player1Score}
                              </text>
                            </>
                          )}
                          
                          {/* Player 2 - Clickable */}
                          <rect
                            x={xPos + 5}
                            y={yPos + 60}
                            width={match.completed ? "150" : "190"}
                            height="36"
                            fill={match.winner === match.player2 ? "#16a34a" : "#1f2937"}
                            stroke={match.winner === match.player2 ? "#22c55e" : "#475569"}
                            strokeWidth="1"
                            rx="4"
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayerClick(match, match.player2, false);
                            }}
                          />
                          <text
                            x={xPos + 12}
                            y={yPos + 82}
                            fill={match.player2?.isBye ? "#94a3b8" : "white"}
                            fontSize="12"
                            fontFamily="system-ui"
                            fontStyle={match.player2?.isBye ? "italic" : "normal"}
                          >
                            {match.player2 ? (
                              match.player2.name.substring(0, 14) + 
                              (match.player2.isMember && !match.player2.isBye ? ' ★' : '')
                            ) : 'TBD'}
                          </text>
                          
                          {/* Player 2 Score */}
                          {match.completed && (
                            <>
                              <rect
                                x={xPos + 160}
                                y={yPos + 60}
                                width="35"
                                height="36"
                                fill="#0f172a"
                                rx="4"
                              />
                              <text
                                x={xPos + 177}
                                y={yPos + 82}
                                fill="white"
                                fontSize="16"
                                fontFamily="system-ui"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {match.player2Score}
                              </text>
                            </>
                          )}
                          
                          {/* Interactive Indicators */}
                          {tournamentState === 'inProgress' && match.player1 && match.player2 && (
                            <>
                              {!match.completed && match.status === 'waiting' && (
                                <text
                                  x={xPos + 100}
                                  y={yPos + 110}
                                  fill="#10b981"
                                  fontSize="9"
                                  fontFamily="system-ui"
                                  textAnchor="middle"
                                >
                                  Click match to start • Click player to score
                                </text>
                              )}
                              {match.status === 'inProgress' && !match.completed && (
                                <text
                                  x={xPos + 100}
                                  y={yPos + 110}
                                  fill="#f59e0b"
                                  fontSize="9"
                                  fontFamily="system-ui"
                                  textAnchor="middle"
                                >
                                  Click player to add score
                                </text>
                              )}
                            </>
                          )}
                          
                          {/* No connecting lines - clean layout */}
                        </g>
                      );
                    });
                  })}
                  
                  {/* Losers Bracket (if double elimination) - Same format as Winners */}
                  {bracket.type === 'double' && bracket.losersRounds.length > 0 && (
                    <>
                      <text
                        x="200"
                        y="800"
                        fill="#ef4444"
                        fontSize="18"
                        fontFamily="system-ui"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Losers Bracket
                      </text>

                      {/* Losers Bracket Tree Connecting Lines */}
                      {bracket.losersRounds.map((round, roundIndex) => {
                        if (roundIndex < bracket.losersRounds.length - 1) {
                          return round.map((match, matchIndex) => {
                            const currentXPos = 100 + (roundIndex * 300);
                            const currentYPos = 900 + (matchIndex * 180) * Math.pow(2, roundIndex);
                            const nextXPos = 100 + ((roundIndex + 1) * 300);
                            const nextYPos = 900 + (Math.floor(matchIndex / 2) * 180) * Math.pow(2, roundIndex + 1);
                            
                            return (
                              <g key={`connection-lr-${roundIndex}-${matchIndex}`}>
                                {/* Horizontal line from match to next round */}
                                <line
                                  x1={currentXPos + 200}
                                  y1={currentYPos + 60}
                                  x2={currentXPos + 240}
                                  y2={currentYPos + 60}
                                  stroke="#ef4444"
                                  strokeWidth="2"
                                />
                                
                                {/* Vertical connector line for paired matches */}
                                {matchIndex % 2 === 0 && matchIndex + 1 < round.length && (
                                  <>
                                    <line
                                      x1={currentXPos + 240}
                                      y1={currentYPos + 60}
                                      x2={currentXPos + 240}
                                      y2={currentYPos + 240}
                                      stroke="#ef4444"
                                      strokeWidth="2"
                                    />
                                    <line
                                      x1={currentXPos + 240}
                                      y1={currentYPos + 150}
                                      x2={nextXPos}
                                      y2={nextYPos + 60}
                                      stroke="#ef4444"
                                      strokeWidth="2"
                                    />
                                  </>
                                )}
                                
                                {/* Single match advancement */}
                                {matchIndex % 2 === 1 && (
                                  <line
                                    x1={currentXPos + 240}
                                    y1={currentYPos + 60}
                                    x2={nextXPos}
                                    y2={nextYPos + 60}
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                  />
                                )}
                              </g>
                            );
                          });
                        }
                        return null;
                      })}
                      
                      {bracket.losersRounds.map((round, roundIndex) => {
                        return round.map((match, matchIndex) => {
                          const xPos = 100 + (roundIndex * 300); // Same spacing as winners
                          const yPos = 900 + (matchIndex * 180) * Math.pow(2, roundIndex); // More separation to prevent overlap
                          const matchHeight = 100;
                          
                          return (
                            <g key={match.id}>
                              {/* Match Box - Enhanced Interactive (Same as Winners) */}
                              <rect
                                x={xPos}
                                y={yPos}
                                width="200"
                                height={matchHeight + 20}
                                fill={
                                  match.completed ? "#dc2626" : 
                                  match.status === 'inProgress' ? "#f59e0b" : 
                                  "#374151"
                                }
                                stroke={
                                  match.completed ? "#b91c1c" : 
                                  match.status === 'inProgress' ? "#d97706" : 
                                  "#ef4444"
                                }
                                strokeWidth="2"
                                rx="8"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleMatchClick(match)}
                              />

                              {/* Match Status Indicator */}
                              <text
                                x={xPos + 100}
                                y={yPos + 15}
                                fill="white"
                                fontSize="10"
                                fontFamily="system-ui"
                                textAnchor="middle"
                                fontWeight="bold"
                              >
                                {match.status === 'waiting' ? 'WAITING FOR TABLE' :
                                 match.status === 'inProgress' ? 'IN PROGRESS' :
                                 match.completed ? 'COMPLETED' : ''}
                              </text>

                              {/* Player 1 - Clickable */}
                              <rect
                                x={xPos + 5}
                                y={yPos + 20}
                                width={match.completed ? "150" : "190"}
                                height="36"
                                fill={match.winner === match.player1 ? "#dc2626" : "#1f2937"}
                                stroke={match.winner === match.player1 ? "#ef4444" : "#475569"}
                                strokeWidth="1"
                                rx="4"
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayerClick(match, match.player1, true);
                                }}
                              />
                              <text
                                x={xPos + 12}
                                y={yPos + 42}
                                fill={match.player1?.isBye ? "#94a3b8" : "white"}
                                fontSize="12"
                                fontFamily="system-ui"
                                fontStyle={match.player1?.isBye ? "italic" : "normal"}
                              >
                                {match.player1 ? (
                                  match.player1.name.substring(0, 14) + 
                                  (match.player1.isMember && !match.player1.isBye ? ' ★' : '')
                                ) : 'TBD'}
                              </text>
                              
                              {/* Player 1 Score */}
                              {match.completed && (
                                <>
                                  <rect
                                    x={xPos + 160}
                                    y={yPos + 20}
                                    width="35"
                                    height="36"
                                    fill="#0f172a"
                                    rx="4"
                                  />
                                  <text
                                    x={xPos + 177}
                                    y={yPos + 42}
                                    fill="white"
                                    fontSize="16"
                                    fontFamily="system-ui"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                  >
                                    {match.player1Score}
                                  </text>
                                </>
                              )}

                              {/* Player 2 - Clickable */}
                              <rect
                                x={xPos + 5}
                                y={yPos + 60}
                                width={match.completed ? "150" : "190"}
                                height="36"
                                fill={match.winner === match.player2 ? "#dc2626" : "#1f2937"}
                                stroke={match.winner === match.player2 ? "#ef4444" : "#475569"}
                                strokeWidth="1"
                                rx="4"
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayerClick(match, match.player2, false);
                                }}
                              />
                              <text
                                x={xPos + 12}
                                y={yPos + 82}
                                fill={match.player2?.isBye ? "#94a3b8" : "white"}
                                fontSize="12"
                                fontFamily="system-ui"
                                fontStyle={match.player2?.isBye ? "italic" : "normal"}
                              >
                                {match.player2 ? (
                                  match.player2.name.substring(0, 14) + 
                                  (match.player2.isMember && !match.player2.isBye ? ' ★' : '')
                                ) : 'TBD'}
                              </text>
                              
                              {/* Player 2 Score */}
                              {match.completed && (
                                <>
                                  <rect
                                    x={xPos + 160}
                                    y={yPos + 60}
                                    width="35"
                                    height="36"
                                    fill="#0f172a"
                                    rx="4"
                                  />
                                  <text
                                    x={xPos + 177}
                                    y={yPos + 82}
                                    fill="white"
                                    fontSize="16"
                                    fontFamily="system-ui"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                  >
                                    {match.player2Score}
                                  </text>
                                </>
                              )}
                              
                              {/* Interactive Indicators */}
                              {tournamentState === 'inProgress' && match.player1 && match.player2 && (
                                <>
                                  {!match.completed && match.status === 'waiting' && (
                                    <text
                                      x={xPos + 100}
                                      y={yPos + 110}
                                      fill="#ef4444"
                                      fontSize="9"
                                      fontFamily="system-ui"
                                      textAnchor="middle"
                                    >
                                      Click match to start • Click player to score
                                    </text>
                                  )}
                                  {match.status === 'inProgress' && !match.completed && (
                                    <text
                                      x={xPos + 100}
                                      y={yPos + 110}
                                      fill="#f59e0b"
                                      fontSize="9"
                                      fontFamily="system-ui"
                                      textAnchor="middle"
                                    >
                                      Click player to add score
                                    </text>
                                  )}
                                </>
                              )}
                              
                              {/* No connecting lines - clean layout */}
                            </g>
                          );
                        });
                      })}
                    </>
                  )}
                  
                  {/* Grand Finals - Right side positioning */}
                  <text
                    x="1200"
                    y="450"
                    fill="#fbbf24"
                    fontSize="18"
                    fontFamily="system-ui"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Grand Finals
                  </text>
                  
                  {/* Tournament Champion Title */}
                  <text
                    x="1200"
                    y="620"
                    fill="#fbbf24"
                    fontSize="16"
                    fontFamily="system-ui"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Tournament Champion
                  </text>
                  
                  {/* Connecting Lines to Grand Finals */}
                  {bracket.winnersRounds.length > 0 && (
                    <line
                      x1={100 + ((bracket.winnersRounds.length - 1) * 300) + 200}
                      y1={120 + 60}
                      x2={1100}
                      y2={525}
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                  )}
                  
                  {bracket.type === 'double' && bracket.losersRounds.length > 0 && (
                    <line
                      x1={100 + ((bracket.losersRounds.length - 1) * 300) + 200}
                      y1={900 + 60}
                      x2={1100}
                      y2={565}
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                  )}

                  {bracket.grandFinals && (
                    <>
                    {/* Grand Finals Box - Enhanced Interactive */}
                    <rect
                      x="1100"
                      y="480"
                      width="200"
                      height="120"
                      fill={
                        bracket.grandFinals.completed ? "#eab308" : 
                        bracket.grandFinals.status === 'inProgress' ? "#f59e0b" : 
                        "#374151"
                      }
                      stroke={
                        bracket.grandFinals.completed ? "#ca8a04" : 
                        bracket.grandFinals.status === 'inProgress' ? "#d97706" : 
                        "#fbbf24"
                      }
                      strokeWidth="3"
                      rx="10"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleMatchClick(bracket.grandFinals)}
                    />

                    {/* Grand Finals Status */}
                    <text
                      x="1200"
                      y="495"
                      fill="white"
                      fontSize="10"
                      fontFamily="system-ui"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {bracket.grandFinals.status === 'waiting' ? 'WAITING FOR TABLE' :
                       bracket.grandFinals.status === 'inProgress' ? 'IN PROGRESS' :
                       bracket.grandFinals.completed ? 'COMPLETED' : ''}
                    </text>
                    
                    {/* Winners Champion */}
                    <rect
                      x="1105"
                      y="505"
                      width={bracket.grandFinals.completed ? "150" : "190"}
                      height="36"
                      fill={bracket.grandFinals.winner === bracket.grandFinals.player1 ? "#eab308" : "#10b981"}
                      stroke={bracket.grandFinals.winner === bracket.grandFinals.player1 ? "#fbbf24" : "#22c55e"}
                      strokeWidth="1"
                      rx="6"
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayerClick(bracket.grandFinals, bracket.grandFinals.player1, true);
                      }}
                    />
                    <text
                      x="1115"
                      y="527"
                      fill="white"
                      fontSize="12"
                      fontFamily="system-ui"
                      fontWeight="bold"
                    >
                      {bracket.grandFinals.player1?.name || 'Winners Champion'}
                      {bracket.grandFinals.player1?.isMember && ' ★'}
                    </text>
                    
                    {/* Winners Champion Score */}
                    {bracket.grandFinals.completed && (
                      <>
                        <rect
                          x="1260"
                          y="505"
                          width="35"
                          height="36"
                          fill="#0f172a"
                          rx="4"
                        />
                        <text
                          x="1277"
                          y="527"
                          fill="white"
                          fontSize="16"
                          fontFamily="system-ui"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {bracket.grandFinals.player1Score}
                        </text>
                      </>
                    )}
                    
                    {/* Losers Champion */}
                    <rect
                      x="1105"
                      y="545"
                      width={bracket.grandFinals.completed ? "150" : "190"}
                      height="36"
                      fill={bracket.grandFinals.winner === bracket.grandFinals.player2 ? "#eab308" : "#ef4444"}
                      stroke={bracket.grandFinals.winner === bracket.grandFinals.player2 ? "#fbbf24" : "#dc2626"}
                      strokeWidth="1"
                      rx="6"
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayerClick(bracket.grandFinals, bracket.grandFinals.player2, false);
                      }}
                    />
                    <text
                      x="1115"
                      y="567"
                      fill="white"
                      fontSize="12"
                      fontFamily="system-ui"
                      fontWeight="bold"
                    >
                      {bracket.grandFinals.player2?.name || 'Losers Champion'}
                      {bracket.grandFinals.player2?.isMember && ' ★'}
                    </text>
                    
                    {/* Losers Champion Score */}
                    {bracket.grandFinals.completed && (
                      <>
                        <rect
                          x="1260"
                          y="545"
                          width="35"
                          height="36"
                          fill="#0f172a"
                          rx="4"
                        />
                        <text
                          x="1277"
                          y="567"
                          fill="white"
                          fontSize="16"
                          fontFamily="system-ui"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {bracket.grandFinals.player2Score}
                        </text>
                      </>
                    )}
                    
                    {/* Interactive Indicators for Grand Finals */}
                    {tournamentState === 'inProgress' && bracket.grandFinals.player1 && bracket.grandFinals.player2 && (
                      <>
                        {!bracket.grandFinals.completed && bracket.grandFinals.status === 'waiting' && (
                          <text
                            x="1200"
                            y="595"
                            fill="#fbbf24"
                            fontSize="9"
                            fontFamily="system-ui"
                            textAnchor="middle"
                          >
                            Click match to start • Click player to score
                          </text>
                        )}
                        {bracket.grandFinals.status === 'inProgress' && !bracket.grandFinals.completed && (
                          <text
                            x="1200"
                            y="595"
                            fill="#f59e0b"
                            fontSize="9"
                            fontFamily="system-ui"
                            textAnchor="middle"
                          >
                            Click player to add score
                          </text>
                        )}
                      </>
                    )}
                    </>
                  )}
                  
                  {/* Connection lines from brackets to grand finals */}
                  <line
                    x1="800"
                    y1="150"
                    x2="920"
                    y2="230"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  
                  {bracket.type === 'double' && (
                    <line
                      x1="800"
                      y1="550"
                      x2="920"
                      y2="275"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                  )}
                  
                  {/* Round indicators */}
                  {bracket.winnersRounds.map((_, roundIndex) => (
                    <text
                      key={`wr-${roundIndex}`}
                      x={200 + (roundIndex * 300)}
                      y="100"
                      fill="#10b981"
                      fontSize="12"
                      fontFamily="system-ui"
                      textAnchor="middle"
                    >
                      WR{roundIndex + 1}
                    </text>
                  ))}
                  
                  {bracket.type === 'double' && bracket.losersRounds.map((_, roundIndex) => (
                    <text
                      key={`lr-${roundIndex}`}
                      x={200 + (roundIndex * 300)}
                      y="880"
                      fill="#ef4444"
                      fontSize="12"
                      fontFamily="system-ui"
                      textAnchor="middle"
                    >
                      LR{roundIndex + 1}
                    </text>
                  ))}
                </svg>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Target className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No Tournament Generated</h3>
              <p className="text-slate-400">
                Set up your tournament details and add players, then click "Generate Bracket" to create your tournament bracket.
              </p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Tournament;