/* =========================================================================
 * Dados mensais do surto de cólera no Haiti (outubro 2010 – março 2016).
 *
 * Fonte: Ministry of Public Health du Haiti, compilado em arquivo CSV
 * fornecido pelo Prof. Henrique Alvarenga.
 *
 * 66 observações mensais. Totais no período:
 *   casos  = 772.679
 *   mortes =   9.295
 * Pico: dezembro de 2010 com 94.617 casos e 1.954 mortes.
 *
 * Os dados foram parseados do CSV original com o script de conversão
 * (documentado em references.bib → MSPP Haiti).
 * ========================================================================= */

window.EDL = window.EDL || {};
window.EDL.data = window.EDL.data || {};

window.EDL.data.haitiCholera2010 = [
  { year: 2010, month: 10, deaths:   557, cases:  20905 },
  { year: 2010, month: 11, deaths:  1590, cases:  69688 },
  { year: 2010, month: 12, deaths:  1954, cases:  94617 },
  { year: 2011, month:  1, deaths:   573, cases:  54710 },
  { year: 2011, month:  2, deaths:   186, cases:  28372 },
  { year: 2011, month:  3, deaths:   138, cases:  24993 },
  { year: 2011, month:  4, deaths:   161, cases:  18835 },
  { year: 2011, month:  5, deaths:   193, cases:  29785 },
  { year: 2011, month:  6, deaths:   546, cases:  56352 },
  { year: 2011, month:  7, deaths:   361, cases:  39207 },
  { year: 2011, month:  8, deaths:   202, cases:  24924 },
  { year: 2011, month:  9, deaths:   195, cases:  23253 },
  { year: 2011, month: 10, deaths:   205, cases:  28135 },
  { year: 2011, month: 11, deaths:   120, cases:  17023 },
  { year: 2011, month: 12, deaths:    47, cases:   6250 },
  { year: 2012, month:  1, deaths:     9, cases:   4367 },
  { year: 2012, month:  2, deaths:    18, cases:   3186 },
  { year: 2012, month:  3, deaths:    34, cases:   3279 },
  { year: 2012, month:  4, deaths:    52, cases:   6026 },
  { year: 2012, month:  5, deaths:   112, cases:  14338 },
  { year: 2012, month:  6, deaths:   110, cases:   9942 },
  { year: 2012, month:  7, deaths:    61, cases:   6673 },
  { year: 2012, month:  8, deaths:    64, cases:   6001 },
  { year: 2012, month:  9, deaths:    75, cases:   7621 },
  { year: 2012, month: 10, deaths:   100, cases:  11830 },
  { year: 2012, month: 11, deaths:   131, cases:  15238 },
  { year: 2012, month: 12, deaths:   142, cases:  12853 },
  { year: 2013, month:  1, deaths:    86, cases:   7257 },
  { year: 2013, month:  2, deaths:    14, cases:   4332 },
  { year: 2013, month:  3, deaths:    24, cases:   3433 },
  { year: 2013, month:  4, deaths:    25, cases:   2654 },
  { year: 2013, month:  5, deaths:    26, cases:   3435 },
  { year: 2013, month:  6, deaths:    52, cases:   4206 },
  { year: 2013, month:  7, deaths:    44, cases:   5147 },
  { year: 2013, month:  8, deaths:    44, cases:   5329 },
  { year: 2013, month:  9, deaths:    53, cases:   5995 },
  { year: 2013, month: 10, deaths:    99, cases:   7162 },
  { year: 2013, month: 11, deaths:    81, cases:   6962 },
  { year: 2013, month: 12, deaths:    62, cases:   2593 },
  { year: 2014, month:  1, deaths:    14, cases:   1629 },
  { year: 2014, month:  2, deaths:     4, cases:   1259 },
  { year: 2014, month:  3, deaths:    10, cases:    889 },
  { year: 2014, month:  4, deaths:     4, cases:    866 },
  { year: 2014, month:  5, deaths:     3, cases:    902 },
  { year: 2014, month:  6, deaths:    14, cases:   1017 },
  { year: 2014, month:  7, deaths:     7, cases:   1148 },
  { year: 2014, month:  8, deaths:    13, cases:   1025 },
  { year: 2014, month:  9, deaths:    28, cases:   1839 },
  { year: 2014, month: 10, deaths:    52, cases:   4577 },
  { year: 2014, month: 11, deaths:    95, cases:   6765 },
  { year: 2014, month: 12, deaths:    53, cases:   5392 },
  { year: 2015, month:  1, deaths:    36, cases:   4321 },
  { year: 2015, month:  2, deaths:    46, cases:   4055 },
  { year: 2015, month:  3, deaths:    22, cases:   3041 },
  { year: 2015, month:  4, deaths:    19, cases:   3098 },
  { year: 2015, month:  5, deaths:    13, cases:   1702 },
  { year: 2015, month:  6, deaths:    13, cases:   1732 },
  { year: 2015, month:  7, deaths:    21, cases:   2000 },
  { year: 2015, month:  8, deaths:    22, cases:   1744 },
  { year: 2015, month:  9, deaths:    18, cases:   2082 },
  { year: 2015, month: 10, deaths:    24, cases:   2608 },
  { year: 2015, month: 11, deaths:    63, cases:   4944 },
  { year: 2015, month: 12, deaths:    26, cases:   5436 },
  { year: 2016, month:  1, deaths:    60, cases:   5335 },
  { year: 2016, month:  2, deaths:    35, cases:   3264 },
  { year: 2016, month:  3, deaths:    34, cases:   3101 }
];
