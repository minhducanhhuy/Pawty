import type {
  GeoPoint,
  PetVisualSignature,
  SightingTrajectoryPoint,
  SocialPost,
  SosAlert,
  SosMatchedPost,
  Species,
} from '@pawty/types';
import { calculateDistanceMeters } from '../social/pawrank.service';
import { GeminiVisionService } from './gemini-vision.service';

// Urban POI Landmark Geocoding Database for Vietnamese Metros
const URBAN_LANDMARK_MAP: Record<string, GeoPoint> = {
  // Vinhomes Grand Park (TP. Thủ Đức, TP.HCM)
  's1.01': { lat: 10.8412, lng: 106.8282 },
  's1.02': { lat: 10.8418, lng: 106.8289 },
  's1.03': { lat: 10.8425, lng: 106.8295 },
  's2.01': { lat: 10.8431, lng: 106.8312 },
  's2.03': { lat: 10.8438, lng: 106.8324 },
  's3.01': { lat: 10.8445, lng: 106.8335 },
  'công viên ánh sáng': { lat: 10.8455, lng: 106.8348 },
  'vinhomes grand park': { lat: 10.8428, lng: 106.8305 },

  // Vinhomes Central Park (Bình Thạnh, TP.HCM)
  'landmark 81': { lat: 10.7951, lng: 106.7218 },
  'landmark 4': { lat: 10.7942, lng: 106.7209 },
  'landmark 1': { lat: 10.7935, lng: 106.7202 },
  'park 1': { lat: 10.7925, lng: 106.7225 },
  'park 3': { lat: 10.7915, lng: 106.7238 },
  'công viên bờ sông vinhomes': { lat: 10.7905, lng: 106.7249 },
  'vinhomes central park': { lat: 10.7938, lng: 106.7222 },

  // Masteri Thảo Điền (TP. Thủ Đức, TP.HCM)
  'masteri thảo điền': { lat: 10.8012, lng: 106.7354 },
  'tháp t1 masteri': { lat: 10.8008, lng: 106.7348 },
  'tháp t4 masteri': { lat: 10.8019, lng: 106.7362 },

  // Phú Mỹ Hưng (Quận 7, TP.HCM)
  'cầu ánh sao': { lat: 10.7185, lng: 106.7192 },
  'hồ bán nguyệt': { lat: 10.7198, lng: 106.7181 },
  'phú mỹ hưng': { lat: 10.7245, lng: 106.7125 },

  // Hà Nội (Times City & Ocean Park)
  'times city': { lat: 20.9952, lng: 105.8679 },
  'vinhomes ocean park': { lat: 20.9928, lng: 105.9452 },
};

export class PetTracingService {
  private geminiVisionService = new GeminiVisionService();

  /**
   * Phân tích đặc trưng thị giác kết hợp Google Gemini 2.5 Flash Vision.
   * Nếu có URL ảnh, AI sẽ quét trực tiếp qua Vision API; nếu không sẽ fallback về phân tích text.
   */
  public async extractVisualSignatureWithAI(
    imageUrl?: string,
    text: string = '',
    speciesHint: Species = 'dog',
    breedHint = ''
  ): Promise<PetVisualSignature> {
    if (imageUrl) {
      const aiResult = await this.geminiVisionService.analyzePetImage(imageUrl, text);
      if (aiResult) {
        return aiResult;
      }
    }
    return this.extractVisualSignature(text, speciesHint, breedHint);
  }

