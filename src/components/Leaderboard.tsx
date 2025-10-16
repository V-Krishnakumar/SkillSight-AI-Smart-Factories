import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLeaderboard } from '@/hooks/usePoints';
import { Trophy, Medal, Award, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard: React.FC = () => {
  const { data: leaderboard, isLoading, error } = useLeaderboard(10);

  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load leaderboard</p>
            <p className="text-muted-foreground text-sm">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default" as const;
      case 2:
        return "secondary" as const;
      case 3:
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Leaderboard
          <Badge variant="secondary" className="ml-auto">
            <Users className="w-3 h-3 mr-1" />
            {leaderboard?.length || 0} workers
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <motion.div
                key={entry.worker_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-hover p-3 rounded-lg ${
                  entry.rank <= 3 ? 'ring-2 ring-primary/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-foreground">
                          {entry.worker_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{entry.worker_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {entry.current_task || 'No current task'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gradient">
                        {entry.total_points.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">XP Points</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {entry.tasks_completed_today}
                      </div>
                      <div className="text-xs text-muted-foreground">Today</div>
                    </div>
                    <Badge variant={getRankBadgeVariant(entry.rank)}>
                      {entry.rank === 1 && <Star className="w-3 h-3 mr-1" />}
                      Rank {entry.rank}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Workers Yet</h3>
              <p className="text-muted-foreground">
                Workers will appear here once they start completing tasks.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
