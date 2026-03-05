import { Question } from '../model/types';
import { QUESTIONS } from '../../data/questions/questions';

export class QuestionRepository {
  getAllQuestions(): Question[] {
    return QUESTIONS;
  }

  getQuestionById(id: number): Question | undefined {
    return QUESTIONS.find(q => q.id === id);
  }
}
