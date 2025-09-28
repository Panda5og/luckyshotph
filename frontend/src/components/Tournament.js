import React, { useState, useEffect } from 'react';
import { Users, Trophy, Target, Calendar, Plus, Trash2, Star, ChevronLeft, ChevronRight, Play, Shuffle, X } from 'lucide-react';
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
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreData, setScoreData] = useState({ player1Score: '', player2Score: '' });

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
      
      // Auto-generate bracket when players are added
      if (updatedPlayers.length >= 2) {
        generateBracketForPlayers(updatedPlayers, false); // false = don't shuffle
        setTournamentState('ready');
      }
    }
  };

  const removePlayer = (playerId) => {
    const updatedPlayers = players.filter(player => player.id !== playerId);
    setPlayers(updatedPlayers);
    
    // Update bracket or reset state
    if (updatedPlayers.length >= 2) {
      generateBracketForPlayers(updatedPlayers, false);
      setTournamentState('ready');
    } else {
      setBracket(null);
      setTournamentState('setup');
    }
  };

  const generateBracketForPlayers = (playerList, shouldShuffle = false) => {
    if (playerList.length < 2) {
      return;
    }

    const shuffledPlayers = shouldShuffle 
      ? [...playerList].sort(() => Math.random() - 0.5)
      : [...playerList];
    
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
      generateBracketForPlayers(players, true); // Shuffle players
    }
    setTournamentState('inProgress');
  };

  const handleMatchClick = (match) => {
    if (tournamentState === 'inProgress' && !match.completed && match.player1 && match.player2) {
      setSelectedMatch(match);
      setScoreData({ player1Score: '', player2Score: '' });
      setShowScoreModal(true);
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

    // Update bracket with match result
    const updatedBracket = { ...bracket };
    
    // Find and update the match
    let matchFound = false;
    
    // Check winners rounds
    updatedBracket.winnersRounds.forEach(round => {
      round.forEach(match => {
        if (match.id === selectedMatch.id) {
          match.winner = winner;
          match.player1Score = player1Score;
          match.player2Score = player2Score;
          match.completed = true;
          matchFound = true;
        }
      });
    });
    
    // Check losers rounds
    updatedBracket.losersRounds.forEach(round => {
      round.forEach(match => {
        if (match.id === selectedMatch.id) {
          match.winner = winner;
          match.player1Score = player1Score;
          match.player2Score = player2Score;
          match.completed = true;
          matchFound = true;
        }
      });
    });
    
    // Check grand finals
    if (updatedBracket.grandFinals.id === selectedMatch.id) {
      updatedBracket.grandFinals.winner = winner;
      updatedBracket.grandFinals.player1Score = player1Score;
      updatedBracket.grandFinals.player2Score = player2Score;
      updatedBracket.grandFinals.completed = true;
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

      {/* Shuffle Confirmation Dialog */}
      {showShuffleDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Start Tournament</h3>
            <p className="text-slate-300 mb-6">
              Would you like to shuffle the players to randomize the bracket seeding?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => confirmStartTournament(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Shuffle & Start
              </Button>
              <Button
                onClick={() => confirmStartTournament(false)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start as Is
              </Button>
              <Button
                onClick={() => setShowShuffleDialog(false)}
                variant="outline"
                className="border-slate-600 text-slate-300"
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
      <div className="flex-1 p-6 overflow-auto">
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

            {/* Double Elimination Bracket Visualization */}
            <div className="flex justify-center">
              <div className="inline-block">
                <svg width="1200" height="800" className="bg-slate-900 rounded-lg border border-slate-600">
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
                  
                  {/* Winners Bracket Rounds */}
                  {bracket.winnersRounds.map((round, roundIndex) => {
                    return round.map((match, matchIndex) => {
                      const xPos = 50 + (roundIndex * 200);
                      const yPos = 60 + (matchIndex * 120) * Math.pow(2, roundIndex);
                      const matchHeight = 80;
                      
                      return (
                        <g key={match.id}>
                          {/* Match Box */}
                          <rect
                            x={xPos}
                            y={yPos}
                            width="180"
                            height={matchHeight}
                            fill="#374151"
                            stroke="#10b981"
                            strokeWidth="2"
                            rx="8"
                          />
                          
                          {/* Player 1 */}
                          <rect
                            x={xPos + 5}
                            y={yPos + 5}
                            width="170"
                            height="32"
                            fill="#1f2937"
                            rx="4"
                          />
                          <text
                            x={xPos + 15}
                            y={yPos + 24}
                            fill="white"
                            fontSize="12"
                            fontFamily="system-ui"
                          >
                            {match.player1 ? (
                              match.player1.name.substring(0, 15) + 
                              (match.player1.isMember ? ' ★' : '')
                            ) : 'TBD'}
                          </text>
                          
                          {/* Player 2 */}
                          <rect
                            x={xPos + 5}
                            y={yPos + 42}
                            width="170"
                            height="32"
                            fill="#1f2937"
                            rx="4"
                          />
                          <text
                            x={xPos + 15}
                            y={yPos + 61}
                            fill="white"
                            fontSize="12"
                            fontFamily="system-ui"
                          >
                            {match.player2 ? (
                              match.player2.name.substring(0, 15) + 
                              (match.player2.isMember ? ' ★' : '')
                            ) : 'TBD'}
                          </text>
                          
                          {/* Connecting lines to next round */}
                          {roundIndex < bracket.winnersRounds.length - 1 && (
                            <>
                              <line
                                x1={xPos + 180}
                                y1={yPos + 40}
                                x2={xPos + 220}
                                y2={yPos + 40}
                                stroke="white"
                                strokeWidth="2"
                              />
                              
                              {/* Vertical connector for pairing matches */}
                              {matchIndex % 2 === 0 && matchIndex + 1 < round.length && (
                                <>
                                  <line
                                    x1={xPos + 220}
                                    y1={yPos + 40}
                                    x2={xPos + 220}
                                    y2={yPos + 160}
                                    stroke="white"
                                    strokeWidth="2"
                                  />
                                  <line
                                    x1={xPos + 220}
                                    y1={yPos + 100}
                                    x2={xPos + 250}
                                    y2={yPos + 100}
                                    stroke="white"
                                    strokeWidth="2"
                                  />
                                </>
                              )}
                            </>
                          )}
                        </g>
                      );
                    });
                  })}
                  
                  {/* Losers Bracket (if double elimination) */}
                  {bracket.type === 'double' && bracket.losersRounds.length > 0 && (
                    <>
                      <text
                        x="200"
                        y="450"
                        fill="#ef4444"
                        fontSize="18"
                        fontFamily="system-ui"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Losers Bracket
                      </text>
                      
                      {bracket.losersRounds.map((round, roundIndex) => {
                        return round.map((match, matchIndex) => {
                          const xPos = 50 + (roundIndex * 120);
                          const yPos = 480 + (matchIndex * 100);
                          const matchHeight = 80;
                          
                          return (
                            <g key={match.id}>
                              {/* Match Box */}
                              <rect
                                x={xPos}
                                y={yPos}
                                width="100"
                                height={matchHeight}
                                fill="#374151"
                                stroke="#ef4444"
                                strokeWidth="2"
                                rx="6"
                              />
                              
                              {/* Player 1 */}
                              <rect
                                x={xPos + 3}
                                y={yPos + 5}
                                width="94"
                                height="32"
                                fill="#1f2937"
                                rx="3"
                              />
                              <text
                                x={xPos + 8}
                                y={yPos + 22}
                                fill="white"
                                fontSize="10"
                                fontFamily="system-ui"
                              >
                                {match.player1 ? 
                                  match.player1.name.substring(0, 8) + 
                                  (match.player1.isMember ? ' ★' : '')
                                  : 'TBD'}
                              </text>
                              
                              {/* Player 2 */}
                              <rect
                                x={xPos + 3}
                                y={yPos + 42}
                                width="94"
                                height="32"
                                fill="#1f2937"
                                rx="3"
                              />
                              <text
                                x={xPos + 8}
                                y={yPos + 59}
                                fill="white"
                                fontSize="10"
                                fontFamily="system-ui"
                              >
                                {match.player2 ? 
                                  match.player2.name.substring(0, 8) + 
                                  (match.player2.isMember ? ' ★' : '')
                                  : 'TBD'}
                              </text>
                              
                              {/* Connecting lines */}
                              {roundIndex < bracket.losersRounds.length - 1 && (
                                <line
                                  x1={xPos + 100}
                                  y1={yPos + 40}
                                  x2={xPos + 120}
                                  y2={yPos + 40}
                                  stroke="white"
                                  strokeWidth="1"
                                />
                              )}
                            </g>
                          );
                        });
                      })}
                    </>
                  )}
                  
                  {/* Grand Finals */}
                  <g>
                    <text
                      x="1000"
                      y="30"
                      fill="#fbbf24"
                      fontSize="18"
                      fontFamily="system-ui"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      Grand Finals
                    </text>
                    
                    {/* Grand Finals Box */}
                    <rect
                      x="920"
                      y="200"
                      width="200"
                      height="100"
                      fill="#374151"
                      stroke="#fbbf24"
                      strokeWidth="3"
                      rx="10"
                    />
                    
                    {/* Winners Bracket Champion */}
                    <rect
                      x="925"
                      y="210"
                      width="190"
                      height="40"
                      fill="#10b981"
                      rx="6"
                    />
                    <text
                      x="935"
                      y="232"
                      fill="white"
                      fontSize="14"
                      fontFamily="system-ui"
                      fontWeight="bold"
                    >
                      Winners Champion
                    </text>
                    
                    {/* Losers Bracket Champion */}
                    <rect
                      x="925"
                      y="255"
                      width="190"
                      height="40"
                      fill="#ef4444"
                      rx="6"
                    />
                    <text
                      x="935"
                      y="277"
                      fill="white"
                      fontSize="14"
                      fontFamily="system-ui"
                      fontWeight="bold"
                    >
                      Losers Champion
                    </text>
                    
                    {/* Champion Box */}
                    <rect
                      x="950"
                      y="350"
                      width="140"
                      height="60"
                      fill="#fbbf24"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      rx="10"
                    />
                    <text
                      x="1020"
                      y="375"
                      fill="#000"
                      fontSize="16"
                      fontFamily="system-ui"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      TOURNAMENT
                    </text>
                    <text
                      x="1020"
                      y="395"
                      fill="#000"
                      fontSize="16"
                      fontFamily="system-ui"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      CHAMPION
                    </text>
                    
                    {/* Connection from Grand Finals to Champion */}
                    <line
                      x1="1020"
                      y1="300"
                      x2="1020"
                      y2="350"
                      stroke="#fbbf24"
                      strokeWidth="3"
                    />
                  </g>
                  
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
                      x={140 + (roundIndex * 200)}
                      y="50"
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
                      x={100 + (roundIndex * 120)}
                      y="470"
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
  );
};

export default Tournament;