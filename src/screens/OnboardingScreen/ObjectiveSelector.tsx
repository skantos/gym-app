import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Body from 'react-native-body-highlighter';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type ObjectiveSelectorProps = {
	selected: string[];
	onChange: (nextSelected: string[]) => void;
};

const MUSCLE_LABELS: Record<string, string> = {
	chest: 'Pectorales',
	biceps: 'Bíceps',
	triceps: 'Tríceps',
	deltoids: 'Hombros',
	forearm: 'Antebrazos',
	trapezius: 'Trapecio',
	"upper-back": 'Espalda alta',
	"lower-back": 'Espalda baja',
	obliques: 'Oblicuos',
	abs: 'Abdomen',
	quadriceps: 'Cuádriceps',
	hamstring: 'Isquiotibiales',
	gluteal: 'Glúteos',
	adductors: 'Aductores',
	calves: 'Pantorrillas',
	neck: 'Cuello',
};

const ALLOWED_SLUGS = Object.keys(MUSCLE_LABELS);

export default function ObjectiveSelector({ selected, onChange }: ObjectiveSelectorProps) {
	const theme = useTheme();
	const [side, setSide] = useState<'front' | 'back'>('front');

	const data = useMemo(() => selected.map((slug) => ({ slug, intensity: 2 })), [selected]);

	const toggle = (slug: string) => {
		if (!ALLOWED_SLUGS.includes(slug)) return;
		if (selected.includes(slug)) {
			onChange(selected.filter((s) => s !== slug));
		} else {
			onChange([...selected, slug]);
		}
	};

	return (
		<View style={[styles.container]}>
			<View style={styles.header}>
				<Text style={[styles.title, { color: theme.colors.text }]}>¿Qué músculos quieres trabajar?</Text>
				<View style={styles.actions}>
					<TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.card }]} onPress={() => setSide((p) => (p === 'front' ? 'back' : 'front'))}>
						<Ionicons name="refresh-outline" size={18} color={theme.colors.text} />
					</TouchableOpacity>
					<TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.card }]}>
						<Ionicons name="information-circle-outline" size={18} color={theme.colors.text} />
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.bodyWrapper}>
				<Body
					data={data}
					gender="male"
					side={side}
					scale={1.25}
					border={theme.colors.card}
					colors={["#6B7280", "#9CA3AF"]}
					onBodyPartPress={(bp: any) => toggle(bp.slug)}
				/>
			</View>

			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContainer}>
				{ALLOWED_SLUGS.map((slug) => {
					const isSelected = selected.includes(slug);
					return (
						<TouchableOpacity
							key={slug}
							style={[styles.pill, { borderColor: isSelected ? theme.colors.accent : theme.colors.card, backgroundColor: theme.colors.card + '60' }]}
							onPress={() => toggle(slug)}
						>
							<Text style={[styles.pillText, { color: theme.colors.text }]}>{MUSCLE_LABELS[slug] ?? slug}</Text>
						</TouchableOpacity>
					);
				})}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 16,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
	},
	actions: {
		flexDirection: 'row',
		gap: 8,
	},
	iconButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	bodyWrapper: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 8,
	},
	pillsContainer: {
		gap: 8,
		paddingVertical: 6,
	},
	pill: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		borderWidth: 1,
	},
	pillText: {
		fontSize: 12,
		fontWeight: '600',
	},
});


