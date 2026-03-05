import { 
  collection, 
  query, 
  where, 
  limit, 
  onSnapshot, 
  addDoc, 
  getDocs 
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { 
  DebateTopic, 
  QuestionCategory, 
  DebateChoice, 
  OrientationLabel, 
  DebateVote, 
  VoteDistribution, 
  DebateResult 
} from "../model/types";

export class DebateRepository {
  subscribeToCurrentTopic(callback: (topic: DebateTopic | null) => void) {
    const q = query(collection(db, "debates"), where("isActive", "==", true), limit(1));
    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }
      const doc = snapshot.docs[0];
      const data = doc.data();
      callback({
        id: data.id,
        weekNumber: data.weekNumber,
        title: data.title,
        description: data.description,
        proArguments: data.proArguments || [],
        conArguments: data.conArguments || [],
        relatedCategory: data.category as QuestionCategory,
        isActive: true
      });
    });
  }

  async vote(topicId: number, choice: DebateChoice, userLabel: OrientationLabel) {
    await addDoc(collection(db, "votes"), {
      topicId,
      choice,
      userLabel,
      timestamp: Date.now()
    });
  }

  async getVoteResults(topic: DebateTopic, userLabel: OrientationLabel, userChoice: DebateChoice): Promise<DebateResult> {
    const q = query(collection(db, "votes"), where("topicId", "==", topic.id));
    const snapshot = await getDocs(q);
    
    const votes: DebateVote[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        topicId: data.topicId,
        userId: "",
        userLabel: data.userLabel as OrientationLabel,
        choice: data.choice as DebateChoice,
        timestamp: data.timestamp
      };
    });

    const distributions: Record<string, VoteDistribution> = {};
    
    const orientationLabels = Object.values(OrientationLabel);
    const groups = {
      "보수 성향": votes.filter(v => orientationLabels.indexOf(v.userLabel) <= 3),
      "중도 성향": votes.filter(v => {
        const idx = orientationLabels.indexOf(v.userLabel);
        return idx >= 4 && idx <= 5;
      }),
      "진보 성향": votes.filter(v => orientationLabels.indexOf(v.userLabel) >= 6)
    };

    Object.entries(groups).forEach(([groupName, groupVotes]) => {
      const total = Math.max(1, groupVotes.length);
      distributions[groupName] = {
        agreePercent: Math.round((groupVotes.filter(v => v.choice === DebateChoice.AGREE).length * 100) / total),
        disagreePercent: Math.round((groupVotes.filter(v => v.choice === DebateChoice.DISAGREE).length * 100) / total),
        unsurePercent: Math.round((groupVotes.filter(v => v.choice === DebateChoice.UNSURE).length * 100) / total)
      };
    });

    const userGroup = orientationLabels.indexOf(userLabel) <= 3 
      ? "보수 성향" 
      : (orientationLabels.indexOf(userLabel) >= 6 ? "진보 성향" : "중도 성향");
    
    const groupDist = distributions[userGroup];
    let majorChoice = DebateChoice.UNSURE;
    if (groupDist.agreePercent > 50) majorChoice = DebateChoice.AGREE;
    else if (groupDist.disagreePercent > 50) majorChoice = DebateChoice.DISAGREE;

    const aligned = userChoice === majorChoice;
    const insight = aligned 
      ? "당신은 자신의 성향 그룹과 같은 선택을 했습니다." 
      : "당신은 자신의 성향 그룹과 다른 선택을 했습니다! 독립적 사고를 하고 계시네요 👏";

    return {
      topic,
      totalVotes: votes.length,
      votesByOrientation: distributions,
      userVote: userChoice,
      userAlignedWithGroup: aligned,
      insightMessage: insight
    };
  }
}