  /**
   * Trích xuất đặc trưng thị giác từ thông tin ảnh hoặc mô tả thú cưng.
   * Kết hợp nhận diện loài, giống, màu lông và phụ kiện vòng cổ.
   */
  public extractVisualSignature(
    text: string,
    speciesHint: Species = 'dog',
    breedHint = ''
  ): PetVisualSignature {
    const lower = (text + ' ' + breedHint).toLowerCase();

    // 1. Nhận diện loài
    let species: Species = speciesHint;
    if (lower.includes('mèo') || lower.includes('cat') || lower.includes('miu')) {
      species = 'cat';
    } else if (lower.includes('chó') || lower.includes('cún') || lower.includes('dog')) {
      species = 'dog';
    }

    // 2. Nhận diện giống
    let breed = breedHint || 'Chưa rõ giống';
    const breedDict: Record<string, string> = {
      poodle: 'Poodle',
      corgi: 'Corgi',
      golden: 'Golden Retriever',
      husky: 'Husky',
      phốc: 'Phốc sóc (Pomeranian)',
      pomeranian: 'Pomeranian',
      pug: 'Pug',
      shiba: 'Shiba Inu',
      alaska: 'Alaskan Malamute',
      'anh lông ngắn': 'Mèo Anh lông ngắn',
      'anh lông dài': 'Mèo Anh lông dài',
      mướp: 'Mèo mướp',
      xiêm: 'Mèo Xiêm',
      'tam thể': 'Mèo tam thể',
    };

    for (const [key, val] of Object.entries(breedDict)) {
      if (lower.includes(key)) {
        breed = val;
        break;
      }
    }

    // 3. Nhận diện màu sắc
    let primaryColor = 'Nâu';
    if (lower.includes('trắng') || lower.includes('bạch')) primaryColor = 'Trắng';
    else if (lower.includes('vàng')) primaryColor = 'Vàng';
    else if (lower.includes('đen') || lower.includes('huyền')) primaryColor = 'Đen';
    else if (lower.includes('xám') || lower.includes('ghi')) primaryColor = 'Xám';
    else if (lower.includes('đỏ') || lower.includes('nâu đỏ')) primaryColor = 'Nâu đỏ';
    else if (lower.includes('đốm') || lower.includes('vện')) primaryColor = 'Vện đốm';

    // 4. Nhận diện phụ kiện vòng cổ
    const hasCollar =
      lower.includes('vòng cổ') ||
      lower.includes('đeo chuông') ||
      lower.includes('chuông') ||
      lower.includes('dây cổ');

    let collarColor: string | undefined;
    if (hasCollar) {
      if (lower.includes('chuông xanh') || lower.includes('xanh mint') || lower.includes('xanh'))
        collarColor = 'Xanh mint';
      else if (lower.includes('đỏ')) collarColor = 'Đỏ';
      else if (lower.includes('vàng')) collarColor = 'Vàng';
      else collarColor = 'Đen';
    }

    const distinctiveFeatures: string[] = [];
    if (lower.includes('cụt đuôi') || lower.includes('đuôi ngắn'))
      distinctiveFeatures.push('Đuôi ngắn');
    if (lower.includes('tai cụp')) distinctiveFeatures.push('Tai cụp');
    if (lower.includes('tai dựng')) distinctiveFeatures.push('Tai dựng');
    if (lower.includes('ức trắng') || lower.includes('đốm ngực'))
      distinctiveFeatures.push('Đốm trắng trước ngực');
    if (hasCollar) distinctiveFeatures.push(`Có đeo ${collarColor || ''} vòng cổ`);

    return {
      species,
      breed,
      primaryColor,
      hasCollar,
      collarColor,
      distinctiveFeatures,
    };
  }

  /**
   * Geocoding vị trí địa lý từ nội dung bài đăng tiếng Việt.
   */
  public geocodeLocationFromText(text: string, fallbackCoords?: GeoPoint): { name: string; coords: GeoPoint } {
    const lower = text.toLowerCase();
    for (const [landmark, coords] of Object.entries(URBAN_LANDMARK_MAP)) {
      if (lower.includes(landmark)) {
        return {
          name: landmark.charAt(0).toUpperCase() + landmark.slice(1),
          coords,
        };
      }
    }

    return {
      name: 'Khu vực lân cận',
      coords: fallbackCoords || { lat: 10.8428, lng: 106.8305 },
    };
  }

