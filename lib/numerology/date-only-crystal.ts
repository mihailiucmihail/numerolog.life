import { birthDateSchema } from './progressive-input'
import { calculateDateLifeCharts } from './date-only-life-charts'

function reduce22(value: number): number {
  if (value > 22) value -= 22 * Math.floor((value - 1) / 22)
  return value <= 0 ? 22 : value
}

function digitSum(value: number): number {
  return Math.sign(value) * [...String(Math.abs(value))].reduce((sum, digit) => sum + Number(digit), 0)
}

function lastNonzeroDigit(value: number): number {
  return Number([...String(value)].reverse().find(digit => digit !== '0') || 0)
}

/** Only date-derived calculations. No name normalization, nominal chart or inferred gender runs here. */
export function calculateDateOnlyCrystal(input: unknown, today = new Date()) {
  const birth = birthDateSchema(today).parse(input)
  const { day, month, year } = birth
  const TaroDay = reduce22(day)
  const TaroMonth = reduce22(month)
  const TaroYear = reduce22(digitSum(year))
  const childhoodQuotient = Number(`${day}${String(month).padStart(2, '0')}`) / 7
  const childhoodDigit = Math.floor((childhoodQuotient - Math.floor(childhoodQuotient)) * 10)
  const WorkNum_1 = digitSum(Number(`${day}${month}${year}`))
  const WorkNum_2 = digitSum(WorkNum_1)
  const WorkNum_3 = WorkNum_1 - 2 * Number(String(day)[0])
  const WorkNum_4 = digitSum(WorkNum_3)
  const WorkNum_5 = WorkNum_1 + 2 * lastNonzeroDigit(year)
  const WorkNum_6 = digitSum(WorkNum_5)
  const TP = reduce22(TaroDay + TaroMonth)
  const TP_DOP = day < 14 ? day : day > 22 ? reduce22(day) : null
  const OPV = reduce22(Math.abs(TaroDay - TaroMonth))
  const OPV_DOP = day >= 14 && day <= 22 ? day : null
  const TP_4 = reduce22(TaroMonth + TaroYear)
  const ZK = reduce22(TaroDay + 2 * TaroMonth + TaroYear)
  const SZ_num = reduce22(TaroDay + TaroMonth + TaroYear)
  const Prof_num = reduce22(ZK + SZ_num)
  const fateTrapNum = reduce22(Math.abs(OPV - SZ_num))
  const KCH_num = reduce22(Math.abs(TaroDay - TaroYear))
  const karmicLesson1_num = reduce22(TaroDay + OPV)
  const secretWishNum = reduce22(TaroDay + TaroMonth + 2 * TaroYear)
  const KN_2 = reduce22(Math.abs(TaroDay - TaroYear))
  const KN_3 = reduce22(Math.abs(OPV - KN_2))
  const KN_4 = reduce22(Math.abs(TaroMonth - TaroYear))
  const lowerTotal = reduce22(OPV + KN_2 + KN_3 + KN_4)
  const upperSecond = reduce22(TaroDay + TaroYear)
  const upperThird = reduce22(TP + upperSecond)
  const upperTotal = reduce22(TP + upperSecond + upperThird + TP_4)
  const counts: Record<number, number> = Object.fromEntries(Array.from({ length: 9 }, (_, index) => [index + 1, 0]))
  for (const digit of `${day}${month}${year}`) if (digit !== '0') counts[Number(digit)]++
  const maturityStart = WorkNum_1 + 10
  const karmicValues = [OPV_DOP, OPV, KN_2, KN_3, KN_4, lowerTotal].filter((value): value is number => value !== null)
  const repeatCount = Math.max(...karmicValues.map(value => karmicValues.filter(other => other === value).length))
  const baseRaw = 55 - (2 * month + day) || 53
  let layer1 = baseRaw
  for (let index = 0; index < repeatCount; index++) layer1 += layer1 < 40 ? 13 : 1
  layer1 = Math.min(layer1, 53)

  return {
    ...calculateDateLifeCharts(birth, layer1, today),
    baseRaw, layer1, repeatCount,
    karmicLayerAges: Array.from({ length: 7 }, (_, index) => layer1 + 9 * index),
    kind: 'date-only' as const,
    birth,
    TaroDay, TaroMonth, TaroYear, childhoodDigit,
    WorkNum_1, WorkNum_2, WorkNum_3, WorkNum_4, WorkNum_5, WorkNum_6,
    TP, TP_DOP, TP_4, OPV, OPV_DOP, ZK, SZ_num, Prof_num,
    fateTrapNum, KCH_num, karmicLesson1_num, secretWishNum,
    KN_2, KN_3, KN_4,
    karmaTableUpperRow: [TP, upperSecond, upperThird, TP_4, upperTotal],
    karmaTableLowerRow: [OPV, KN_2, KN_3, KN_4, lowerTotal],
    counts,
    opornyeActive: Object.keys(counts).map(Number).filter(digit => counts[digit] >= 2),
    metacycles: {
      mc1: WorkNum_1,
      mc2: WorkNum_1 + 9,
      Dt: TaroDay, Mt: TaroMonth, Gt: TaroYear,
      maturityPeriods: Array.from({ length: 8 }, (_, index) => ({
        from: maturityStart + 9 * index,
        to: maturityStart + 9 * index + 8,
        base: TaroYear,
        secondary: index === 0 ? null : reduce22(TaroYear + index),
      })),
    },
  }
}

export type DateOnlyCrystal = ReturnType<typeof calculateDateOnlyCrystal>
