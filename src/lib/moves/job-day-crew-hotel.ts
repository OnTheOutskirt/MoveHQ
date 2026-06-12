import type { CrewLodgingSettings } from "@/lib/settings/ops-prep-rules";
import type { JobDayCrewHotel, MoveJobDay, MoveRecord } from "./types";

export function defaultRoomCount(crewSize: number, moversPerRoom: number): number {
  const perRoom = Math.max(1, moversPerRoom);
  return Math.max(1, Math.ceil(crewSize / perRoom));
}

export function computeCrewHotelClientCharge(input: {
  moverCount: number;
  roomCount?: number;
  roomRate: number;
  perDiemPerMover: number;
  moversPerRoom: number;
}): { roomCount: number; roomCharge: number; perDiemCharge: number; total: number } {
  const moverCount = Math.max(1, Math.round(input.moverCount));
  const roomCount = input.roomCount ?? defaultRoomCount(moverCount, input.moversPerRoom);
  const roomCharge = roomCount * Math.max(0, input.roomRate);
  const perDiemCharge = moverCount * Math.max(0, input.perDiemPerMover);
  return {
    roomCount,
    roomCharge,
    perDiemCharge,
    total: roomCharge + perDiemCharge,
  };
}

export function buildDefaultJobDayCrewHotel(
  jobDay: Pick<MoveJobDay, "crewSize">,
  settings: CrewLodgingSettings,
): JobDayCrewHotel {
  const moverCount = jobDay.crewSize ?? 4;
  const charge = computeCrewHotelClientCharge({
    moverCount,
    roomRate: settings.roomRatePerNight,
    perDiemPerMover: settings.perDiemPerMover,
    moversPerRoom: settings.moversPerRoom,
  });
  return {
    needed: true,
    moverCount,
    roomCount: charge.roomCount,
    roomRate: settings.roomRatePerNight,
    perDiemPerMover: settings.perDiemPerMover,
    clientCharge: charge.total,
  };
}

export function normalizeJobDayCrewHotel(
  raw: JobDayCrewHotel | undefined,
  settings: CrewLodgingSettings,
  crewSize?: number,
): JobDayCrewHotel | undefined {
  if (!raw?.needed) return undefined;
  const moverCount = raw.moverCount ?? crewSize ?? 4;
  const roomRate = raw.roomRate ?? settings.roomRatePerNight;
  const perDiemPerMover = raw.perDiemPerMover ?? settings.perDiemPerMover;
  const charge = computeCrewHotelClientCharge({
    moverCount,
    roomCount: raw.roomCount,
    roomRate,
    perDiemPerMover,
    moversPerRoom: settings.moversPerRoom,
  });
  return {
    needed: true,
    moverCount,
    roomCount: charge.roomCount,
    roomRate,
    perDiemPerMover,
    clientCharge: raw.clientCharge ?? charge.total,
    notes: raw.notes?.trim() || undefined,
  };
}

export function sumCrewHotelClientCharges(move: MoveRecord): number {
  return move.jobDays.reduce((sum, day) => {
    if (day.status === "cancelled") return sum;
    return sum + (day.crewHotel?.needed ? (day.crewHotel.clientCharge ?? 0) : 0);
  }, 0);
}

export function jobDaysWithCrewHotel(move: MoveRecord): MoveJobDay[] {
  return move.jobDays.filter(
    (day) => day.status !== "cancelled" && day.crewHotel?.needed === true,
  );
}

export function formatCrewHotelChargeSummary(hotel: JobDayCrewHotel): string {
  const rooms = hotel.roomCount ?? 1;
  const movers = hotel.moverCount ?? 1;
  const roomRate = hotel.roomRate ?? 0;
  const perDiem = hotel.perDiemPerMover ?? 0;
  const total = hotel.clientCharge ?? 0;
  return `${rooms} room${rooms === 1 ? "" : "s"} × $${roomRate} + ${movers} mover per diem × $${perDiem} = $${total}`;
}
