import type { AdminKpi, KpiSeriesPoint } from './adminTypes';

type LooseRecord = Record<string, unknown>;

const asNumber = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

function normalizeSeriesPoint(rawPoint: LooseRecord): KpiSeriesPoint {
  return {
    date: String(rawPoint.date ?? ''),
    dau: asNumber(rawPoint.dau),
    newPets: asNumber(rawPoint.newPets),
    matches: asNumber(rawPoint.matches),
    appointmentsCreated: asNumber(rawPoint.appointmentsCreated),
    appointmentsCompleted: asNumber(rawPoint.appointmentsCompleted),
  };
}

/**
 * Hợp đồng §5.10 chỉ nêu "KPI mục 4.12 + chuỗi 14 ngày" mà chưa chốt tên field,
 * nên chuẩn hoá có giá trị mặc định để dashboard không vỡ nếu server thiếu một chỉ số.
 */
export function normalizeKpi(raw: unknown): AdminKpi {
  const kpi = (raw ?? {}) as LooseRecord;
  const revenue = (kpi.revenueBySource ?? {}) as LooseRecord;
  const northStar = kpi.northStar;
  const rawSeries = (kpi.series ?? kpi.last14Days ?? kpi.daily ?? []) as LooseRecord[];

  return {
    dau: asNumber(kpi.dau),
    mau: asNumber(kpi.mau),
    totalUsers: asNumber(kpi.totalUsers),
    newPetsToday: asNumber(kpi.newPetsToday),
    matchesToday: asNumber(kpi.matchesToday),
    appointmentsCreatedToday: asNumber(kpi.appointmentsCreatedToday),
    appointmentsCompletedToday: asNumber(kpi.appointmentsCompletedToday),
    flakeRate: asNumber(kpi.flakeRate),
    revenueBySource: { sos: asNumber(revenue.sos), vip: asNumber(revenue.vip), iap: asNumber(revenue.iap), ads: asNumber(revenue.ads) },
    openReports: asNumber(kpi.openReports),
    vaccinePending: asNumber(kpi.vaccinePending),
    partnersPending: asNumber(kpi.partnersPending),
    northStarCompletedThisWeek:
      typeof northStar === 'number'
        ? northStar
        : asNumber((northStar as LooseRecord | undefined)?.completedAppointmentsThisWeek ?? kpi.northStarCompletedThisWeek),
    series: rawSeries.map(normalizeSeriesPoint),
  };
}
