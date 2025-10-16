import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAutomatedAssignment } from '@/hooks/useAssignments';
import { useAssignmentOverview } from '@/hooks/useAssignments';
import { TASK_DEFINITIONS } from '@/data/taskDefinitions';
import { motion } from 'framer-motion';
import { RefreshCw, Users, Target, CheckCircle } from 'lucide-react';

/**
 * Test component to demonstrate the automated assignment flow
 * This can be used to verify the end-to-end functionality
 */
export const AssignmentTestComponent: React.FC = () => {
  const automatedAssignmentMutation = useAutomatedAssignment();
  const { data: assignmentOverview, isLoading } = useAssignmentOverview();

  const handleTestAssignment = async () => {
    try {
      console.log('🧪 Starting automated assignment test...');
      const result = await automatedAssignmentMutation.mutateAsync();
      
      console.log('✅ Assignment test completed:', result);
      console.log(`📊 Summary: ${result.summary.assignedWorkers}/${result.summary.totalWorkers} workers assigned`);
      console.log('📈 Task distribution:', result.summary.taskDistribution);
      
    } catch (error) {
      console.error('❌ Assignment test failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Automated Assignment Test
          </CardTitle>
          <p className="text-sm text-muted-foreground">
                    Test the skill-based worker assignment system
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleTestAssignment}
            disabled={automatedAssignmentMutation.isPending}
            className="glow w-full"
          >
            {automatedAssignmentMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running Assignment Algorithm...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Test Automated Assignment
              </>
            )}
          </Button>

          {automatedAssignmentMutation.isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-hover p-4 rounded-lg"
            >
              <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
                <CheckCircle className="w-4 h-4" />
                Assignment Test Successful!
              </div>
              <p className="text-sm text-muted-foreground">
                Workers have been automatically assigned to tasks using skill-based matching.
              </p>
            </motion.div>
          )}

          {automatedAssignmentMutation.isError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-hover p-4 rounded-lg border border-red-500/30"
            >
              <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                <Target className="w-4 h-4" />
                Assignment Test Failed
              </div>
              <p className="text-sm text-muted-foreground">
                {automatedAssignmentMutation.error?.message || 'Unknown error occurred'}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Current Assignment Overview */}
      {assignmentOverview && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Current Assignment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Task Distribution */}
              <div className="grid grid-cols-5 gap-4">
                {TASK_DEFINITIONS.map((task) => {
                  const taskAssignments = assignmentOverview.assignmentsByTask[task.name] || [];
                  const assignedCount = taskAssignments.length;
                  
                  return (
                    <div key={task.id} className="glass-hover p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-gradient mb-1">{assignedCount}</div>
                      <div className="text-xs text-muted-foreground">{task.name}</div>
                      <div className="text-xs text-muted-foreground">assigned</div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">
                    {assignmentOverview.stats.totalAssignments}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Assignments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">
                    {Math.round(assignmentOverview.stats.avgSkillMatch)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Skill Match</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">
                    {Object.keys(assignmentOverview.stats.statusCounts).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Status Types</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Definitions Display */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Task Definitions</CardTitle>
          <p className="text-sm text-muted-foreground">
            The 5 main tasks for automated assignment
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TASK_DEFINITIONS.map((task) => (
              <div key={task.id} className="glass-hover p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{task.name}</h4>
                  <Badge variant={
                    task.difficulty === "Hard" ? "destructive" : 
                    task.difficulty === "Medium" ? "default" : 
                    "secondary"
                  }>
                    {task.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                <div className="text-xs text-muted-foreground">
                  Duration: {task.duration} | Category: {task.category}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentTestComponent;
