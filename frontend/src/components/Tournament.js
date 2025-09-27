import React, { useState } from 'react';
import { Users, Trophy, Target, Calendar, Plus, Trash2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer = {
        id: Date.now(),
        name: newPlayerName.trim(),
        isMember: isNewPlayerMember
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      setIsNewPlayerMember(false);
    }
  };

  const removePlayer = (playerId) => {
    setPlayers(players.filter(player => player.id !== playerId));
  };

  const generateBracket = () => {
    if (players.length < 2) {
      alert('Need at least 2 players to generate a bracket');
      return;
    }

    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
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
        bracket: 'finals'
      },
      totalPlayers: shuffledPlayers.length,
      bracketSize
    });
  };

  const advanceWinner = (matchId, winner) => {
    // Implementation for advancing winners to next round
    console.log(`Winner ${winner.name} advances from match ${matchId}`);
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
                  <Button onClick={addPlayer} size="sm" className="bg-blue-600 hover:bg-blue-700">
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

            {/* Generate Bracket */}
            <Button
              onClick={generateBracket}
              disabled={players.length < 2}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Generate Bracket
            </Button>
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

            {/* Tournament Bracket Tree View */}
            <div className="flex justify-center">
              <div className="inline-block">
                <svg width="800" height="400" className="bg-slate-900 rounded-lg border border-slate-600">
                  {/* Round 1 Matches */}
                  {bracket.rounds[0].map((match, index) => {
                    const yPos = 100 + (index * 200);
                    return (
                      <g key={match.id}>
                        {/* Match Box */}
                        <rect
                          x="50"
                          y={yPos}
                          width="200"
                          height="80"
                          fill="#374151"
                          stroke="#6b7280"
                          strokeWidth="1"
                          rx="8"
                        />
                        
                        {/* Player 1 */}
                        <rect
                          x="55"
                          y={yPos + 5}
                          width="190"
                          height="35"
                          fill="#1f2937"
                          rx="4"
                        />
                        <text
                          x="65"
                          y={yPos + 25}
                          fill="white"
                          fontSize="14"
                          fontFamily="system-ui"
                        >
                          {match.player1 ? (
                            <>
                              {match.player1.name}
                              {match.player1.isMember && (
                                <tspan fill="#fbbf24"> ★</tspan>
                              )}
                            </>
                          ) : 'BYE'}
                        </text>
                        
                        {/* Player 2 */}
                        <rect
                          x="55"
                          y={yPos + 40}
                          width="190"
                          height="35"
                          fill="#1f2937"
                          rx="4"
                        />
                        <text
                          x="65"
                          y={yPos + 60}
                          fill="white"
                          fontSize="14"
                          fontFamily="system-ui"
                        >
                          {match.player2 ? (
                            <>
                              {match.player2.name}
                              {match.player2.isMember && (
                                <tspan fill="#fbbf24"> ★</tspan>
                              )}
                            </>
                          ) : 'BYE'}
                        </text>
                        
                        {/* Connection line to next round */}
                        <line
                          x1="250"
                          y1={yPos + 40}
                          x2="350"
                          y2={yPos + 40}
                          stroke="white"
                          strokeWidth="2"
                        />
                        
                        {/* Connecting to finals */}
                        {index === 0 && (
                          <line
                            x1="350"
                            y1={yPos + 40}
                            x2="350"
                            y2="200"
                            stroke="white"
                            strokeWidth="2"
                          />
                        )}
                        {index === 1 && (
                          <line
                            x1="350"
                            y1={yPos + 40}
                            x2="350"
                            y2="200"
                            stroke="white"
                            strokeWidth="2"
                          />
                        )}
                      </g>
                    );
                  })}
                  
                  {/* Finals Box */}
                  <g>
                    {/* Horizontal connector line */}
                    <line
                      x1="350"
                      y1="140"
                      x2="400"
                      y2="140"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <line
                      x1="350"
                      y1="300"
                      x2="400"
                      y2="300"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <line
                      x1="400"
                      y1="140"
                      x2="400"
                      y2="300"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <line
                      x1="400"
                      y1="220"
                      x2="450"
                      y2="220"
                      stroke="white"
                      strokeWidth="2"
                    />
                    
                    {/* Finals Match Box */}
                    <rect
                      x="450"
                      y="180"
                      width="200"
                      height="80"
                      fill="#374151"
                      stroke="#6b7280"
                      strokeWidth="1"
                      rx="8"
                    />
                    
                    {/* Finals Players */}
                    <rect
                      x="455"
                      y="185"
                      width="190"
                      height="35"
                      fill="#1f2937"
                      rx="4"
                    />
                    <text
                      x="465"
                      y="205"
                      fill="#9ca3af"
                      fontSize="14"
                      fontFamily="system-ui"
                    >
                      Winner of Match 1
                    </text>
                    
                    <rect
                      x="455"
                      y="220"
                      width="190"
                      height="35"
                      fill="#1f2937"
                      rx="4"
                    />
                    <text
                      x="465"
                      y="240"
                      fill="#9ca3af"
                      fontSize="14"
                      fontFamily="system-ui"
                    >
                      Winner of Match 2
                    </text>
                    
                    {/* Championship line */}
                    <line
                      x1="650"
                      y1="220"
                      x2="700"
                      y2="220"
                      stroke="white"
                      strokeWidth="2"
                    />
                    
                    {/* Champion Box */}
                    <rect
                      x="700"
                      y="200"
                      width="80"
                      height="40"
                      fill="#fbbf24"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      rx="8"
                    />
                    <text
                      x="740"
                      y="223"
                      fill="#000"
                      fontSize="12"
                      fontFamily="system-ui"
                      textAnchor="middle"
                    >
                      CHAMPION
                    </text>
                  </g>
                  
                  {/* Round Labels */}
                  <text
                    x="150"
                    y="50"
                    fill="white"
                    fontSize="16"
                    fontFamily="system-ui"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Round 1
                  </text>
                  <text
                    x="550"
                    y="50"
                    fill="white"
                    fontSize="16"
                    fontFamily="system-ui"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Finals
                  </text>
                  <text
                    x="740"
                    y="50"
                    fill="#fbbf24"
                    fontSize="16"
                    fontFamily="system-ui"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Champion
                  </text>
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