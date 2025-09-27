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
    
    // Create first round matches
    const firstRound = [];
    for (let i = 0; i < bracketSize / 2; i++) {
      const player1 = shuffledPlayers[i * 2] || null;
      const player2 = shuffledPlayers[i * 2 + 1] || null;
      
      firstRound.push({
        id: `match-${i}`,
        player1,
        player2,
        winner: null,
        round: 1
      });
    }

    setBracket({
      name: tournamentName,
      date: tournamentDate,
      type: bracketType,
      rounds: [firstRound],
      currentRound: 1,
      totalRounds: Math.log2(bracketSize)
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
      <div className={`${isDashboardHidden ? 'w-0' : 'w-80'} transition-all duration-300 ease-in-out bg-slate-900 overflow-hidden`}>
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
      </div>

      {/* Toggle Dashboard Arrow */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
        <Button
          onClick={toggleDashboard}
          size="sm"
          className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded-r-md rounded-l-none p-2"
        >
          {isDashboardHidden ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

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

            {/* Bracket Visualization */}
            <div className="space-y-8">
              {bracket.rounds.map((round, roundIndex) => (
                <div key={roundIndex} className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Round {roundIndex + 1}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {round.map((match) => (
                      <Card key={match.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-white">
                                  {match.player1 ? match.player1.name : 'BYE'}
                                </span>
                                {match.player1?.isMember && (
                                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                )}
                              </div>
                              {match.player1 && (
                                <Button
                                  size="sm"
                                  onClick={() => advanceWinner(match.id, match.player1)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Win
                                </Button>
                              )}
                            </div>
                            
                            <div className="border-t border-slate-600 my-2"></div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-white">
                                  {match.player2 ? match.player2.name : 'BYE'}
                                </span>
                                {match.player2?.isMember && (
                                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                )}
                              </div>
                              {match.player2 && (
                                <Button
                                  size="sm"
                                  onClick={() => advanceWinner(match.id, match.player2)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Win
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
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