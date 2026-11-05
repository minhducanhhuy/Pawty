import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getCoordinatesForArea(areaOrDistrict?: string, indexSeed = 0): { lat: number; lng: number } {
  const norm = (areaOrDistrict || '').toLowerCase();

  // Specific Landmark / Complex in HCMC
  if (norm.includes('grand park')) return { lat: 10.8491, lng: 106.8415 };
  if (norm.includes('central park') || norm.includes('landmark 81')) return { lat: 10.7952, lng: 106.7218 };
  if (norm.includes('sunwah pearl')) return { lat: 10.7891, lng: 106.7166 };
  if (norm.includes('opal riverside')) return { lat: 10.8245, lng: 106.7215 };
  if (norm.includes('thảo điền') || norm.includes('thao dien')) return { lat: 10.8037, lng: 106.7325 };
  if (norm.includes('masteri an phú') || norm.includes('masteri')) return { lat: 10.8033, lng: 106.7412 };
  if (norm.includes('đảo kim cương') || norm.includes('dao kim cuong')) return { lat: 10.7758, lng: 106.7554 };
  if (norm.includes('thủ thiêm') || norm.includes('thu thiem')) return { lat: 10.7836, lng: 106.7212 };
  if (norm.includes('gateway')) return { lat: 10.8042, lng: 106.7455 };
  if (norm.includes('sailing tower') || norm.includes('bến nghé') || norm.includes('ben nghe')) return { lat: 10.7796, lng: 106.6961 };
  if (norm.includes('ba son') || norm.includes('golden river')) return { lat: 10.7852, lng: 106.7088 };
  if (norm.includes('grand manhattan')) return { lat: 10.7615, lng: 106.6912 };
  if (norm.includes('goldview')) return { lat: 10.7588, lng: 106.6946 };
  if (norm.includes('saigon royal')) return { lat: 10.7672, lng: 106.7042 };
  if (norm.includes('phú mỹ hưng') || norm.includes('phu my hung') || norm.includes('midtown') || norm.includes('sky garden')) return { lat: 10.7288, lng: 106.7085 };
  if (norm.includes('sunrise city')) return { lat: 10.7505, lng: 106.7001 };
  if (norm.includes('nam kỳ khởi nghĩa') || norm.includes('nam ky khoi nghia')) return { lat: 10.7844, lng: 106.6875 };

  // Specific Landmark / Complex in Hanoi
  if (norm.includes('discovery complex')) return { lat: 21.0366, lng: 105.7932 };
  if (norm.includes('indochina plaza') || norm.includes('ipha')) return { lat: 21.0372, lng: 105.7835 };
  if (norm.includes('smart city')) return { lat: 20.9995, lng: 105.7428 };
  if (norm.includes('the manor')) return { lat: 21.0152, lng: 105.7765 };
  if (norm.includes('metropolis') || norm.includes('liễu giai') || norm.includes('lieu giai')) return { lat: 21.0322, lng: 105.8152 };
  if (norm.includes('quảng an') || norm.includes('quang an') || norm.includes('hồ tây') || norm.includes('ho tay')) return { lat: 21.0667, lng: 105.8285 };
  if (norm.includes('thụy khuê') || norm.includes('thuy khue')) return { lat: 21.0445, lng: 105.8232 };
  if (norm.includes('nguyễn chí thanh') || norm.includes('nguyen chi thanh')) return { lat: 21.0245, lng: 105.8112 };
  if (norm.includes('times city')) return { lat: 20.9952, lng: 105.8675 };
  if (norm.includes('royal city')) return { lat: 21.0028, lng: 105.8155 };

  // General Hanoi districts
  if (norm.includes('cầu giấy') || norm.includes('cau giay')) return { lat: 21.0333, lng: 105.7894 };
  if (norm.includes('đống đa') || norm.includes('dong da')) return { lat: 21.0180, lng: 105.8290 };
  if (norm.includes('hoàn kiếm') || norm.includes('hoan kiem')) return { lat: 21.0285, lng: 105.8542 };
  if (norm.includes('ba đình') || norm.includes('ba dinh')) return { lat: 21.0341, lng: 105.8202 };
  if (norm.includes('tây hồ') || norm.includes('tay ho')) return { lat: 21.0716, lng: 105.8230 };
  if (norm.includes('thanh xuân') || norm.includes('thanh xuan')) return { lat: 20.9937, lng: 105.8122 };
  if (norm.includes('hai bà trưng') || norm.includes('hai ba trung')) return { lat: 21.0076, lng: 105.8576 };
  if (norm.includes('nam từ liêm') || norm.includes('nam tu liem') || norm.includes('mỹ đình') || norm.includes('my dinh')) return { lat: 21.0125, lng: 105.7663 };
  if (norm.includes('bắc từ liêm') || norm.includes('bac tu liem')) return { lat: 21.0754, lng: 105.7656 };
  if (norm.includes('hà đông') || norm.includes('ha dong')) return { lat: 20.9631, lng: 105.7720 };
  if (norm.includes('long biên') || norm.includes('long bien')) return { lat: 21.0360, lng: 105.8920 };
  if (norm.includes('hoàng mai') || norm.includes('hoang mai')) return { lat: 20.9740, lng: 105.8480 };

  // General HCMC districts
  if (norm.includes('quận 1') || norm.includes('quan 1')) return { lat: 10.7769, lng: 106.7009 };
  if (norm.includes('quận 2') || norm.includes('quan 2')) return { lat: 10.7872, lng: 106.7498 };
  if (norm.includes('quận 3') || norm.includes('quan 3')) return { lat: 10.7844, lng: 106.6844 };
  if (norm.includes('quận 4') || norm.includes('quan 4')) return { lat: 10.7635, lng: 106.6985 };
  if (norm.includes('quận 7') || norm.includes('quan 7')) return { lat: 10.7340, lng: 106.7218 };
  if (norm.includes('quận 10') || norm.includes('quan 10')) return { lat: 10.7716, lng: 106.6669 };
  if (norm.includes('bình thạnh') || norm.includes('binh thanh')) return { lat: 10.8105, lng: 106.7091 };
  if (norm.includes('thủ đức') || norm.includes('thu duc')) return { lat: 10.8494, lng: 106.7537 };
  if (norm.includes('phú nhuận') || norm.includes('phu nhuan')) return { lat: 10.7992, lng: 106.6806 };
  if (norm.includes('tân bình') || norm.includes('tan binh')) return { lat: 10.8015, lng: 106.6526 };

  if (norm.includes('hà nội') || norm.includes('ha noi')) {
    const spread = (indexSeed % 7) * 0.008;
    return { lat: 21.0285 + spread, lng: 105.8542 + (indexSeed % 5) * 0.007 };
  }
  const spread = (indexSeed % 8) * 0.009;
  return { lat: 10.7769 + spread, lng: 106.7009 + (indexSeed % 6) * 0.008 };
}

