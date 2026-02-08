import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="moon" size={22} color={Colors.text} />
            <Text style={styles.label}>Dark Mode (System)</Text>
          </View>
          <Switch value={false} disabled />
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
           <View style={styles.rowLeft}>
            <Ionicons name="map" size={22} color={Colors.text} />
            <Text style={styles.label}>Offline Maps</Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color="#C7C7CC" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABOUT</Text>
        
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.label}>Version</Text>
          </View>
          <Text style={styles.value}>1.0.0 (Build 54)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS grouped background
  },
  header: {
    padding: Spacing.lg,
    paddingTop: 60, // Safe area
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.text,
  },
  section: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
    marginTop: -Spacing.md - 5, // Visual alignment
    marginBottom: 5,
    marginLeft: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    minHeight: 44,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  label: {
    fontSize: 17,
    color: Colors.text,
  },
  value: {
    fontSize: 17,
    color: '#8E8E93',
  },
  chevron: {
    width: 14,
    height: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: Spacing.lg + 22 + Spacing.md, // Align with text
  },
});
