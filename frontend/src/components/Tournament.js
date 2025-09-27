import React from 'react';
import { Users, Trophy, Target, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';

const Tournament = () => {
  return (
    <div className="min-h-screen bg-slate-800">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 shadow-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-600 p-3 rounded-full">
              <Trophy className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Lucky Shot Tournament</h1>
          </div>
          
          <Button
            onClick={() => window.close()}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Main
          </Button>
        </div>
      </div>

      {/* Tournament Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Tournament Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Upcoming Tournament</h3>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm mb-2">Weekly 8-Ball Tournament</p>
                <p className="text-white font-medium">Saturday 7:00 PM</p>
                <p className="text-slate-400 text-xs">Entry Fee: $10</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Participants</h3>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white font-medium text-2xl">16</p>
                <p className="text-slate-300 text-sm">Players Registered</p>
                <p className="text-slate-400 text-xs">Max: 32 players</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Prize Pool</h3>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white font-medium text-2xl">$160</p>
                <p className="text-slate-300 text-sm">Total Prize Money</p>
                <p className="text-slate-400 text-xs">1st: $100, 2nd: $40, 3rd: $20</p>
              </CardContent>
            </Card>
          </div>

          {/* Tournament Bracket */}
          <Card className="bg-slate-700 border-slate-600 mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <img src="/bracket.png" alt="Bracket" className="h-5 w-5" />
                <h2 className="text-xl font-bold text-white">Tournament Bracket</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">Tournament Bracket</h3>
                <p className="text-slate-400 mb-6">
                  The tournament bracket will be generated once registration closes.
                </p>
                <div className="space-y-2">
                  <Button className="bg-yellow-600 hover:bg-yellow-700 text-white mr-4">
                    Register for Tournament
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    View Past Tournaments
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Winners */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Recent Champions</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-600 pb-3">
                  <div>
                    <p className="text-white font-medium">Mike "8-Ball" Johnson</p>
                    <p className="text-slate-400 text-sm">Last Saturday Tournament</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">1st Place</p>
                    <p className="text-slate-300 text-sm">$100</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-b border-slate-600 pb-3">
                  <div>
                    <p className="text-white font-medium">Sarah "Straight Shot" Davis</p>
                    <p className="text-slate-400 text-sm">Two weeks ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">1st Place</p>
                    <p className="text-slate-300 text-sm">$80</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Alex "Rack 'Em" Thompson</p>
                    <p className="text-slate-400 text-sm">Three weeks ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">1st Place</p>
                    <p className="text-slate-300 text-sm">$120</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Tournament;