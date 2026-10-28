import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../theme';
import { IntentStep } from './onboarding/IntentStep';
import { OwnerProfileStep } from './onboarding/OwnerProfileStep';
import { PetProfileStep } from './onboarding/PetProfileStep';
import { ReviewProfileStep } from './onboarding/ReviewProfileStep';
import { api } from '../api/endpoints';
import { useAuth, useActivePet, useAppConfig } from '../context';
import { useNavigation } from '../navigation/NavigationContext';
import { ConnectionIntent, Species } from '../types';

export const OnboardingScreen: React.FC = () => {
  const { user, updateUser, setHasCompletedOnboarding, logout } = useAuth();
  const { addPet } = useActivePet();
  const { showToast } = useAppConfig();
  const { resetToMain } = useNavigation();

  // Navigation Steps: 1: Intent -> 2: Owner Profile -> 3: Pet Profile -> 4: Review & Launch
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  // Intent State
  const [selectedIntents, setSelectedIntents] = useState<ConnectionIntent[]>(
    user?.intentTags?.length ? user.intentTags : ['dating']
  );

  // Owner State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '24');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(
    (user?.gender as any) || 'female'
  );
  const [occupation, setOccupation] = useState(user?.occupation || 'UI/UX Designer');
  const [condoComplex, setCondoComplex] = useState(user?.condoComplex || 'Vinhomes Central Park');
  const [bio, setBio] = useState(
    user?.bio || 'Tìm người yêu cùng sở thích nuôi thú cưng & bạn dắt cún quanh công viên!'
  );

  // Pet State
  const [species, setSpecies] = useState<Species>('dog');
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('Corgi Pembroke');
  const [weightStr, setWeightStr] = useState('11');
  const [isVaccinated, setIsVaccinated] = useState(true);
  const [tags, setTags] = useState<string[]>(['Thân thiện', 'Tăng động']);
  const [petBio, setPetBio] = useState('Boss vui tươi, ngoan ngoãn và rất thích bạn bè.');

  const toggleIntent = (intent: ConnectionIntent) => {
    if (selectedIntents.includes(intent)) {
      if (selectedIntents.length > 1) {
        setSelectedIntents(selectedIntents.filter((x) => x !== intent));
      }
    } else {
      setSelectedIntents([...selectedIntents, intent]);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      // 1. Update Owner Profile & Intents
      await updateUser({
        fullName: fullName.trim() || 'Chủ Nuôi Pawty',
        age: parseInt(age, 10) || 25,
        gender,
        occupation: occupation.trim(),
        condoComplex,
        bio: bio.trim(),
        intentTags: selectedIntents,
      });

      // 2. Create Boss Profile
      const weightNum = parseFloat(weightStr) || 5;
      await addPet({
        name: petName.trim() || 'Boss',
        species,
        breed,
        weightKg: weightNum,
        isVaccinated,
        tags,
        habitsGood: ['Thân thiện', 'Đi vệ sinh đúng chỗ'],
        habitsBad: [],
        bio: petBio.trim() || 'Boss đáng yêu tìm bạn đi dạo chung quanh toà nhà!',
      });

      // 3. Mark Onboarding Completed & Launch Radar
      setHasCompletedOnboarding(true);
      showToast(`Chào mừng bạn và Boss ${petName || 'Boss'} gia nhập Pawty! 🎉`, 'success');
      resetToMain('Radar');
    } catch (err) {
      console.error('Finish onboarding error:', err);
      showToast('Có lỗi xảy ra khi tạo hồ sơ. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Top Navigation & Step Indicator Header */}
      <View style={styles.topBar}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>← Quay lại</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
            <Text style={styles.logoutBtnText}>Đổi tài khoản</Text>
          </TouchableOpacity>
        )}

        <View style={styles.stepIndicatorRow}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                step === s && styles.stepDotCurrent,
                step > s && styles.stepDotCompleted,
              ]}
            />
          ))}
          <Text style={styles.stepText}>{step}/4</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <IntentStep
            selectedIntents={selectedIntents}
            onToggleIntent={toggleIntent}
            onContinue={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <OwnerProfileStep
            fullName={fullName}
            setFullName={setFullName}
            age={age}
            setAge={setAge}
            gender={gender}
            setGender={setGender}
            occupation={occupation}
            setOccupation={setOccupation}
            condoComplex={condoComplex}
            setCondoComplex={setCondoComplex}
            bio={bio}
            setBio={setBio}
            onContinue={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <PetProfileStep
            species={species}
            setSpecies={setSpecies}
            petName={petName}
            setPetName={setPetName}
            breed={breed}
            setBreed={setBreed}
            weightStr={weightStr}
            setWeightStr={setWeightStr}
            isVaccinated={isVaccinated}
            setIsVaccinated={setIsVaccinated}
            tags={tags}
            setTags={setTags}
            petBio={petBio}
            setPetBio={setPetBio}
            onContinue={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <ReviewProfileStep
            fullName={fullName}
            age={age}
            occupation={occupation}
            condoComplex={condoComplex}
            bio={bio}
            selectedIntents={selectedIntents}
            petName={petName}
            species={species}
            breed={breed}
            weightStr={weightStr}
            isVaccinated={isVaccinated}
            tags={tags}
            petBio={petBio}
            loading={loading}
            onSubmit={handleFinishOnboarding}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.creamWarm,
  },
  backBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.coral,
    fontSize: 13,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  logoutBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.coral,
  },
  stepDotCurrent: {
    backgroundColor: COLORS.coral,
    width: 32,
  },
  stepText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.coral,
    fontWeight: '800',
    marginLeft: 4,
    fontSize: 12,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 48,
  },
});
