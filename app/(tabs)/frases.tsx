import { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { OneVoxWordmark } from "@/components/brand/brand-bits";
import { useColors } from "@/hooks/use-colors";
import { useSpeech } from "@/hooks/use-speech";
import { useOneVox, type Phrase, type PhraseCategory } from "@/lib/onevox-store";
import { brandGradient } from "@/theme.config";

const CATEGORIES: { key: PhraseCategory; label: string; icon: any; color: string }[] = [
  { key: "necessidades", label: "Necessidades", icon: "hand.raised.fill", color: "#34D8A0" },
  { key: "saude", label: "Saúde", icon: "cross.case.fill", color: "#3AAEE6" },
  { key: "social", label: "Social", icon: "bubble.left.fill", color: "#A78BFA" },
  { key: "emergencia", label: "Emergência", icon: "exclamationmark.triangle.fill", color: "#F87171" },
];

export default function FrasesScreen() {
  const colors = useColors();
  const { phrases, addPhrase, removePhrase, fontSizeFor } = useOneVox();
  const { speak, state } = useSpeech();
  const [activeCat, setActiveCat] = useState<PhraseCategory>("necessidades");
  const [modalOpen, setModalOpen] = useState(false);
  const [newText, setNewText] = useState("");

  const haptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== "web") Haptics.impactAsync(style);
  };

  const filtered = useMemo(
    () => phrases.filter((p) => p.category === activeCat),
    [phrases, activeCat],
  );

  const handleSpeak = (phrase: Phrase) => {
    haptic(Haptics.ImpactFeedbackStyle.Medium);
    speak(phrase.text, { record: "frases" }).catch(() => {});
  };

  const handleAdd = () => {
    if (!newText.trim()) return;
    haptic();
    addPhrase(newText, activeCat);
    setNewText("");
    setModalOpen(false);
  };

  const activeColor = CATEGORIES.find((c) => c.key === activeCat)?.color ?? colors.primary;

  return (
    <ScreenContainer className="px-5">
      <View style={styles.header}>
        <OneVoxWordmark size={26} subtitle="FRASES RÁPIDAS" />
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
        style={{ flexGrow: 0 }}
      >
        {CATEGORIES.map((cat) => {
          const active = cat.key === activeCat;
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => {
                haptic();
                setActiveCat(cat.key);
              }}
              activeOpacity={0.8}
              style={[
                styles.catChip,
                {
                  backgroundColor: active ? cat.color : colors.surface,
                  borderColor: active ? cat.color : colors.border,
                },
              ]}
            >
              <IconSymbol name={cat.icon} size={18} color={active ? "#0A1628" : cat.color} />
              <Text
                style={[
                  styles.catLabel,
                  { color: active ? "#0A1628" : colors.foreground, fontWeight: active ? "700" : "600" },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 16, paddingTop: 4, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((phrase) => (
          <Pressable
            key={phrase.id}
            onPress={() => handleSpeak(phrase)}
            onLongPress={() => {
              haptic(Haptics.ImpactFeedbackStyle.Heavy);
              removePhrase(phrase.id);
            }}
            disabled={state !== "idle"}
            style={({ pressed }) => [
              styles.phraseCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={[styles.phraseIcon, { backgroundColor: activeColor + "22" }]}>
              <IconSymbol name="speaker.wave.2.fill" size={20} color={activeColor} />
            </View>
            <Text
              style={[styles.phraseText, { color: colors.foreground, fontSize: fontSizeFor(17) }]}
              numberOfLines={3}
            >
              {phrase.text}
            </Text>
          </Pressable>
        ))}

        <Text style={[styles.hint, { color: colors.muted }]}>
          Toque para falar · Pressione e segure para excluir
        </Text>
      </ScrollView>

      {/* Add button */}
      <TouchableOpacity
        onPress={() => {
          haptic();
          setModalOpen(true);
        }}
        activeOpacity={0.85}
        style={styles.fab}
      >
        <LinearGradient
          colors={brandGradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabInner}
        >
          <IconSymbol name="plus" size={28} color="#0A1628" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add modal */}
      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Nova frase</Text>
            <Text style={[styles.modalSub, { color: colors.muted }]}>
              Categoria: {CATEGORIES.find((c) => c.key === activeCat)?.label}
            </Text>
            <TextInput
              value={newText}
              onChangeText={setNewText}
              placeholder="Digite a frase..."
              placeholderTextColor={colors.muted}
              multiline
              style={[styles.modalInput, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setModalOpen(false);
                  setNewText("");
                }}
                style={[styles.modalBtn, { borderColor: colors.border }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAdd} activeOpacity={0.85} style={{ flex: 1 }} disabled={!newText.trim()}>
                <LinearGradient
                  colors={brandGradient as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.modalBtn, { opacity: newText.trim() ? 1 : 0.5 }]}
                >
                  <Text style={[styles.modalBtnText, { color: "#0A1628", fontWeight: "700" }]}>Salvar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", paddingTop: 8, paddingBottom: 12 },
  catRow: { gap: 10, paddingVertical: 8, paddingRight: 8 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
  },
  catLabel: { fontSize: 14 },
  phraseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 72,
  },
  phraseIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  phraseText: { flex: 1, fontWeight: "600", lineHeight: 24 },
  hint: { textAlign: "center", fontSize: 12, marginTop: 8 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    borderRadius: 30,
    shadowColor: "#34D8A0",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: { borderRadius: 20, padding: 22 },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  modalSub: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
    minHeight: 90,
    textAlignVertical: "top",
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 18 },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  modalBtnText: { fontSize: 15, fontWeight: "600" },
});
