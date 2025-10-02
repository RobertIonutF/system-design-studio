import { Challenge, SystemNode, SystemEdge, ValidationResult, NodeType } from '@/types';

export const validateDesign = (
  challenge: Challenge,
  nodes: SystemNode[],
  edges: SystemEdge[]
): ValidationResult => {
  const requirementResults = challenge.requirements.map((req) => {
    const passed = req.check(nodes, edges);
    return {
      requirement: req,
      passed,
      earnedPoints: passed ? req.points : 0,
    };
  });

  const score = requirementResults.reduce((sum, result) => sum + result.earnedPoints, 0);
  const maxScore = challenge.maxPoints;
  const passed = score >= challenge.passingScore;

  const feedback: string[] = [];
  
  // Generate feedback messages
  if (passed) {
    feedback.push(`🎉 Excellent work! You scored ${score}/${maxScore} points.`);
  } else {
    feedback.push(`You scored ${score}/${maxScore} points. You need ${challenge.passingScore} to pass.`);
  }

  // Add feedback for failed requirements
  requirementResults.forEach((result) => {
    if (!result.passed && result.requirement.hint) {
      feedback.push(`💡 ${result.requirement.hint}`);
    }
  });

  return {
    passed,
    score,
    maxScore,
    requirementResults,
    feedback,
  };
};

export const detectConcepts = (nodes: SystemNode[], edges: SystemEdge[]) => {
  const concepts = {
    caching: nodes.some((n) => n.data.type === NodeType.CACHE),
    queuing: nodes.some((n) => n.data.type === NodeType.QUEUE),
    loadBalancing: nodes.some((n) => n.data.type === NodeType.LOAD_BALANCER),
    replication: nodes.filter((n) => n.data.type === NodeType.SERVICE).length >= 2,
    eventDriven: nodes.some((n) => n.data.type === NodeType.QUEUE || n.data.type === NodeType.PUBSUB),
    observability: nodes.some((n) => n.data.type === NodeType.METRICS),
  };

  return concepts;
};