  /**
   * Tính toán độ tương đồng đa phương thức giữa Bài đăng Feed và Tin SOS.
   */
  public evaluateMatch(
    sosAlert: SosAlert,
    post: SocialPost,
    postVisualSig: PetVisualSignature,
    postCoords: GeoPoint,
    postLocationName: string
  ): SosMatchedPost | null {
    const sosVisual =
      sosAlert.visualSignatures ||
      this.extractVisualSignature(sosAlert.description, 'dog', sosAlert.petBreed);

    // 1. Visual Similarity (0 - 100)
    let visualScore = 40;
    if (sosVisual.species === postVisualSig.species) visualScore += 20;
    if (sosVisual.breed.toLowerCase().includes(postVisualSig.breed.toLowerCase()) ||
        postVisualSig.breed.toLowerCase().includes(sosVisual.breed.toLowerCase())) {
      visualScore += 20;
    }
    if (sosVisual.primaryColor === postVisualSig.primaryColor) visualScore += 10;
    if (sosVisual.hasCollar && postVisualSig.hasCollar) visualScore += 10;

    // 2. Text Keyword Similarity (0 - 100)
    const postTextLower = post.textContent.toLowerCase();
    const petNameLower = sosAlert.petName.toLowerCase();
    let textScore = 30;

    if (postTextLower.includes('lạc') || postTextLower.includes('thấy bé') || postTextLower.includes('chạy rông')) {
      textScore += 30;
    }
    if (postTextLower.includes(petNameLower)) {
      textScore += 40;
    }

    // 3. Spatiotemporal & Kinematic Check (0 - 100)
    const sosCoords = sosAlert.lastSeenCoords || { lat: 10.8418, lng: 106.8289 };
    const distanceMeters = calculateDistanceMeters(sosCoords, postCoords);

    // Không xét nếu ngoài bán kính tìm kiếm (mặc định 3km)
    const maxRadiusMeters = (sosAlert.radiusKm || 3) * 1000;
    if (distanceMeters > maxRadiusMeters) {
      return null;
    }

    const sosTime = new Date(sosAlert.createdAt).getTime();
    const postTime = new Date(post.createdAt).getTime();
    const elapsedHours = Math.max(0.1, Math.abs(postTime - sosTime) / (1000 * 60 * 60));
    const estimatedVelocityKmH = (distanceMeters / 1000) / elapsedHours;

    // Động học hợp lý: thú cưng di chuyển đi lạc thông thường <= 8 km/h
    let kinematicScore = 90;
    if (estimatedVelocityKmH > 8) {
      kinematicScore = 40; // Nghi vấn di chuyển bằng phương tiện hoặc sai lệch
    } else if (distanceMeters < 500) {
      kinematicScore = 100; // Cực gần điểm mất tích ban đầu
    }

    // Tổng hợp điểm số trọng số: 45% Visual + 25% Text + 30% Kinematic
    const compositeScore = Math.round(visualScore * 0.45 + textScore * 0.25 + kinematicScore * 0.30);

    // Chỉ coi là Match nếu đạt từ 70% trở lên
    if (compositeScore < 70) {
      return null;
    }

    return {
      id: `match-${sosAlert.id}-${post.id}`,
      sosAlertId: sosAlert.id,
      postId: post.id,
      postAuthorName: post.authorId,
      postText: post.textContent,
      postPhotoUrl: post.media?.[0]?.url,
      matchScore: compositeScore,
      visualSimilarity: visualScore,
      textSimilarity: textScore,
      kinematicPlausibility: kinematicScore,
      detectedLocationName: postLocationName || post.location?.name || 'Khu dân cư',
      detectedCoords: postCoords,
      detectedAt: post.createdAt,
      status: 'pending_review',
    };
  }

  /**
   * Quét bài đăng Feed bất đồng bộ với Google Gemini Vision đa phương thức
   * và đối chiếu toàn bộ các tin SOS đang thất lạc trong khu vực.
   */
  public async scanPostForSosMatchesAsync(
    post: SocialPost,
    activeSosAlerts: SosAlert[]
  ): Promise<SosMatchedPost[]> {
    const postImageUrl = post.media?.[0]?.url;
    const postVisualSig = await this.extractVisualSignatureWithAI(
      postImageUrl,
      post.textContent
    );
    const postLocation = this.geocodeLocationFromText(
      post.textContent,
      post.location?.point
    );

    const matches: SosMatchedPost[] = [];
    for (const sos of activeSosAlerts) {
      if (sos.status !== 'active') continue;
      const match = this.evaluateMatch(
        sos,
        post,
        postVisualSig,
        postLocation.coords,
        postLocation.name
      );
      if (match) {
        matches.push(match);
      }
    }
    return matches;
  }

