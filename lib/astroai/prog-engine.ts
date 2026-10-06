// @ts-nocheck
/* eslint-disable */
/**
 * Motorul modulului «Prognoza» (prog_engine.js), copiat neschimbat din raportul private/astroai/prog.html,
 * ca pagina de intrare să calculeze exact ca raportul. Nu edita aici: actualizează din raport.
 */

/* prog_engine.js — движок модуля «Прогноз»
 * Источники (Айрэн По и Джули По):
 *  [ПР]  «Пророчество. Мир на грани» (Книга 15), гл. I–II (печатные стр.; PDF = стр.+1)
 *  [XL]  «нумерология 22.xlsm», лист «Прогностика» (эталон пользователя) — только там, где книга отсылает к «программе»
 *  [КДР] «Карма в дате рождения» — циклы обратки кармы (с.183–190), события подсознания (с.60–72), сожаления (с.72–74)
 *  [КАЛ] «Календарь нумеролога» — матричный код (с.33) и годы кода (с.34–59)
 *  [ВН]  «Векторная нумерология» — активная карта по годам (с.261–262)
 *  [СК]  «Сакральные коды Матрицы» — критические/узловые годы (с.259–263), матричные циклы (с.218–222)
 *  [НС]  «Нумерология совместимости» — график семейных отношений (брака), гл.3 (PDF 201–215)
 *  [ЭС]  «Энергосистема человека» — бионумерологические ритмы (с.321–331; базовый ряд не сверен, см. тесты)
 *  2-й проход: [ПР] 1.11/2.7 юрлица, 2.9–2.10 типы союзов, 2.5 внешние числа дня/месяца, [КДР] «Воспитание Кармой»
 * Чистый JS без зависимостей. Node: module.exports; браузер: var PROG.
 * Все даты — объекты {d,m,y} (григорианские). Никаких Date с часовыми поясами.
 */
