// Browse screen — the main archive view on mobile.
// Keyword + year search, a paginated/infinite list, and pull-to-refresh.
import { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { colors, fonts, spacing, radius, showLogo } from '../theme';

const LIMIT = 8;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 9 }, (_, i) => CURRENT_YEAR - i);

export default function BrowseScreen({ navigation }) {
  const { colors, showLogo, theme, toggleTheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { isStaff, canApprove, isLecturer, isAdmin, logout } = useAuth();

  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const [keyword, setKeyword] = useState('');
  const [year, setYear] = useState('');
  const [applied, setApplied] = useState({ keyword: '', year: '' });

  // Header: title + sign-out button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: showLogo ? colors.surface : colors.parchment },
      headerLeft: showLogo
        ? () => (
            <Image
              source={require('../assets/pau-logo.jpg')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          )
        : undefined,
      headerTitle: showLogo ? '' : 'Archive',
      headerRight: () => (
        <Pressable onPress={logout} hitSlop={10}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      ),
    });
  }, [navigation, logout, colors, showLogo]);

  const fetchPage = useCallback(
    async (pageNum, mode = 'replace') => {
      try {
        if (mode === 'more') setLoadingMore(true);
        else if (mode === 'refresh') setRefreshing(true);
        else setLoading(true);
        setError('');

        const { data } = await api.get('/projects', {
          params: { page: pageNum, limit: LIMIT, keyword: applied.keyword, year: applied.year },
        });

        setProjects((prev) => (mode === 'more' ? [...prev, ...data.data] : data.data));
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load projects. Pull down to retry.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [applied]
  );

  // Reload whenever the applied filters change.
  useEffect(() => {
    fetchPage(1, 'replace');
  }, [fetchPage]);

  const handleSearch = () => setApplied({ keyword: keyword.trim(), year });

  const handleLoadMore = () => {
    if (!loadingMore && !loading && page < totalPages) {
      fetchPage(page + 1, 'more');
    }
  };

  const renderHeader = () => (
    <View>
      <View style={styles.navRow}>
        {isStaff && (
          <Pressable style={styles.navChip} onPress={() => navigation.navigate('Admin')}>
            <Text style={styles.navChipText}>Manage  →</Text>
          </Pressable>
        )}
        {canApprove && (
          <Pressable style={styles.navChip} onPress={() => navigation.navigate('Approvals')}>
            <Text style={styles.navChipText}>Approvals  →</Text>
          </Pressable>
        )}
        {isLecturer && (
          <Pressable style={styles.navChip} onPress={() => navigation.navigate('MyRequests')}>
            <Text style={styles.navChipText}>My Requests  →</Text>
          </Pressable>
        )}
        {canApprove && (
          <Pressable style={styles.navChip} onPress={() => navigation.navigate('Audit')}>
            <Text style={styles.navChipText}>Audit  →</Text>
          </Pressable>
        )}
        {isAdmin && (
          <Pressable style={styles.navChip} onPress={() => navigation.navigate('Complaints')}>
            <Text style={styles.navChipText}>Complaints  →</Text>
          </Pressable>
        )}
        <Pressable style={styles.navChip} onPress={() => navigation.navigate('Feedback')}>
          <Text style={styles.navChipText}>Feedback  →</Text>
        </Pressable>
        <Pressable style={styles.navChip} onPress={toggleTheme}>
          <Text style={styles.navChipText}>{theme === 'blue' ? 'Classic theme  ⟳' : 'PAU Blue  ⟳'}</Text>
        </Pressable>
      </View>

      <Text style={styles.eyebrow}>COMPUTER SCIENCE DEPARTMENT</Text>
      <Text style={styles.title}>Project Archive</Text>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          value={keyword}
          onChangeText={setKeyword}
          placeholder="Search title, student, keyword…"
          placeholderTextColor={colors.inkFaint}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <Pressable style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.yearsRow}
      >
        <YearChip label="All years" active={year === ''} onPress={() => setYear('')} />
        {YEARS.map((y) => (
          <YearChip
            key={y}
            label={String(y)}
            active={year === String(y)}
            onPress={() => setYear(String(y))}
          />
        ))}
      </ScrollView>

      {!loading && !error && (
        <Text style={styles.resultsMeta}>
          {total} {total === 1 ? 'project' : 'projects'}
          {applied.keyword ? ` · “${applied.keyword}”` : ''}
          {applied.year ? ` · ${applied.year}` : ''}
        </Text>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.center}>
        <View style={styles.emptyMark}>
          <Text style={styles.emptyMarkText}>{error ? '!' : '∅'}</Text>
        </View>
        <Text style={styles.emptyTitle}>{error ? 'Something went wrong' : 'No projects found'}</Text>
        <Text style={styles.emptyText}>
          {error || 'Try adjusting your search terms or filters.'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.flex}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.loadingText}>Loading projects…</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => String(item.project_id)}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={() => navigation.navigate('ProjectDetail', { id: item.project_id })}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPage(1, 'refresh')}
              tintColor={colors.gold}
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={colors.gold} style={{ marginVertical: spacing.lg }} />
            ) : null
          }
        />
      )}
    </View>
  );
}

function YearChip({ label, active, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} style={[styles.yearChip, active && styles.yearChipActive]}>
      <Text style={[styles.yearChipText, active && styles.yearChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.parchment },
  listContent: { padding: spacing.xl, paddingBottom: spacing.xxl, flexGrow: 1 },
  headerLogo: { height: 30, width: 96, marginLeft: 12 },
  signOut: { fontFamily: fonts.bodySemiBold, color: colors.goldDeep, fontSize: 14 },

  navRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  navChip: {
    backgroundColor: colors.goldWash,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
  },
  navChipText: { fontFamily: fonts.bodySemiBold, color: colors.goldDeep, fontSize: 13.5 },

  eyebrow: { fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 1.5, color: colors.goldDeep },
  title: { fontFamily: fonts.displaySemiBold, fontSize: 28, color: colors.ink, marginTop: 4, marginBottom: spacing.lg },

  searchBox: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceEdge,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.ink,
  },
  searchBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  searchBtnText: { fontFamily: fonts.bodySemiBold, color: colors.white, fontSize: 14 },

  yearsRow: { gap: spacing.sm, paddingVertical: 2, marginBottom: spacing.md },
  yearChip: {
    borderWidth: 1,
    borderColor: colors.surfaceEdge,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 7,
    backgroundColor: colors.surface,
  },
  yearChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  yearChipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.inkSoft },
  yearChipTextActive: { color: colors.white },

  resultsMeta: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.inkFaint, marginBottom: spacing.lg },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.md },
  loadingText: { fontFamily: fonts.bodyRegular, color: colors.inkFaint, fontSize: 14 },
  emptyMark: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.goldWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMarkText: { fontFamily: fonts.displaySemiBold, fontSize: 28, color: colors.goldDeep },
  emptyTitle: { fontFamily: fonts.displaySemiBold, fontSize: 19, color: colors.ink },
  emptyText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.inkFaint, textAlign: 'center' },
});