  /**
   * Xây dựng chuỗi lộ trình di chuyển phỏng đoán (Spatiotemporal Trajectory).
   */
  public buildTrajectory(sosAlert: SosAlert): {
    sosId: string;
    startPoint: SightingTrajectoryPoint;
    trajectoryPoints: SightingTrajectoryPoint[];
    totalDistanceMeters: number;
    estimatedMovementSpeedKmH: number;
  } {
    const startCoords = sosAlert.lastSeenCoords || { lat: 10.8418, lng: 106.8289 };
    const startPoint: SightingTrajectoryPoint = {
      id: `point-start-${sosAlert.id}`,
      sosAlertId: sosAlert.id,
      timestamp: sosAlert.createdAt,
      lat: startCoords.lat,
      lng: startCoords.lng,
      locationName: sosAlert.lastSeenLocation || 'Điểm mất tích ban đầu',
      source: 'initial_lost',
      confidenceScore: 1.0,
      photoUrl: sosAlert.petAvatar,
      note: 'Điểm nhìn thấy Boss lần cuối',
    };

    const points: SightingTrajectoryPoint[] = [startPoint];

    // 1. Thêm các manh mối từ cộng đồng gửi về (SosSighting)
    if (sosAlert.sightings && sosAlert.sightings.length > 0) {
      for (const s of sosAlert.sightings) {
        const coords = s.coords || this.geocodeLocationFromText(s.locationName, startCoords).coords;
        points.push({
          id: `point-sighting-${s.id}`,
          sosAlertId: sosAlert.id,
          timestamp: s.createdAt,
          lat: coords.lat,
          lng: coords.lng,
          locationName: s.locationName,
          source: 'community_sighting',
          confidenceScore: 0.9,
          photoUrl: s.photoUrl,
          reporterName: s.reporterName,
          note: s.note,
        });
      }
    }

    // 2. Thêm các bài đăng mạng xã hội đã được AI quét khớp (SosMatchedPost)
    if (sosAlert.matchedPosts && sosAlert.matchedPosts.length > 0) {
      for (const m of sosAlert.matchedPosts) {
        if (m.status !== 'dismissed') {
          points.push({
            id: `point-match-${m.id}`,
            sosAlertId: sosAlert.id,
            timestamp: m.detectedAt,
            lat: m.detectedCoords.lat,
            lng: m.detectedCoords.lng,
            locationName: m.detectedLocationName,
            source: 'ai_feed_match',
            confidenceScore: Number((m.matchScore / 100).toFixed(2)),
            photoUrl: m.postPhotoUrl,
            postId: m.postId,
            reporterName: m.postAuthorName,
            note: `AI phát hiện khớp ${m.matchScore}% qua ảnh bài đăng`,
          });
        }
      }
    }

    // Sắp xếp các điểm theo dòng thời gian tăng dần
    points.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Tính tổng quãng đường di chuyển lũy kế
    let totalDistanceMeters = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistanceMeters += calculateDistanceMeters(
        { lat: points[i - 1].lat, lng: points[i - 1].lng },
        { lat: points[i].lat, lng: points[i].lng }
      );
    }

    const firstTime = new Date(points[0].timestamp).getTime();
    const lastTime = new Date(points[points.length - 1].timestamp).getTime();
    const elapsedHours = Math.max(0.1, (lastTime - firstTime) / (1000 * 60 * 60));
    const estimatedMovementSpeedKmH = Number(((totalDistanceMeters / 1000) / elapsedHours).toFixed(2));

    return {
      sosId: sosAlert.id,
      startPoint,
      trajectoryPoints: points,
      totalDistanceMeters,
      estimatedMovementSpeedKmH,
    };
  }
}

