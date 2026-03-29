import React, {useRef, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import {termsContent} from '../data/legalContent';
import type {TermsScreenProps} from '../navigation/types';

export default function TermsScreen({navigation}: TermsScreenProps) {
  const theme = useTheme();
  const s = makeStyles(theme);
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<number, number>>({});

  const handleSectionLayout = useCallback(
    (index: number) => (e: LayoutChangeEvent) => {
      sectionOffsets.current[index] = e.nativeEvent.layout.y;
    },
    [],
  );

  const scrollToSection = useCallback((index: number) => {
    const offset = sectionOffsets.current[index];
    if (offset !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({y: offset - 16, animated: true});
    }
  }, []);

  const doc = termsContent;

  return (
    <SafeAreaView style={s.container}>
      <Header
        title={doc.title}
        showBack
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={s.meta}>
          <Text style={s.metaText}>시행일: {doc.effectiveDate}</Text>
          <Text style={s.metaText}>최종 수정일: {doc.lastModified}</Text>
        </View>

        <View style={s.toc}>
          {doc.sections.map((section, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => scrollToSection(idx)}
              activeOpacity={0.6}>
              <Text style={s.tocItem}>{section.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {doc.sections.map((section, idx) => (
          <View
            key={idx}
            onLayout={handleSectionLayout(idx)}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <Text style={s.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scroll: {
      flex: 1,
      paddingHorizontal: theme.spacing.base,
    },
    meta: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    metaText: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
      marginBottom: theme.spacing.xs,
    },
    toc: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.md,
      padding: theme.spacing.base,
      marginBottom: theme.spacing.xl,
    },
    tocItem: {
      ...theme.typography.bodySmall,
      color: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
    },
    sectionTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
    },
    sectionContent: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 26,
    },
    bottomSpacer: {
      height: theme.spacing['3xl'],
    },
  });
