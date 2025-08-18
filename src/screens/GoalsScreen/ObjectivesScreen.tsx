import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import Body, { ExtendedBodyPart } from 'react-native-body-highlighter';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { getObjectives } from '../../services/objectives';
import { Ionicons } from '@expo/vector-icons';

export default function ObjectivesScreen() {
	const theme = useTheme();
	const { user } = useUser();
	const [loading, setLoading] = useState(true);
	const [muscles, setMuscles] = useState<string[]>([]);
	const [side, setSide] = useState<'front' | 'back'>('front');

	useEffect(() => {
		let mounted = true;
		(async () => {
			if (!user?.id) return setLoading(false);
			try {
				const doc = await getObjectives(user.id);
				if (mounted) setMuscles(doc?.muscleGroups ?? []);
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => { mounted = false; };
	}, [user?.id]);

	const data = useMemo<ExtendedBodyPart[]>(() => muscles.map((slug) => ({ slug: slug as any, intensity: 2 })), [muscles]);

	if (loading) {
		return (
			<View style={[styles.center, { backgroundColor: theme.colors.background }]}> 
				<ActivityIndicator color={theme.colors.accent} />
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}> 
			<View style={styles.header}>
				<Text style={[styles.title, { color: theme.colors.text }]}>Tus objetivos</Text>
				<TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.card }]} onPress={() => setSide((p) => (p === 'front' ? 'back' : 'front'))}>
					<Ionicons name="refresh-outline" size={18} color={theme.colors.text} />
				</TouchableOpacity>
			</View>
			<Text style={[styles.subtitle, { color: theme.colors.text }]}>Grupos musculares seleccionados</Text>
			<View style={styles.bodyWrapper}>
				<Body
					data={data}
					gender="male"
					side={side}
					scale={1.3}
					border={theme.colors.card}
					colors={["#60A5FA", "#93C5FD"]}
				/>
			</View>
			{muscles.length === 0 ? (
				<Text style={[styles.empty, { color: theme.colors.text }]}>No tienes objetivos guardados aún.</Text>
			) : (
				<View style={styles.tags}>
					{muscles.map((m) => (
						<Text key={m} style={[styles.tag, { backgroundColor: theme.colors.card + '50', color: theme.colors.text, borderColor: theme.colors.card }]}>
							{m}
						</Text>
					))}
				</View>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 24,
		alignItems: 'center',
	},
	header: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	center: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		fontSize: 22,
		fontWeight: '800',
		marginTop: 24,
	},
	subtitle: {
		fontSize: 14,
		opacity: 0.7,
		marginBottom: 12,
	},
	bodyWrapper: {
		marginVertical: 12,
	},
	iconButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tags: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		justifyContent: 'center',
	},
	empty: {
		opacity: 0.7,
		marginTop: 8,
	},
	tag: {
		borderWidth: 1,
		borderRadius: 999,
		paddingHorizontal: 12,
		paddingVertical: 6,
		fontSize: 12,
		fontWeight: '700',
	},
});