async function syncAllUserCoordinates() {
  console.log('[SyncCoords] Bắt đầu đồng bộ tọa độ GPS thực tế cho toàn bộ users trong database...');
  const users = await prisma.user.findMany({
    select: { id: true, displayName: true, district: true, neighborhood: true },
  });

  let updatedCount = 0;
  for (let idx = 0; idx < users.length; idx++) {
    const u = users[idx];
    const coords = getCoordinatesForArea(u.neighborhood || u.district || undefined, idx);

    const existingEvent = await prisma.analyticsEvent.findFirst({
      where: { userId: u.id, eventType: 'user_profile_meta' },
      orderBy: { createdAt: 'desc' },
    });

    const currentData =
      existingEvent?.eventData && typeof existingEvent.eventData === 'object'
        ? (existingEvent.eventData as Record<string, any>)
        : {};

    const updatedData = {
      ...currentData,
      latitude: coords.lat,
      longitude: coords.lng,
    };

    if (existingEvent) {
      await prisma.analyticsEvent.update({
        where: { id: existingEvent.id },
        data: { eventData: updatedData },
      });
    } else {
      await prisma.analyticsEvent.create({
        data: {
          userId: u.id,
          eventType: 'user_profile_meta',
          eventData: updatedData,
        },
      });
    }

    console.log(`✅ [${idx + 1}/${users.length}] ${u.displayName} (${u.neighborhood || u.district}): lat=${coords.lat}, lng=${coords.lng}`);
    updatedCount++;
  }

  console.log(`[SyncCoords] Đã đồng bộ tọa độ GPS thành công cho ${updatedCount} users!`);
}

syncAllUserCoordinates()
  .catch((e) => {
    console.error('[SyncCoords] Lỗi đồng bộ tọa độ:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
