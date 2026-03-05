import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchQuestions, getResult, submitQuiz } from "./src/api";

const CHOICES = [
  { key: "YES", label: "Yes" },
  { key: "UNSURE", label: "Unsure" },
  { key: "NO", label: "No" },
];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [resultId, setResultId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    setError("");
    try {
      const data = await fetchQuestions();
      setQuestions(data);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const canSubmit = useMemo(() => {
    return questions.length > 0 && Object.keys(answers).length === questions.length;
  }, [questions, answers]);

  const onPick = (questionId, choice) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = questions.map((q) => ({
        question_id: q.id,
        choice: answers[q.id],
        response_time_ms: 1000,
      }));
      const data = await submitQuiz(payload, `mobile-${Date.now()}`);
      setResultId(data.result_id);
      setResult(data.result);
      setScreen("result");
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSubmitting(false);
    }
  };

  const onRefreshResult = async () => {
    if (!resultId) return;
    setError("");
    try {
      const data = await getResult(resultId);
      setResult(data.result);
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  const resetFlow = () => {
    setAnswers({});
    setResult(null);
    setResultId("");
    setError("");
    setScreen("home");
  };

  return (
    <SafeAreaView style={styles.container}>
      {screen === "home" && (
        <HomeScreen
          loading={loadingQuestions}
          questionCount={questions.length}
          error={error}
          onRetry={loadQuestions}
          onStart={() => setScreen("quiz")}
        />
      )}

      {screen === "quiz" && (
        <QuizScreen
          questions={questions}
          answers={answers}
          submitting={submitting}
          error={error}
          canSubmit={canSubmit}
          onBack={() => setScreen("home")}
          onPick={onPick}
          onSubmit={onSubmit}
        />
      )}

      {screen === "result" && (
        <ResultScreen
          resultId={resultId}
          result={result}
          error={error}
          onRefresh={onRefreshResult}
          onRestart={resetFlow}
        />
      )}
    </SafeAreaView>
  );
}

function HomeScreen({ loading, questionCount, error, onRetry, onStart }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Prism Mobile</Text>
      <Text style={styles.caption}>MVP user app flow</Text>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator />
          <Text style={styles.caption}>Loading questions...</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.meta}>Questions loaded: {questionCount}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={onStart}>
            <Text style={styles.primaryBtnText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.secondaryBtn} onPress={onRetry}>
        <Text style={styles.secondaryBtnText}>Retry Load</Text>
      </TouchableOpacity>
    </View>
  );
}

function QuizScreen({
  questions,
  answers,
  submitting,
  error,
  canSubmit,
  onBack,
  onPick,
  onSubmit,
}) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Quiz</Text>
      <Text style={styles.caption}>Answer all questions to submit.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {questions.map((q) => (
        <View key={q.id} style={styles.card}>
          <Text style={styles.qTitle}>Q{q.order_index}</Text>
          <Text style={styles.qText}>{q.text_ko}</Text>
          <View style={styles.row}>
            {CHOICES.map((c) => {
              const active = answers[q.id] === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.choice, active && styles.choiceActive]}
                  onPress={() => onPick(q.id, c.key)}
                >
                  <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onBack}>
          <Text style={styles.secondaryBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, (!canSubmit || submitting) && styles.primaryBtnDisabled]}
          disabled={!canSubmit || submitting}
          onPress={onSubmit}
        >
          <Text style={styles.primaryBtnText}>{submitting ? "Submitting..." : "Submit Quiz"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ResultScreen({ resultId, result, error, onRefresh, onRestart }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Result</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.meta}>result_id: {resultId || "-"}</Text>
        <Text style={styles.meta}>label: {result?.overall_label || "-"}</Text>
        <Text style={styles.meta}>overall: {result?.overall_position ?? "-"}</Text>
        <Text style={styles.meta}>economic: {result?.economic_position ?? "-"}</Text>
        <Text style={styles.meta}>social: {result?.social_position ?? "-"}</Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={onRefresh}>
        <Text style={styles.primaryBtnText}>Refresh From API</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={onRestart}>
        <Text style={styles.secondaryBtnText}>Restart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FB" },
  screen: { flex: 1, padding: 16, gap: 12 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 12 },
  loadingWrap: { gap: 8, paddingVertical: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#1F2937" },
  caption: { color: "#6B7280" },
  error: { color: "#B91C1C", backgroundColor: "#FEE2E2", padding: 10, borderRadius: 8 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, gap: 8 },
  meta: { color: "#111827", lineHeight: 20 },
  qTitle: { fontWeight: "700", color: "#2563EB" },
  qText: { color: "#111827", lineHeight: 20 },
  row: { flexDirection: "row", gap: 8, marginTop: 4, flexWrap: "wrap" },
  choice: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  choiceActive: { backgroundColor: "#DBEAFE", borderColor: "#3B82F6" },
  choiceText: { color: "#374151" },
  choiceTextActive: { color: "#1D4ED8", fontWeight: "600" },
  actions: { gap: 8, marginTop: 8 },
  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnDisabled: { backgroundColor: "#93C5FD" },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "700" },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#374151", fontWeight: "600" },
});