var PROG = (function () {
  'use strict';

  /* ---------- базовая арифметика ---------- */
  function red(n, lim) { // свёртка к [1..lim] вычитанием lim; 0 -> lim  ([ПР] с.83, 86, 88, 195)
    n = Math.abs(Math.round(n));
    if (n === 0) return lim;
    while (n > lim) n -= lim;
    return n;
  }
  function r22(n) { return red(n, 22); }
  function r56(n) { return red(n, 56); }
  function digits(str) { return String(str).replace(/\D/g, '').split('').map(Number); }
  function dsum(str) { return digits(str).reduce(function (a, b) { return a + b; }, 0); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function dateStr(dt) { return pad2(dt.d) + pad2(dt.m) + String(dt.y); } // ДДММГГГГ с нулями
  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function dim(m, y) { return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]; }
  function cmp(a, b) { return a.y !== b.y ? a.y - b.y : a.m !== b.m ? a.m - b.m : a.d - b.d; }
  function addDays(dt, k) {
    var d = dt.d + k, m = dt.m, y = dt.y;
    while (d > dim(m, y)) { d -= dim(m, y); m++; if (m > 12) { m = 1; y++; } }
    while (d < 1) { m--; if (m < 1) { m = 12; y--; } d += dim(m, y); }
    return { d: d, m: m, y: y };
  }
  function birthdayIn(birth, y) { // день рождения в году y (29.02 -> 28.02 в невисокосный)
    var d = birth.d;
    if (birth.m === 2 && d === 29 && !isLeap(y)) d = 28;
    return { d: d, m: birth.m, y: y };
  }
  function ageOn(birth, date) { // полных лет на дату
    var a = date.y - birth.y;
    if (cmp(date, birthdayIn(birth, date.y)) < 0) a--;
    return a;
  }
  function solarYear(birth, date) { // год, в котором начался текущий соляр ([ПР] с.105; [XL] SolarDate)
    return cmp(date, birthdayIn(birth, date.y)) >= 0 ? date.y : date.y - 1;
  }

  /* ---------- алфавит (русская буквица, [ПР] с.94) ---------- */
  var RU = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
  var RU_VAL = [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6];
  var LAT = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // [Программа судьбы] с.43
  function letterVal(ch) {
    ch = ch.toUpperCase();
    var i = RU.indexOf(ch); if (i >= 0) return RU_VAL[i];
    i = LAT.indexOf(ch); if (i >= 0) return (i % 9) + 1;
    return 0;
  }
  function nameArcanum(name) { // аркан имени: сумма цифр букв полного имени, свёртка к 22 ([ПР] с.95: Мирослав=31->9)
    var s = 0;
    String(name).split('').forEach(function (c) { s += letterVal(c); });
    return r22(s);
  }

  /* ---------- арканный вид даты ([ПР] 1.1, с.83–85) ---------- */
  function arcDate(dt) { return { Dt: r22(dt.d), Mt: dt.m, Gt: r22(dsum(dt.y)) }; }

  /* ---------- Кармические узлы / строки Кармы ([ПР] 1.5–1.8; скрытые — [XL] + пример книги с.191, 228, 271) ---------- */
  var BLOCKING = { // неизбежные (блокирующие) арканы по ячейкам, [ПР] с.137–145 (сводка с.145)
    1: [10, 13, 14, 15, 16],
    2: [1, 2, 3, 5, 6, 9, 13, 15, 16, 20, 22],
    3: [4, 7, 8, 10, 11, 13, 14, 15, 16, 17, 19],
    4: [3, 9, 11, 12, 13, 14, 15, 16, 18, 20, 22],
    5: [9, 11, 13, 15, 16]
  };
  function karmaMatrix(birth) {
    var a = arcDate(birth), D = a.Dt, M = a.Mt, G = a.Gt;
    var opvD = (D >= 14 && D <= 22) ? D : null;            // ОПВд  (с.112)
    var opv = r22(Math.abs(D - M));                           // ОПВ   (с.112)
    var kch = r22(Math.abs(D - G));                           // КЧХ   (с.113)
    var c3 = r22(Math.abs(opv - kch));                        // III ячейка — [XL] N6; книга: «из программы» (с.191: Дмитрий=1)
    var eb = r22(Math.abs(M - G));                            // ЭБ    (с.113)
    var c5 = r22(opv + kch + c3 + eb);                        // V (ГЧК−) — [XL] P6; с.191 Дмитрий=5; [КДР] с.188 ГЧК−=16
    var c5d = opvD ? r22(opvD + opv + kch + c3 + eb) : null;  // V с ОПВд — книга с.191 «5,21» (Дмитрий 21)
    var tp1 = r22(D + M), tp2 = r22(D + G), tp3 = r22(tp1 + tp2), tp4 = r22(M + G), tp5 = r22(tp1 + tp2 + tp3 + tp4);
    var bottom = [
      opvD ? [opvD, opv] : [opv],
      [kch], [c3], [eb],
      c5d ? [c5, c5d] : [c5]
    ];
    var top = [[tp1], [tp2], [tp3], [tp4], [tp5]];
    // 1.8: верхний знак, совпавший с любым нижним, вычёркивается везде (с.125)
    var allBottom = [].concat.apply([], bottom);
    var crossed = top.map(function (cell) { return cell.map(function (v) { return allBottom.indexOf(v) >= 0; }); });
    // Циклы Кармы (1.7, с.122–124)
    var chzp = (function (n) { while (n > 9) n = dsum(n); return n === 0 ? 9 : n; })(dsum(dateStr(birth)));
    var k1 = 36 - chzp, k2 = k1 + 9, k3 = k2 + 9;
    var cycles = [[0, k1], [k1 + 1, k2], [k2 + 1, k3], [k3 + 1, Infinity], [0, Infinity]];
    // блокирующие (неизбежные) в нижней строке
    var blocking = bottom.map(function (cell, i) { return cell.filter(function (v) { return BLOCKING[i + 1].indexOf(v) >= 0; }); });
    return { arc: a, opvD: opvD, opv: opv, kch: kch, c3: c3, eb: eb, c5: c5, c5d: c5d,
      tp: [tp1, tp2, tp3, tp4, tp5], top: top, bottom: bottom, crossed: crossed,
      chzp: chzp, cycles: cycles, blocking: blocking,
      nodes: uniq(allBottom) };
  }
  function uniq(arr) { var o = []; arr.forEach(function (v) { if (v != null && o.indexOf(v) < 0) o.push(v); }); return o.sort(function (a, b) { return a - b; }); }

  /* ---------- Тень Кармы ([ПР] 1.4, с.102–106) ---------- */
  function shadowStep(birth) { var a = arcDate(birth); return r22(Math.abs(a.Dt - a.Mt)); }
  function shadowPeriod(step, age) { return age <= 0 ? 1 : Math.ceil(age / step); } // [0..s],[s+1..2s],...
  function shadowSign(birth, age) { // +1 положительная, −1 отрицательная
    var s = shadowStep(birth), p = shadowPeriod(s, age);
    var sign = (p % 2 === 1) ? 1 : -1;       // нечётные периоды «+», чётные «−»
    return s === 1 ? -sign : sign;            // при шаге 1 — наоборот (с.103)
  }

  /* ---------- Сетка возрастов ([ПР] 1.10, с.148–158) ---------- */
  function ageCell(age) { return (age % 5) + 1; }          // столбец таблицы 0..4 -> ячейка I..V
  function ageRow(age) { return (Math.floor(age / 5) % 2 === 0) ? 'Н' : 'В'; } // 0–4 Н, 5–9 В, 10–14 Н ...
  function inCycle(km, cell, age) { var c = km.cycles[cell - 1]; return age >= c[0] && age <= c[1]; }
  function ageInfo(birth, age) {
    var km = karmaMatrix(birth);
    var cell = ageCell(age), row = ageRow(age);
    var framed = inCycle(km, cell, age);
    var neg = shadowSign(birth, age) < 0;
    var blockingActive = [1, 2, 3, 4, 5].some(function (c) { return km.blocking[c - 1].length && inCycle(km, c, age); });
    var turning = framed && neg && row === 'В';
    var category = !neg ? 1 : (turning ? 4 : ((framed || blockingActive) ? 3 : 2));
    return { age: age, cell: cell, row: row, framed: framed, negShadow: neg, blockingActive: blockingActive,
      turning: turning, category: category };
  }
  // Кармические узлы, действующие в данном возрасте (с учётом переворота строки, с.158–160, 228, 244–245)
  function karmaFor(birth, age) {
    var km = karmaMatrix(birth), info = ageInfo(birth, age);
    var bottom = km.bottom.map(function (c) { return c.slice(); });
    var swapped = null;
    if (info.turning) {
      var i = info.cell - 1;
      swapped = { cell: info.cell, down: km.top[i].slice(), up: bottom[i].slice() };
      bottom[i] = km.top[i].slice();   // верхний знак спускается (вычеркнутый становится активным, с.159)
    }
    var flat = [].concat.apply([], bottom);
    return { nodes: uniq(flat), bottom: bottom, swapped: swapped, info: info, km: km };
  }

  /* ---------- Кармичность: правила 1–13 ([ПР] с.186, 230–232) ---------- */
  // vals: {ZS,TS,TZS,TTS, ZS5,TS5,TZS5,TTS5} ; возвращает множество отрицательных ключей
  var PAIRS = { ZS: 'TS', TS: 'ZS', ZS5: 'TS5', TS5: 'ZS5' };
  function markNegative(vals, nodes) {
    var keys = Object.keys(vals), neg = {};
    keys.forEach(function (k) { if (nodes.indexOf(vals[k]) >= 0) neg[k] = true; });   // правила 1–4, 7–10
    var changed = true;
    while (changed) {                                                                    // правила 1–2, 5–6, 11–13 (каскад)
      changed = false;
      keys.forEach(function (k) {
        if (!neg[k]) return;
        if (PAIRS[k] && vals[PAIRS[k]] != null && !neg[PAIRS[k]]) { neg[PAIRS[k]] = true; changed = true; }
        keys.forEach(function (j) { if (!neg[j] && vals[j] === vals[k]) { neg[j] = true; changed = true; } });
      });
    }
    return neg;
  }

  /* ---------- Младшие арканы ([ПР] с.195–197, 232–233) ---------- */
  var SUITS = ['чаш', 'жезлов', 'пентаклей', 'мечей'];
  var SUIT_THEME = ['Партнёрство', 'Цели', 'Блага', 'Опасность'];
  var RANKS = ['Туз', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Паж', 'Рыцарь', 'Дама', 'Король'];
  var RANK_KEY = ['Фатум', 'Союз', 'Усилие', 'Равновесие', 'Кризис', 'Обязанность', 'Трудности', 'Иллюзии', 'Завершение', 'Заслуга', 'Известие', 'Атака', 'Жертва', 'Стратегия'];
  function minorName(n) {
    if (!n) return null; var s = Math.floor((n - 1) / 14), r = (n - 1) % 14;
    return { n: n, suit: SUITS[s], suitTheme: SUIT_THEME[s], rank: RANKS[r], key: RANK_KEY[r], name: RANKS[r] + ' ' + SUITS[s] };
  }
  function sumOrNull(arr) { return arr.length ? r56(arr.reduce(function (a, b) { return a + b; }, 0)) : null; }
  function minors(vals, neg, inner, outer) {
    var P = inner.filter(function (k) { return !neg[k]; }).map(function (k) { return vals[k]; });
    var N = inner.filter(function (k) { return neg[k]; }).map(function (k) { return vals[k]; });
    var res = { PMA: sumOrNull(P), OMA: sumOrNull(N) };
    if (outer) {
      var P5 = outer.filter(function (k) { return !neg[k]; }).map(function (k) { return vals[k]; });
      var N5 = outer.filter(function (k) { return neg[k]; }).map(function (k) { return vals[k]; });
      res.PMA5 = sumOrNull(P5); res.OMA5 = sumOrNull(N5);
      var pi = [res.PMA, res.PMA5].filter(function (x) { return x != null; });
      var oi = [res.OMA, res.OMA5].filter(function (x) { return x != null; });
      res.PI = sumOrNull(pi); res.OI = sumOrNull(oi);
    }
    // правило с.233: положительный младший аркан, совпавший с отрицательным, становится отрицательным
    res.flipped = {};
    [['PMA', 'OMA'], ['PMA5', 'OMA5'], ['PI', 'OI']].forEach(function (p) {
      var negs = [res.OMA, res.OMA5, res.OI].filter(function (x) { return x != null; });
      if (res[p[0]] != null && negs.indexOf(res[p[0]]) >= 0) res.flipped[p[0]] = true;
    });
    return res;
  }

  /* ---------- Прогностика года физлица ([ПР] 2.3, 2.5, 2.6) ---------- */
  // solarY — год соляра (внутренние знаки), calY — календарный год (внешние знаки)
  function innerSigns(birth, solarY, nameArc, opts) {
    opts = opts || {};
    var calc = birthdayIn(birth, solarY);
    var a = arcDate(birth);
    var ZS = r22(dsum(dateStr({ d: birth.d, m: birth.m, y: solarY })));          // ЗШ (с.194, 230)
    var TS = r22(a.Dt + a.Mt + r22(dsum(solarY)));                               // ТШ
    var age = solarY - birth.y;
    var sign = shadowSign(birth, age);
    var sub = function (x) {                                                     // ± аркан имени
      var v = x + sign * nameArc;
      if (v >= 1) return r22(v);
      // книга не даёт примера для v<=0: [XL] =ABS(numberto22(v)) -> |v| (0 -> 22)
      return opts.negWrap === 'mod' ? r22(v + 22) : (v === 0 ? 22 : Math.abs(v));
    };
    return { ZS: ZS, TS: TS, TZS: sub(ZS), TTS: sub(TS), age: age, shadow: sign, calcDate: calc };
  }
  function yearPrognosis(birth, nameArc, solarY, calY, opts) {
    opts = opts || {};
    var inn = innerSigns(birth, solarY, nameArc, opts);
    var k = karmaFor(birth, inn.age);
    var ChDZ = r22(dsum(calY)), ChDT = r22(dsum(calY));                             // ЧДЗ/ЧДТ для года (с.226, 231, 234)
    var vals = { ZS: inn.ZS, TS: inn.TS, TZS: inn.TZS, TTS: inn.TTS,
      ZS5: r22(inn.ZS + ChDZ), TS5: r22(inn.TS + ChDT), TZS5: r22(inn.TZS + ChDZ), TTS5: r22(inn.TTS + ChDT) };
    if (opts && opts.innerOnly) { delete vals.ZS5; delete vals.TS5; delete vals.TZS5; delete vals.TTS5; } // как в разделе 2.8 (с.272)
    var neg = markNegative(vals, k.nodes);
    var mn = minors(vals, neg, ['ZS', 'TS', 'TZS', 'TTS'], (opts && opts.innerOnly) ? null : ['ZS5', 'TS5', 'TZS5', 'TTS5']);
    return { solarYear: solarY, calendarYear: calY, age: inn.age, shadow: inn.shadow, nodes: k.nodes,
      turning: k.swapped, ageInfo: k.info, vals: vals, neg: neg, minors: mn,
      karmic: ['ZS', 'TS', 'TZS', 'TTS'].some(function (x) { return neg[x]; }) };
  }
  // Календарный год делится на досолярный и солярный отрезки (с.229, 236)
  function calendarYear(birth, nameArc, Y, opts) {
    var bd = birthdayIn(birth, Y);
    var parts = [];
    if (!(bd.d === 1 && bd.m === 1)) parts.push({ from: { d: 1, m: 1, y: Y }, to: addDays(bd, -1), p: yearPrognosis(birth, nameArc, Y - 1, Y, opts) });
    parts.push({ from: bd, to: { d: 31, m: 12, y: Y }, p: yearPrognosis(birth, nameArc, Y, Y, opts) });
    return parts;
  }

  /* ---------- Узловые кармические годы ([ПР] 1.9, 2.2, с.146–147, 191–193) ---------- */
  function nodalYears(birth, nameArc, maxAge, opts) {
    var km = karmaMatrix(birth), out = [];
    for (var age = 0; age <= (maxAge || 100); age++) {
      var info = ageInfo(birth, age);
      if (!info.negShadow) continue;
      var k = karmaFor(birth, age), cand = false, why = [];
      if (info.turning) {
        // в поворотный год ячейку занимает спустившийся знак: узловой, только если он блокирующий (с.157, 192)
        var c = info.cell, down = k.bottom[c - 1];
        cand = down.some(function (v) { return BLOCKING[c].indexOf(v) >= 0; });
        if (cand) why.push('переворот: блокирующий ' + down.join(',') + ' в ячейке ' + c);
      } else {
        [1, 2, 3, 4, 5].forEach(function (c) {
          if (km.blocking[c - 1].length && inCycle(km, c, age)) { cand = true; why.push('ячейка ' + c + ': ' + km.blocking[c - 1].join(',')); }
        });
      }
      if (!cand) continue;
      var p = yearPrognosis(birth, nameArc, birth.y + age, birth.y + age, opts);
      out.push({ age: age, candidate: true, nodal: p.karmic, why: why, vals: p.vals, neg: p.neg });
    }
    return out;
  }

  /* ---------- Совместная прогностика двух физлиц ([ПР] 2.8, с.262–286) ---------- */
  function pairNodes(birth, age) { // все узлы, кроме ОПВд и суммы V с ОПВд (с.275)
    var k = karmaFor(birth, age), km = k.km;
    var bottom = k.bottom.map(function (c) { return c.slice(); });
    var sw = k.swapped ? k.swapped.cell : 0;
    if (km.opvD && sw !== 1) bottom[0] = [km.opv];
    if (km.c5d && sw !== 5) bottom[4] = [km.c5];
    return uniq([].concat.apply([], bottom));
  }
  function pairYear(b1, n1, b2, n2, Y, opts) {
    var bd1 = birthdayIn(b1, Y), bd2 = birthdayIn(b2, Y);
    var first = cmp(bd1, bd2) <= 0 ? bd1 : bd2, second = cmp(bd1, bd2) <= 0 ? bd2 : bd1;
    var bounds = [{ d: 1, m: 1, y: Y }, first, second];
    var names = ['досолярный', 'межсолярный', 'общесолярный'];
    var out = [];
    for (var i = 0; i < 3; i++) {
      var from = bounds[i], to = i < 2 ? addDays(bounds[i + 1], -1) : { d: 31, m: 12, y: Y };
      if (cmp(from, to) > 0) continue;
      var s1 = solarYear(b1, from), s2 = solarYear(b2, from);
      var p1 = innerSigns(b1, s1, n1, opts), p2 = innerSigns(b2, s2, n2, opts);
      var nodes = uniq(pairNodes(b1, p1.age).concat(pairNodes(b2, p2.age)));
      var ChD = r22(dsum(Y));
      var vals = { ZS: r22(p1.ZS + p2.ZS), TS: r22(p1.TS + p2.TS), TZS: r22(p1.TZS + p2.TZS), TTS: r22(p1.TTS + p2.TTS) };
      vals.ZS5 = r22(vals.ZS + ChD); vals.TS5 = r22(vals.TS + ChD); vals.TZS5 = r22(vals.TZS + ChD); vals.TTS5 = r22(vals.TTS + ChD);
      var neg = markNegative(vals, nodes);
      out.push({ period: names[i], from: from, to: to, nodes: nodes,
        p1: yearPrognosis(b1, n1, s1, Y, { innerOnly: true, negWrap: opts && opts.negWrap }), p2: yearPrognosis(b2, n2, s2, Y, { innerOnly: true, negWrap: opts && opts.negWrap }),
        vals: vals, neg: neg, minors: minors(vals, neg, ['ZS', 'TS', 'TZS', 'TTS'], ['ZS5', 'TS5', 'TZS5', 'TTS5']) });
    }
    return out;
  }

  /* ---------- Прогностика месяца/дня — ТОЛЬКО по [XL] (в книге формулы нет) ---------- */
  function xlMonth(birth, nameArc, Y, month, opts) {
    // [XL] K23: ЗШ = numberto22(SumNumbers(Д & месяц & год соляра на конец месяца)); ТШ = arc(Д)+arc(месяц)+arc(Σ цифр года)
    var end = { d: dim(month, Y), m: month, y: Y };
    var sy = solarYear(birth, end);
    var ZS = r22(dsum(String(birth.d) + String(month) + String(sy)));
    var TS = r22(r22(birth.d) + r22(month) + r22(dsum(sy)));
    var ref = addDays(birthdayIn(birth, Y), -1);             // [XL] знак тени берётся на день до ДР целевого года ($E$14)
    var sign = shadowSignOnDate(birth, ref);
    return xlSigns(birth, ZS, TS, sign, nameArc, ageOn(birth, end));
  }
  function xlDay(birth, nameArc, date) {
    // [XL] S19: день = Д_рожд + день цели (с переносом через число дней месяца); месяц = месяц цели; год = год соляра
    var n = dim(date.m, date.y); // [XL] T18 берёт число дней месяца ТЕКУЩЕГО года (TODAY) — здесь год цели
    var dd = birth.d + date.d <= n ? birth.d + date.d : birth.d + date.d - n;
    var sy = solarYear(birth, date);
    var ZS = r22(dsum(String(dd) + String(date.m) + String(sy)));
    var TS = r22(r22(dd) + r22(date.m) + r22(dsum(sy)));
    var sign = shadowSignOnDate(birth, date);
    return xlSigns(birth, ZS, TS, sign, nameArc, ageOn(birth, date));
  }
  function shadowSignOnDate(birth, date) { // [XL] KarmicShadow(DOB, date, OPV)
    var s = shadowStep(birth), t = 1, cur = { d: birth.d, m: birth.m, y: birth.y };
    var lim = { d: date.d, m: date.m, y: date.y - s };
    while (cmp(cur, lim) < 0) { cur = { d: cur.d, m: cur.m, y: cur.y + s }; t = -t; }
    return t;
  }
  function xlSigns(birth, ZS, TS, sign, nameArc, age) {
    var f = function (x) { var v = x + sign * nameArc; return v === 0 ? 22 : (v > 0 ? r22(v) : Math.abs(v)); };
    var k = karmaFor(birth, age);
    var vals = { ZS: ZS, TS: TS, TZS: f(ZS), TTS: f(TS) };
    return { vals: vals, shadow: sign, tailPlus: r22(ZS + TS), tailMinus: r22(Math.abs(ZS - TS)), neg: markNegative(vals, k.nodes), source: 'xlsm' };
  }

  /* ---------- Циклы обратки Кармы ([КДР] 1.3 «Предупреждения Кармы», с.183–190) ---------- */
  function regret(birth) { // СЖ — таблица 1 [КДР] с.74 (формула выведена из таблицы, сверена по всем 372 клеткам)
    var D = r22(birth.d), M = birth.m;
    return D <= M ? M : r22(2 * D - M);
  }
  function obratkaCycles(birth) {
    var km = karmaMatrix(birth), sj = regret(birth), out = [], end = 0;
    for (var k = 1; k <= 16; k++) {
      var len = 9 * k, start = end + 1; end += len;          // длительность цикла k = 9·k месяцев
      out.push({ k: k, months: len, fromMonth: k === 1 ? 0 : start, toMonth: end,
        obr1: [km.opv, km.c5], obr2: r22(km.opv + sj + k - 1) });
    }
    return { sj: sj, opv: km.opv, gchk: km.c5, cycles: out };
  }
  function obratkaAt(birth, date) {
    var months = (date.y - birth.y) * 12 + (date.m - birth.m) - (date.d < birth.d ? 1 : 0);
    var t = obratkaCycles(birth);
    for (var i = 0; i < t.cycles.length; i++) if (months <= t.cycles[i].toMonth) return { months: months, cycle: t.cycles[i], sj: t.sj };
    return { months: months, cycle: null, sj: t.sj };
  }

  /* ---------- События подсознания — 7-летние циклы страхов ([КДР] 1.4, с.60–62) ---------- */
  var FEAR_ORDER = ['Солнце', 'Луна', 'Юпитер', 'Уран', 'Меркурий', 'Венера', 'Нептун', 'Сатурн', 'Марс'];
  var WEEKDAY_PLANET = ['Солнце', 'Луна', 'Марс', 'Меркурий', 'Юпитер', 'Венера', 'Сатурн']; // вс..сб
  function weekday(dt) { // 0=вс (алгоритм Зеллера/Сакамото)
    var t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4], y = dt.y;
    if (dt.m < 3) y -= 1;
    return (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[dt.m - 1] + dt.d) % 7;
  }
  function shadowOfSubconscious(birth) { // глиф планеты в клетке даты Мантического календаря = управитель дня недели
    return WEEKDAY_PLANET[weekday(birth)];
  }
  function fearPeriods(birth, startPlanet) {
    var s = FEAR_ORDER.indexOf(startPlanet || shadowOfSubconscious(birth)), out = [];
    for (var i = 0; i < 14; i++) {
      var from = i === 0 ? 0 : 7 * i + 1, to = 7 * (i + 1);   // 0–7, 8–14, 15–21, … (с.62)
      out.push({ from: from, to: to, planet: FEAR_ORDER[(s + i) % 9] });
    }
    return out;
  }
  function fearAt(birth, age, startPlanet) {
    var p = fearPeriods(birth, startPlanet);
    for (var i = 0; i < p.length; i++) if (age >= p[i].from && age <= p[i].to) return p[i];
    return null;
  }

  /* ---------- Матричный код и годы кода ([КАЛ] с.33–59; [Программа судьбы] с.2) ---------- */
  function matrixCode(birth) { var c = 55 - 2 * birth.m - birth.d; return c >= 1 ? c : null; } // 31.12 -> 0: кода в книге нет
  function codeYearsAt(codeYears, code, age) {
    var y = codeYears && codeYears[code]; if (!y) return [];
    var hits = [];
    Object.keys(y.years).forEach(function (k) {
      if (y.years[k].indexOf(age) >= 0) hits.push(k);
    });
    if (y.worstRule === 'every7and9' && age > 0 && (age % 7 === 0 || age % 9 === 0) && hits.indexOf('worst') < 0) hits.push('worst');
    return hits;
  }

  /* ---------- Активная карта по годам ([ВН] с.261–262) ---------- */
  function vectorActiveCard(birth, age) {
    var kr = dateStr(birth).split('').map(Number);
    var q = Math.floor(Number(dateStr(birth)) / 9), rem = Number(dateStr(birth)) % 9;
    var decimal = Math.floor(rem * 10 / 9);                  // первая цифра после запятой
    var kd = (String(q) + String(decimal)).split('').map(Number);
    if (kd.length < 8) while (kd.length < 8) kd.push(9);      // «восьмой знак по умолчанию 9» (с.261)
    kd = kd.slice(0, 8);
    var j = age % 8, a = kr[j], b = kd[j];
    var res = Math.abs(a - b) <= 1 ? 'неопределённо' : (a > b ? 'Карта Рождения' : 'Карта Души');
    return { column: j, kr: kr, kd: kd, krDigit: a, kdDigit: b, active: res };
  }


  /* =====================================================================
   *  ДОПОЛНЕНИЯ (2-й проход): юрлица, совместная деловая прогностика,
   *  внешние знаки дня/месяца, критические годы, воспитание Кармой,
   *  график брака, бионумерологический ритм, матричные циклы.
   * ===================================================================== */

  function dayNum(dt) { // порядковый номер дня (для разностей дат)
    var y = dt.y, m = dt.m; if (m < 3) { y--; m += 12; }
    return 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + Math.floor((153 * (m - 3) + 2) / 5) + dt.d;
  }
  function daysBetween(a, b) { return dayNum(b) - dayNum(a); }
  function sub22(x, sign, arc) { // ± аркан имени/названия; ≤0 → |v| (0 → 22) — как в примерах [ПР] с.258–260 (13−18=5, 14−18=4, 1−18=17)
    var v = x + sign * arc;
    return v >= 1 ? r22(v) : (v === 0 ? 22 : Math.abs(v));
  }

  /* ---------- Кармические узлы компании ([ПР] 1.11, с.160; 2.7, с.248–249) ---------- */
  function companyNodes(dt) {
    var a = arcDate(dt), opv = r22(Math.abs(a.Dt - a.Mt)), st = r22(Math.abs(a.Mt - a.Gt)), kb = r22(Math.abs(opv - st));
    return { opv: opv, st: st, kb: kb, nodes: uniq([opv, st, kb]) };
  }
  function activeDyn(co, date) { // действует последняя динамическая дата (промежуточные утрачивают силу, с.160)
    var best = null;
    (co.dyn || []).forEach(function (d) { if (cmp(d, date) <= 0 && (!best || cmp(d, best) > 0)) best = d; });
    return best;
  }
  function companySignsAt(co, date, mode) {
    // mode 'calendar' — соляр с 01.01 (индивидуальный прогноз фирмы, холдинг), 'classic' — соляр от динамической/корневой даты (коммерческий союз, с.303–306)
    var dyn = activeDyn(co, date), base = dyn || co.root, year, signDate;
    if (mode === 'classic') {
      var ann = { d: base.d, m: base.m, y: date.y };
      if (cmp(ann, date) > 0) ann.y--;
      if (cmp(ann, base) < 0) ann = { d: base.d, m: base.m, y: base.y };
      year = ann.y; signDate = ann;
    } else { year = date.y; signDate = date; }
    var sign = shadowSign(co.root, ageOn(co.root, signDate)); // тень — по корневой дате, шаг = ОПВ корня (с.249)
    var ZS = r22(dsum(dateStr({ d: base.d, m: base.m, y: year })));
    var TS = r22(r22(base.d) + base.m + r22(dsum(year)));
    var rootN = companyNodes(co.root).nodes, dynN = dyn ? companyNodes(dyn).nodes : null;
    return { vals: { ZS: ZS, TS: TS, TZS: sub22(ZS, sign, co.name), TTS: sub22(TS, sign, co.name) }, shadow: sign,
      ownNodes: uniq(rootN.concat(dynN || [])), pairNodes: dynN || rootN, pairNodesFromRoot: !dynN, base: base, year: year };
  }
  function personSignsAt(p, date, mode) {
    // 'classic' — соляр от дня рождения ([ПР] 2.6); 'calendar' — соляр с 01.01 (холдинговый союз / «хозяин», с.289–291)
    var year = mode === 'calendar' ? date.y : solarYear(p.birth, date);
    var age = mode === 'calendar' ? ageOn(p.birth, date) : year - p.birth.y;
    var sign = shadowSign(p.birth, age);
    var ZS = r22(dsum(dateStr({ d: p.birth.d, m: p.birth.m, y: year })));
    var a = arcDate(p.birth), TS = r22(a.Dt + a.Mt + r22(dsum(year)));
    return { vals: { ZS: ZS, TS: TS, TZS: sub22(ZS, sign, p.name), TTS: sub22(TS, sign, p.name) }, shadow: sign, age: age,
      ownNodes: karmaFor(p.birth, age).nodes, pairNodes: pairNodes(p.birth, age), year: year };
  }
  function partySignsAt(party, date, mode) { return party.root ? companySignsAt(party, date, mode) : personSignsAt(party, date, mode); }
  function fullBlock(vals4, nodes, ChDZ, ChDT, innerOnly) {
    var vals = { ZS: vals4.ZS, TS: vals4.TS, TZS: vals4.TZS, TTS: vals4.TTS };
    if (!innerOnly) { vals.ZS5 = r22(vals.ZS + ChDZ); vals.TS5 = r22(vals.TS + ChDT); vals.TZS5 = r22(vals.TZS + ChDZ); vals.TTS5 = r22(vals.TTS + ChDT); }
    var neg = markNegative(vals, nodes);
    return { vals: vals, neg: neg, minors: minors(vals, neg, ['ZS', 'TS', 'TZS', 'TTS'], innerOnly ? null : ['ZS5', 'TS5', 'TZS5', 'TTS5']) };
  }
  function candidateDates(parties, Y) {
    var c = [{ d: 1, m: 1, y: Y }];
    parties.forEach(function (p) {
      var ds = p.root ? [p.root].concat(p.dyn || []) : [p.birth];
      ds.forEach(function (d) { c.push(birthdayIn(d, Y)); });
    });
    c.sort(cmp);
    return c.filter(function (d, i) { return i === 0 || cmp(d, c[i - 1]) !== 0; });
  }
  function segmentYear(parties, modes, Y) { // делит год на отрезки, где знаки и узлы всех сторон постоянны
    var cand = candidateDates(parties, Y), segs = [];
    cand.forEach(function (d) {
      var s = parties.map(function (p, i) { return partySignsAt(p, d, modes[i]); });
      var key = JSON.stringify(s.map(function (x) { return [x.vals, x.ownNodes, x.pairNodes]; }));
      if (segs.length && segs[segs.length - 1].key === key) return;
      segs.push({ from: d, key: key, s: s });
    });
    segs.forEach(function (sg, i) { sg.to = i + 1 < segs.length ? addDays(segs[i + 1].from, -1) : { d: 31, m: 12, y: Y }; });
    return segs;
  }

  /* ---------- Личная прогностика юридического лица на год ([ПР] 2.7, с.248–261) ----------
   * co = {root:{d,m,y}, dyn:[{d,m,y}...], name: аркан названия}. Соляр — календарный (01.01), переворота строк нет. */
  function companyYear(co, Y) {
    var ChD = r22(dsum(Y));
    return segmentYear([co], ['calendar'], Y).map(function (sg) {
      var x = sg.s[0], b = fullBlock(x.vals, x.ownNodes, ChD, ChD);
      return { from: sg.from, to: sg.to, shadow: x.shadow, nodes: x.ownNodes, base: x.base, vals: b.vals, neg: b.neg, minors: b.minors };
    });
  }

  /* ---------- Совместная прогностика: физлица/юрлица, типы союзов ([ПР] 2.8–2.10, с.262–314) ----------
   * type: 'personal' (2.8: оба — классический соляр), 'holding' (оба — соляр с 01.01), 'economic' (первый — «хозяин» с 01.01, второй —
   * исполнитель по своему соляру), 'commercial' (оба — классический соляр; у фирмы — от динамической даты). */
  var UNION_MODES = { personal: ['classic', 'classic'], holding: ['calendar', 'calendar'], economic: ['calendar', 'classic'], commercial: ['classic', 'classic'] };
  function jointYear(a, b, type, Y) {
    var modes = UNION_MODES[type], ChD = r22(dsum(Y));
    return segmentYear([a, b], modes, Y).map(function (sg) {
      var x = sg.s[0], y = sg.s[1];
      var nodes = uniq(x.pairNodes.concat(y.pairNodes)); // физлица — без ОПВд и V с ОПВд (с.274); фирмы — только динамические узлы (с.304)
      var v = { ZS: r22(x.vals.ZS + y.vals.ZS), TS: r22(x.vals.TS + y.vals.TS), TZS: r22(x.vals.TZS + y.vals.TZS), TTS: r22(x.vals.TTS + y.vals.TTS) };
      var j = fullBlock(v, nodes, ChD, ChD);
      return { from: sg.from, to: sg.to, nodes: nodes, vals: j.vals, neg: j.neg, minors: j.minors,
        p1: { vals: x.vals, shadow: x.shadow, nodes: x.ownNodes, block: fullBlock(x.vals, x.ownNodes, 0, 0, true) },
        p2: { vals: y.vals, shadow: y.shadow, nodes: y.ownNodes, block: fullBlock(y.vals, y.ownNodes, 0, 0, true) } };
    });
  }

  /* ---------- Внешние знаки для периода любой длины ([ПР] 2.5, с.225–226) ----------
   * ЧДЗ = Σ цифр календарной даты периода → [1..22]; ЧДТ = Дт+Мт+Гт календарной даты → [1..22].
   * Для года дата = только год (так в примерах 2.6), для месяца = ММ.ГГГГ, для дня = ДД.ММ.ГГГГ. */
  function calendarNumbers(cal) {
    var s = (cal.d ? pad2(cal.d) : '') + (cal.m ? pad2(cal.m) : '') + String(cal.y);
    var ChDZ = r22(dsum(s));
    var ChDT = r22((cal.d ? r22(cal.d) : 0) + (cal.m || 0) + r22(dsum(cal.y)));
    return { ChDZ: ChDZ, ChDT: ChDT };
  }
  // Прогноз дня/месяца: внутренние знаки — соляра, в котором лежит дата ([ПР] 2.3 не даёт отдельной «расчётной даты» дня — [вывод]),
  // внешние — по календарной дате дня/месяца (формулы книги 2.5). Помечено flag 'innerFromSolarYear'.
  function periodPrognosis(birth, nameArc, cal) {
    var ref = cal.d ? cal : { d: cal.m ? dim(cal.m, cal.y) : 31, m: cal.m || 12, y: cal.y };
    var sy = solarYear(birth, ref), inn = innerSigns(birth, sy, nameArc), k = karmaFor(birth, inn.age), cn = calendarNumbers(cal);
    var b = fullBlock({ ZS: inn.ZS, TS: inn.TS, TZS: inn.TZS, TTS: inn.TTS }, k.nodes, cn.ChDZ, cn.ChDT);
    return { cal: cal, solarYear: sy, age: inn.age, shadow: inn.shadow, ChDZ: cn.ChDZ, ChDT: cn.ChDT, vals: b.vals, neg: b.neg, minors: b.minors,
      nodes: k.nodes, flag: 'innerFromSolarYear' };
  }

  /* ---------- Критические и узловые годы ([СК] «Сакральные коды Матрицы», с.259–263) ---------- */
  function metacycleCritical(birth, maxAge) { // переходные годы метациклов: N=Σ цифр даты, далее +9; берутся N и N+1
    var n = dsum(dateStr(birth)), out = [];
    for (var a = n; a <= (maxAge || 100); a += 9) { out.push(a); if (a + 1 <= (maxAge || 100)) out.push(a + 1); }
    return { first: n, years: out };
  }
  function matrixShadow(birth, maxAge) { // теневые циклы по кармическому узлу: шаг = узел; периоды [0..s−1]+, [s..2s−1]−, …; при дне 14–22 — второй узел = день
    var a = arcDate(birth), steps = [r22(Math.abs(a.Dt - a.Mt))];
    if (birth.d >= 14 && birth.d <= 22) steps.push(birth.d);
    var lim = maxAge || 100, sign = [];
    for (var age = 0; age <= lim + 1; age++) {
      sign.push(steps.every(function (s) { return Math.floor(age / s) % 2 === 0; }) ? 1 : -1);
    }
    var trans = [];
    for (age = 0; age < lim; age++) if (sign[age] !== sign[age + 1]) trans.push(age, age + 1);
    return { steps: steps, sign: sign.slice(0, lim + 1), transitions: trans };
  }
  function criticalYears(birth, maxAge) {
    var m = metacycleCritical(birth, maxAge), s = matrixShadow(birth, maxAge);
    return { metacycle: m.years, shadow: s.transitions, all: uniq(m.years.concat(s.transitions)), steps: s.steps };
  }

  /* ---------- Воспитание Кармой: 22 периода по 100 дней ([КДР] гл.II §1.1, с.125–143) ---------- */
  function karmaUpbringing(birth) {
    var opv = karmaMatrix(birth).opv, out = [];
    for (var k = 1; k <= 22; k++) {
      var code = opv - (k - 1); while (code < 1) code += 22;
      out.push({ k: k, from: addDays(birth, 100 * (k - 1)), to: addDays(birth, 100 * k - 1), code: code });
    }
    return { opv: opv, periods: out };
  }
  function karmaUpbringingAt(birth, date) {
    var n = daysBetween(birth, date), k = Math.floor(n / 100) + 1;
    if (n < 0 || k > 22) return null;
    return karmaUpbringing(birth).periods[k - 1];
  }

  /* ---------- График семейных отношений (брака) ([НС] «Нумерология совместимости», гл.3, PDF 201–215) ---------- */
  function qsum10(n) { // кверсумма до цифры; 10 → 0 (PDF 203)
    while (n > 9) { if (n === 10) return 0; n = dsum(n); }
    return n;
  }
  function marriageBlock(b1, b2, event) {
    var A = digits(dateStr(b1)), B = digits(dateStr(b2)), D = digits(dateStr(event));
    var it1 = A.map(function (x, i) { return qsum10(x + B[i]); });
    var red = it1.map(function (x) { return x === 0; });
    var it2 = it1.map(function (x, i) { return qsum10(x + D[i]); });
    it2.forEach(function (x, i) { if (x === 0) red[i] = true; });
    var n1 = it2[0] * 10 + it2[1], n2 = it2[2] * 10 + it2[3], n3 = Number(it2.slice(4).join(''));
    var prod = (n1 || 1) * (n2 || 1) * (n3 || 1);
    var dg = String(prod).split('').map(Number); while (dg.length < 8) dg.push(0);
    var res = dg.slice(0, 8);
    red.forEach(function (r, i) {
      if (!r) return;
      if (res[i] !== 0) { res[i] = -Math.abs(res[i]); return; }
      for (var j = i - 1; j >= 0; j--) if (res[j] !== 0) { res[j] = -Math.abs(res[j]); break; } // 0 в красной ячейке переворачивает ближайшую цифру слева
    });
    var avg = res.reduce(function (s, x) { return s + x; }, 0) / 8;
    var pts = res.map(function (v, i) { return { date: addDays(birthdayIn(event, event.y + i + 1), -1), v: v }; });
    return { itog1: it1, itog2: it2, red: red, product: prod, result: res, avg: avg, start: event, points: pts };
  }
  // events: [{d,m,y}...] в хронологическом порядке (знакомство, свадьба, …). Каждый блок 8 лет; далее — дата+8 лет.
  function marriageGraph(b1, b2, events, untilYear) {
    var blocks = [];
    events.forEach(function (ev, i) {
      var next = events[i + 1], e = ev;
      while (true) {
        blocks.push(marriageBlock(b1, b2, e));
        var ne = { d: e.d, m: e.m, y: e.y + 8 };
        if ((next && cmp(ne, next) >= 0) || (!next && ne.y > (untilYear || e.y + 16))) break;
        e = ne;
      }
    });
    // линия: блок начинается значением предыдущей линии на дату начала (первый — с нуля, PDF 209–213)
    var line = [];
    blocks.forEach(function (bl, bi) {
      var startVal = 0;
      if (bi > 0) startVal = valueAt(line, bl.start);
      line = line.filter(function (p) { return cmp(p.date, bl.start) < 0; });
      line.push({ date: bl.start, v: startVal, avg: bl.avg });
      bl.points.forEach(function (p) { line.push({ date: p.date, v: p.v, avg: bl.avg }); });
    });
    return { blocks: blocks, line: line };
  }
  function valueAt(line, date) {
    for (var i = 0; i + 1 < line.length; i++) {
      if (cmp(line[i].date, date) <= 0 && cmp(date, line[i + 1].date) <= 0) {
        var t = daysBetween(line[i].date, date) / Math.max(1, daysBetween(line[i].date, line[i + 1].date));
        return line[i].v + (line[i + 1].v - line[i].v) * t;
      }
    }
    return line.length ? line[line.length - 1].v : 0;
  }
  // зоны: v<0 — кризис; 0≤v<средней — неблагоприятно; v≥средней — благоприятно (PDF 208–213). Возвращает отрезки «ниже средней» с датами пересечений.
  function marriageZones(g, fromDate) {
    var out = [], cur = null, ln = g.line;
    var avgAt = function (d) { var a = null; g.blocks.forEach(function (b) { if (cmp(b.start, d) <= 0) a = b.avg; }); return a; };
    var d = fromDate || ln[0].date, end = ln[ln.length - 1].date;
    while (cmp(d, end) <= 0) {
      var v = valueAt(ln, d), below = v < avgAt(d);
      if (below && !cur) cur = { from: d, crisis: false };
      if (cur && v < 0) cur.crisis = true;
      if (!below && cur) { cur.to = addDays(d, -1); out.push(cur); cur = null; }
      d = addDays(d, 1);
    }
    if (cur) { cur.to = end; out.push(cur); }
    return out;
  }

  /* ---------- Бионумерологические ритмы (суточные) ([ЭС] «Энергосистема», гл.3, с.321–331) ---------- */
  var CONSONANTS = 'БВГДЖЗЙКЛМНПРСТФХЦЧШЩ';
  function droot(n) { return n === 0 ? 0 : 1 + (n - 1) % 9; }
  function bioBase(birth, fio) { // цифры даты + согласные ФИО (буквица) по столбцам, свёртка к 1..9 — [частично сверено: 6 из 8 столбцов примера]
    var rows = [digits(dateStr(birth))];
    var cons = String(fio).toUpperCase().split('').filter(function (c) { return CONSONANTS.indexOf(c) >= 0; }).map(letterVal);
    for (var i = 0; i < cons.length; i += 8) rows.push(cons.slice(i, i + 8));
    var base = [];
    for (var c = 0; c < 8; c++) base.push(droot(rows.reduce(function (s, r) { return s + (r[c] || 0); }, 0)));
    return base;
  }
  function bioRhythm(base, birthHour) { // 3 прокрутки (+1 по кругу 1..9), 24 цифры; первая — на час рождения
    var all = base.slice();
    for (var r = 1; r < 3; r++) base.forEach(function (x) { all.push(((x - 1 + r) % 9) + 1); });
    var hours = {};
    all.forEach(function (v, i) { hours[(birthHour + i) % 24] = v; });
    var sum = all.reduce(function (s, x) { return s + x; }, 0), avg = sum / 24;
    var byHour = []; for (var h = 0; h < 24; h++) byHour.push({ hour: h, v: hours[h], group: hours[h] <= 3 ? 'пассив' : hours[h] <= 6 ? 'норма' : 'перенапряжение', aboveAvg: hours[h] > avg });
    return { digits: all, sum: sum, avg: avg, byHour: byHour };
  }

  /* ---------- Матричные циклы «Расписание ангелов» — индекс периода на дату ([СК] с.218–222) ----------
   * Даты периодов уже есть в основном отчёте; здесь — только номер периода для привязки толкований. */
  var ANGEL = ['Меркурий', 'Венера', 'Марс', 'Юпитер', 'Сатурн', 'Уран', 'Нептун'];
  function angelPeriods(birth, sy) {
    var s = birthdayIn(birth, sy), next = birthdayIn(birth, sy + 1), out = [];
    for (var k = 0; k < 7; k++) out.push({ k: k + 1, planet: ANGEL[k], from: addDays(s, 52 * k), to: k < 6 ? addDays(s, 52 * (k + 1) - 1) : addDays(next, -1) });
    return out;
  }
  function angelPeriodAt(birth, date) {
    var p = angelPeriods(birth, solarYear(birth, date));
    for (var i = 0; i < 7; i++) if (cmp(date, p[i].from) >= 0 && cmp(date, p[i].to) <= 0) return p[i];
    return null;
  }

  /* ---------- справочники для толкований ([ПР] с.172–177, 183) ---------- */
  var ZS_PLANET = { 9: 'Плутон', 15: 'Плутон', 19: 'Солнце', 12: 'Солнце', 2: 'Луна', 18: 'Луна', 17: 'Юпитер', 3: 'Юпитер',
    4: 'Уран', 14: 'Уран', 21: 'Нептун', 7: 'Нептун', 6: 'Венера', 20: 'Венера', 5: 'Меркурий', 1: 'Меркурий',
    10: 'Сатурн', 16: 'Сатурн', 11: 'Марс', 13: 'Марс', 22: 'Прозерпина', 8: 'Хирон' };
  var TS_SPHERE = { 1: 'Самореализация', 5: 'Самореализация', 17: 'Самореализация', 19: 'Самореализация',
    2: 'Партнёрство', 3: 'Партнёрство', 6: 'Партнёрство', 20: 'Партнёрство',
    4: 'Бизнес и карьера', 10: 'Бизнес и карьера', 14: 'Бизнес и карьера', 16: 'Бизнес и карьера',
    8: 'Личные интересы', 12: 'Личные интересы', 18: 'Личные интересы', 22: 'Личные интересы',
    9: 'Препятствия', 11: 'Препятствия', 13: 'Препятствия', 15: 'Препятствия', 7: 'Перспективы', 21: 'Перспективы' };
  var YANG = [1, 4, 5, 7, 8, 9, 10, 11, 13, 16, 19];
  function yinYang(n) { return YANG.indexOf(n) >= 0 ? 'ян' : 'инь'; }
  function keys(p) { // ключи для prog_texts.json
    var s = function (k) { return p.neg[k] ? '-' : '+'; };
    var k = { zsPlanet: ZS_PLANET[p.vals.ZS], tsSphere: TS_SPHERE[p.vals.TS],
      zsTzs: s('ZS') + s('TZS'), tempo: yinYang(p.vals.TS) + '/' + yinYang(p.vals.TTS),
      pattern: s('ZS') + s('TS') + s('TZS') + s('TTS'), shadow: (p.shadow > 0 ? '+' : '-') + '/' };
    k.shadow += (['ZS', 'TS', 'TZS', 'TTS'].some(function (x) { return p.neg[x]; }) ? '-' : '+');
    if (p.vals.ZS5 != null) { k.zs5Planet = ZS_PLANET[p.vals.ZS5]; k.ts5Sphere = TS_SPHERE[p.vals.TS5]; k.zs5Tzs5 = s('ZS5') + s('TZS5'); k.tts5 = s('TTS5'); }
    return k;
  }

  return {
    ZS_PLANET: ZS_PLANET, TS_SPHERE: TS_SPHERE, yinYang: yinYang, keys: keys,
    r22: r22, r56: r56, dsum: dsum, arcDate: arcDate, nameArcanum: nameArcanum,
    karmaMatrix: karmaMatrix, BLOCKING: BLOCKING, shadowStep: shadowStep, shadowSign: shadowSign,
    ageInfo: ageInfo, karmaFor: karmaFor, markNegative: markNegative, minorName: minorName,
    innerSigns: innerSigns, yearPrognosis: yearPrognosis, calendarYear: calendarYear, nodalYears: nodalYears,
    pairYear: pairYear, pairNodes: pairNodes,
    xlMonth: xlMonth, xlDay: xlDay, shadowSignOnDate: shadowSignOnDate,
    regret: regret, obratkaCycles: obratkaCycles, obratkaAt: obratkaAt,
    shadowOfSubconscious: shadowOfSubconscious, fearPeriods: fearPeriods, fearAt: fearAt, weekday: weekday,
    matrixCode: matrixCode, codeYearsAt: codeYearsAt, vectorActiveCard: vectorActiveCard,
    ageOn: ageOn, solarYear: solarYear, birthdayIn: birthdayIn, addDays: addDays,
    // 2-й проход
    companyNodes: companyNodes, companyYear: companyYear, jointYear: jointYear, UNION_MODES: UNION_MODES,
    calendarNumbers: calendarNumbers, periodPrognosis: periodPrognosis,
    metacycleCritical: metacycleCritical, matrixShadow: matrixShadow, criticalYears: criticalYears,
    karmaUpbringing: karmaUpbringing, karmaUpbringingAt: karmaUpbringingAt,
    qsum10: qsum10, marriageBlock: marriageBlock, marriageGraph: marriageGraph, marriageZones: marriageZones, valueAt: valueAt,
    bioBase: bioBase, bioRhythm: bioRhythm, angelPeriods: angelPeriods, angelPeriodAt: angelPeriodAt, daysBetween: daysBetween
  };
})();



export default PROG
