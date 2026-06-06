/* =========================================================================
 * Dados do surto de cólera em Soho (Londres, agosto–setembro 1854).
 *
 * Extraídos do pacote R `cholera` (Peter Li, CRAN) via pipeline Python:
 *   - fatalities.anchor: 321 endereços agregados com count de mortes (total 578)
 *   - pumps: 13 bombas de água do distrito
 *   - road.segments: 658 segmentos de rua do grafo original
 *   - landmarks: Golden Square e pontos de referência
 *
 * A digitalização original das coordenadas é de Dodson & Tobler (1992).
 * O pacote `cholera` reorganizou e extendeu essa digitalização
 * (Li 2018, Journal of Open Source Software, DOI 10.21105/joss.00659).
 *
 * Atribuições por bomba (campos walk/eucl) calculadas por Dijkstra no
 * grafo de ruas (caminhada) e por distância euclidiana, respectivamente.
 * Bomba contaminada = ID 7, Broad Street.
 *
 * Sistema de coordenadas: yards (aproximadamente).
 * Licença dos dados: GPL-2 (herdada do pacote cholera).
 * ========================================================================= */

window.EDL = window.EDL || {};
window.EDL.data = window.EDL.data || {};

window.EDL.data.soho1854 = {
  "source": "Peter Li, cholera R package (GPL-2); digitalização original de Dodson & Tobler (1992)",
  "bbox": {
    "xmin": 3.406,
    "xmax": 19.888,
    "ymin": 3.259,
    "ymax": 18.712
  },
  "pumps": [
    {
      "id": 1,
      "street": "Market Place",
      "x": 8.6512,
      "y": 17.8916,
      "contaminated": false
    },
    {
      "id": 2,
      "street": "Adam and Eve Court",
      "x": 10.9848,
      "y": 18.5179,
      "contaminated": false
    },
    {
      "id": 3,
      "street": "Berners Street",
      "x": 13.3782,
      "y": 17.3945,
      "contaminated": false
    },
    {
      "id": 4,
      "street": "Newman Street",
      "x": 14.8798,
      "y": 17.8099,
      "contaminated": false
    },
    {
      "id": 5,
      "street": "Marlborough Mews",
      "x": 8.6948,
      "y": 14.9055,
      "contaminated": false
    },
    {
      "id": 6,
      "street": "Little Marlborough Street",
      "x": 8.8644,
      "y": 12.7535,
      "contaminated": false
    },
    {
      "id": 7,
      "street": "Broad Street",
      "x": 12.5714,
      "y": 11.7272,
      "contaminated": true
    },
    {
      "id": 8,
      "street": "Warwick Street",
      "x": 10.661,
      "y": 7.4286,
      "contaminated": false
    },
    {
      "id": 9,
      "street": "Bridle Street",
      "x": 13.5215,
      "y": 7.9582,
      "contaminated": false
    },
    {
      "id": 10,
      "street": "Rupert Street",
      "x": 16.4349,
      "y": 9.2521,
      "contaminated": false
    },
    {
      "id": 11,
      "street": "Dean Street",
      "x": 18.9144,
      "y": 9.7378,
      "contaminated": false
    },
    {
      "id": 12,
      "street": "Tichborne Street",
      "x": 16.0051,
      "y": 5.0468,
      "contaminated": false
    },
    {
      "id": 13,
      "street": "Vigo Street",
      "x": 8.9994,
      "y": 5.101,
      "contaminated": false
    }
  ],
  "deaths": [
    {
      "x": 13.588,
      "y": 11.0956,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.2206,
      "y": 9.993,
      "count": 2,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 13.1626,
      "y": 12.9632,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.1264,
      "y": 9.6439,
      "count": 1,
      "walk": 8,
      "eucl": 8
    },
    {
      "x": 10.5866,
      "y": 11.8668,
      "count": 1,
      "walk": 7,
      "eucl": 6
    },
    {
      "x": 13.337,
      "y": 10.7058,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.1397,
      "y": 10.0401,
      "count": 9,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 10.871,
      "y": 9.8232,
      "count": 1,
      "walk": 8,
      "eucl": 8
    },
    {
      "x": 12.5463,
      "y": 11.9826,
      "count": 4,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.8237,
      "y": 11.7979,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.1923,
      "y": 10.3839,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.308,
      "y": 11.8512,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.9738,
      "y": 11.8536,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.508,
      "y": 13.3402,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.8065,
      "y": 11.661,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.2057,
      "y": 13.6425,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.8993,
      "y": 13.9883,
      "count": 1,
      "walk": 3,
      "eucl": 7
    },
    {
      "x": 12.5194,
      "y": 11.6155,
      "count": 4,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.749,
      "y": 12.6513,
      "count": 1,
      "walk": 10,
      "eucl": 7
    },
    {
      "x": 12.8556,
      "y": 9.8961,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.9887,
      "y": 10.1677,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.6861,
      "y": 11.4065,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.0889,
      "y": 11.1166,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.4206,
      "y": 11.0823,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.7573,
      "y": 9.3684,
      "count": 1,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 13.205,
      "y": 13.1688,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.4322,
      "y": 11.6199,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.9859,
      "y": 14.1858,
      "count": 1,
      "walk": 7,
      "eucl": 4
    },
    {
      "x": 10.8983,
      "y": 12.014,
      "count": 4,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.8417,
      "y": 12.3804,
      "count": 1,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 16.5491,
      "y": 14.349,
      "count": 2,
      "walk": 4,
      "eucl": 4
    },
    {
      "x": 11.1996,
      "y": 8.5868,
      "count": 2,
      "walk": 8,
      "eucl": 8
    },
    {
      "x": 15.7773,
      "y": 12.1721,
      "count": 2,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 11.7954,
      "y": 15.0772,
      "count": 1,
      "walk": 7,
      "eucl": 3
    },
    {
      "x": 14.1424,
      "y": 13.1333,
      "count": 5,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.6383,
      "y": 12.9215,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 9.2248,
      "y": 10.8361,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 17.9389,
      "y": 7.1893,
      "count": 1,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 11.1713,
      "y": 14.7337,
      "count": 2,
      "walk": 7,
      "eucl": 5
    },
    {
      "x": 10.8027,
      "y": 9.9335,
      "count": 1,
      "walk": 8,
      "eucl": 8
    },
    {
      "x": 16.0698,
      "y": 14.1123,
      "count": 1,
      "walk": 7,
      "eucl": 4
    },
    {
      "x": 10.3826,
      "y": 10.5681,
      "count": 1,
      "walk": 6,
      "eucl": 7
    },
    {
      "x": 13.6855,
      "y": 8.9848,
      "count": 1,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 15.8046,
      "y": 13.9283,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.4963,
      "y": 10.7346,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.4061,
      "y": 11.1927,
      "count": 8,
      "walk": 7,
      "eucl": 10
    },
    {
      "x": 15.911,
      "y": 12.2071,
      "count": 1,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 10.1881,
      "y": 11.9183,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 16.5468,
      "y": 11.3934,
      "count": 1,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 17.515,
      "y": 11.2289,
      "count": 1,
      "walk": 10,
      "eucl": 11
    },
    {
      "x": 13.778,
      "y": 8.8649,
      "count": 3,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 11.7055,
      "y": 10.3647,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.3691,
      "y": 12.5503,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.2128,
      "y": 16.9593,
      "count": 2,
      "walk": 4,
      "eucl": 4
    },
    {
      "x": 15.1831,
      "y": 11.5893,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.1393,
      "y": 13.2019,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.5544,
      "y": 13.1752,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.4398,
      "y": 13.2782,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.8459,
      "y": 14.8691,
      "count": 1,
      "walk": 3,
      "eucl": 3
    },
    {
      "x": 10.5298,
      "y": 11.6294,
      "count": 3,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 9.9331,
      "y": 12.3059,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 14.1595,
      "y": 9.2389,
      "count": 1,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 13.6184,
      "y": 12.5493,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.956,
      "y": 9.8398,
      "count": 1,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 15.6936,
      "y": 12.3808,
      "count": 2,
      "walk": 10,
      "eucl": 7
    },
    {
      "x": 9.2001,
      "y": 11.9722,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 8.3111,
      "y": 7.2025,
      "count": 3,
      "walk": 8,
      "eucl": 13
    },
    {
      "x": 16.8089,
      "y": 11.4272,
      "count": 2,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 9.084,
      "y": 13.2159,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 8.4361,
      "y": 7.3936,
      "count": 1,
      "walk": 8,
      "eucl": 8
    },
    {
      "x": 15.3481,
      "y": 9.8203,
      "count": 2,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 13.3134,
      "y": 12.3789,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.2322,
      "y": 9.7317,
      "count": 1,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 13.891,
      "y": 10.9525,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.364,
      "y": 9.603,
      "count": 1,
      "walk": 7,
      "eucl": 8
    },
    {
      "x": 14.1069,
      "y": 13.6031,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.463,
      "y": 11.2098,
      "count": 4,
      "walk": 6,
      "eucl": 7
    },
    {
      "x": 10.3077,
      "y": 9.4627,
      "count": 1,
      "walk": 8,
      "eucl": 8
    },
    {
      "x": 13.4133,
      "y": 12.4284,
      "count": 4,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.6616,
      "y": 13.9356,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.2267,
      "y": 12.3392,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.246,
      "y": 10.514,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.0218,
      "y": 14.1121,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.7733,
      "y": 9.5252,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.6256,
      "y": 10.9298,
      "count": 1,
      "walk": 6,
      "eucl": 7
    },
    {
      "x": 9.3273,
      "y": 12.1684,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 14.5084,
      "y": 11.5005,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.6481,
      "y": 11.7066,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.7345,
      "y": 6.09,
      "count": 1,
      "walk": 12,
      "eucl": 12
    },
    {
      "x": 11.768,
      "y": 10.2685,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.5737,
      "y": 11.1289,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.4061,
      "y": 13.2848,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.5366,
      "y": 12.7609,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.0242,
      "y": 10.708,
      "count": 1,
      "walk": 9,
      "eucl": 7
    },
    {
      "x": 14.5778,
      "y": 16.1893,
      "count": 1,
      "walk": 3,
      "eucl": 4
    },
    {
      "x": 15.3262,
      "y": 13.4332,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.7812,
      "y": 11.1606,
      "count": 4,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.5681,
      "y": 11.0279,
      "count": 2,
      "walk": 6,
      "eucl": 7
    },
    {
      "x": 14.7596,
      "y": 10.7523,
      "count": 1,
      "walk": 7,
      "eucl": 10
    },
    {
      "x": 14.2318,
      "y": 12.0407,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.3469,
      "y": 11.9758,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.5188,
      "y": 10.582,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.6448,
      "y": 9.8829,
      "count": 1,
      "walk": 8,
      "eucl": 8
    },
    {
      "x": 10.0868,
      "y": 11.4702,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 12.9097,
      "y": 11.7374,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.1725,
      "y": 9.9656,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.9171,
      "y": 10.202,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.4717,
      "y": 11.3839,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.7787,
      "y": 12.313,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.018,
      "y": 12.7492,
      "count": 5,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.5041,
      "y": 13.3994,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 9.2179,
      "y": 12.3334,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 10.3974,
      "y": 11.306,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 12.746,
      "y": 9.1552,
      "count": 1,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 9.1059,
      "y": 6.344,
      "count": 1,
      "walk": 8,
      "eucl": 13
    },
    {
      "x": 11.183,
      "y": 11.4176,
      "count": 4,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.7665,
      "y": 11.23,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.6229,
      "y": 13.3885,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 8.8126,
      "y": 15.1341,
      "count": 1,
      "walk": 5,
      "eucl": 5
    },
    {
      "x": 16.1848,
      "y": 14.2908,
      "count": 1,
      "walk": 7,
      "eucl": 4
    },
    {
      "x": 12.8446,
      "y": 11.6103,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.6936,
      "y": 10.2149,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.025,
      "y": 11.8551,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.913,
      "y": 12.6928,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.608,
      "y": 9.0751,
      "count": 2,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 12.4718,
      "y": 13.0113,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 9.8706,
      "y": 12.4041,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 17.5951,
      "y": 7.3359,
      "count": 1,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 11.103,
      "y": 11.1124,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 16.6621,
      "y": 14.4043,
      "count": 1,
      "walk": 4,
      "eucl": 4
    },
    {
      "x": 9.693,
      "y": 11.0098,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 13.7408,
      "y": 10.0784,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.1237,
      "y": 11.8491,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.904,
      "y": 12.763,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.0458,
      "y": 11.2315,
      "count": 4,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.7755,
      "y": 13.9879,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.9002,
      "y": 10.3388,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.3155,
      "y": 11.5116,
      "count": 18,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 9.7944,
      "y": 11.7724,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 12.6776,
      "y": 12.0546,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.9603,
      "y": 9.1625,
      "count": 1,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 14.0888,
      "y": 9.3376,
      "count": 1,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 11.0271,
      "y": 11.7456,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.5416,
      "y": 8.6848,
      "count": 4,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 9.5793,
      "y": 11.7808,
      "count": 2,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 15.4657,
      "y": 11.0966,
      "count": 2,
      "walk": 7,
      "eucl": 10
    },
    {
      "x": 14.4419,
      "y": 12.1595,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.7406,
      "y": 11.3125,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.391,
      "y": 11.0337,
      "count": 4,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 16.0157,
      "y": 9.0723,
      "count": 1,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 9.922,
      "y": 11.8635,
      "count": 2,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 10.8018,
      "y": 9.6871,
      "count": 1,
      "walk": 8,
      "eucl": 8
    },
    {
      "x": 12.6326,
      "y": 11.6227,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 9.2621,
      "y": 10.6632,
      "count": 2,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 13.7846,
      "y": 13.8156,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.7079,
      "y": 9.97,
      "count": 1,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 15.2915,
      "y": 10.0498,
      "count": 1,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 14.1469,
      "y": 12.4226,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.9726,
      "y": 11.3448,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.3651,
      "y": 10.4843,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.8163,
      "y": 10.0421,
      "count": 2,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 15.0499,
      "y": 13.6139,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.324,
      "y": 9.7949,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.4511,
      "y": 11.7768,
      "count": 2,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 13.3826,
      "y": 9.4557,
      "count": 1,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 10.3388,
      "y": 11.3961,
      "count": 3,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 14.9597,
      "y": 11.9689,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.3169,
      "y": 14.8315,
      "count": 3,
      "walk": 3,
      "eucl": 3
    },
    {
      "x": 12.8834,
      "y": 10.7844,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.2704,
      "y": 9.1399,
      "count": 1,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 15.7751,
      "y": 9.5666,
      "count": 1,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 13.0638,
      "y": 13.8501,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.2838,
      "y": 12.108,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.0186,
      "y": 11.7897,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.03,
      "y": 13.3556,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.9812,
      "y": 14.3732,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.8822,
      "y": 14.6351,
      "count": 2,
      "walk": 3,
      "eucl": 3
    },
    {
      "x": 10.9375,
      "y": 9.725,
      "count": 4,
      "walk": 8,
      "eucl": 8
    },
    {
      "x": 16.0241,
      "y": 14.0099,
      "count": 1,
      "walk": 7,
      "eucl": 4
    },
    {
      "x": 11.5854,
      "y": 12.2934,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.6989,
      "y": 12.0022,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 16.8394,
      "y": 11.6017,
      "count": 1,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 13.2889,
      "y": 9.6316,
      "count": 2,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 11.706,
      "y": 9.6379,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.1287,
      "y": 11.5296,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 9.5958,
      "y": 10.9393,
      "count": 2,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 13.2453,
      "y": 12.9979,
      "count": 5,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.285,
      "y": 9.3379,
      "count": 1,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 15.3869,
      "y": 7.33,
      "count": 1,
      "walk": 10,
      "eucl": 9
    },
    {
      "x": 12.3847,
      "y": 13.6947,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.1889,
      "y": 11.789,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.1233,
      "y": 11.6883,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 16.2926,
      "y": 14.3381,
      "count": 4,
      "walk": 7,
      "eucl": 4
    },
    {
      "x": 12.6439,
      "y": 10.648,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.4938,
      "y": 12.8748,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 13.9151,
      "y": 13.5659,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.7471,
      "y": 10.7125,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.6937,
      "y": 13.879,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.8376,
      "y": 11.0555,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.3573,
      "y": 11.2941,
      "count": 1,
      "walk": 7,
      "eucl": 10
    },
    {
      "x": 15.65,
      "y": 12.9043,
      "count": 5,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.5497,
      "y": 12.5644,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 16.2529,
      "y": 10.0935,
      "count": 1,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 13.6238,
      "y": 11.2042,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.6153,
      "y": 10.3553,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.6575,
      "y": 11.1716,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 8.7711,
      "y": 10.9425,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 13.0388,
      "y": 11.2406,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.5723,
      "y": 12.2913,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.4366,
      "y": 11.5638,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 13.1377,
      "y": 12.2836,
      "count": 4,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 9.8549,
      "y": 12.176,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 12.7444,
      "y": 12.8467,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.5906,
      "y": 9.5394,
      "count": 1,
      "walk": 7,
      "eucl": 8
    },
    {
      "x": 13.6387,
      "y": 11.5084,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.7658,
      "y": 13.6115,
      "count": 5,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 8.7359,
      "y": 12.0517,
      "count": 2,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 14.7863,
      "y": 14.0939,
      "count": 1,
      "walk": 3,
      "eucl": 7
    },
    {
      "x": 14.3738,
      "y": 13.0767,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.2804,
      "y": 11.4215,
      "count": 2,
      "walk": 7,
      "eucl": 10
    },
    {
      "x": 9.0466,
      "y": 11.2075,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 10.7526,
      "y": 8.8438,
      "count": 1,
      "walk": 8,
      "eucl": 8
    },
    {
      "x": 14.9461,
      "y": 10.1051,
      "count": 1,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 13.2268,
      "y": 11.9096,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.3578,
      "y": 12.0367,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.0034,
      "y": 14.5691,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.5872,
      "y": 11.6054,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.3888,
      "y": 10.9706,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.5705,
      "y": 12.7984,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.5633,
      "y": 14.1745,
      "count": 2,
      "walk": 7,
      "eucl": 4
    },
    {
      "x": 12.033,
      "y": 11.3689,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.7965,
      "y": 14.1689,
      "count": 1,
      "walk": 3,
      "eucl": 7
    },
    {
      "x": 13.1742,
      "y": 9.8358,
      "count": 1,
      "walk": 7,
      "eucl": 9
    },
    {
      "x": 13.9573,
      "y": 13.8832,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.2642,
      "y": 10.8024,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.5153,
      "y": 12.4878,
      "count": 5,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.7689,
      "y": 11.9578,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.9731,
      "y": 10.9502,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.7789,
      "y": 13.1997,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 9.8131,
      "y": 12.5021,
      "count": 3,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 14.1441,
      "y": 10.5739,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 16.0988,
      "y": 14.2371,
      "count": 5,
      "walk": 7,
      "eucl": 4
    },
    {
      "x": 14.695,
      "y": 10.1268,
      "count": 3,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 8.8403,
      "y": 12.1342,
      "count": 2,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 10.547,
      "y": 12.3271,
      "count": 2,
      "walk": 7,
      "eucl": 6
    },
    {
      "x": 8.2807,
      "y": 11.5683,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 12.385,
      "y": 13.218,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 16.7338,
      "y": 8.4475,
      "count": 1,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 15.723,
      "y": 7.1781,
      "count": 1,
      "walk": 10,
      "eucl": 12
    },
    {
      "x": 14.2725,
      "y": 10.4667,
      "count": 7,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 9.7368,
      "y": 12.3591,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 16.0673,
      "y": 9.9703,
      "count": 1,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 14.5197,
      "y": 9.0298,
      "count": 1,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 14.5716,
      "y": 11.3893,
      "count": 5,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.7118,
      "y": 13.9442,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 16.2364,
      "y": 14.1988,
      "count": 1,
      "walk": 7,
      "eucl": 4
    },
    {
      "x": 12.8076,
      "y": 14.2828,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.6416,
      "y": 12.1734,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 9.4233,
      "y": 10.7938,
      "count": 8,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 15.7112,
      "y": 11.6084,
      "count": 1,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 14.2621,
      "y": 12.4909,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.1883,
      "y": 13.4327,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.4842,
      "y": 10.4193,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.0286,
      "y": 10.3617,
      "count": 1,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 11.939,
      "y": 14.1746,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.4819,
      "y": 8.887,
      "count": 4,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 10.9473,
      "y": 16.4859,
      "count": 1,
      "walk": 3,
      "eucl": 2
    },
    {
      "x": 14.2051,
      "y": 9.4381,
      "count": 1,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 13.0225,
      "y": 9.6097,
      "count": 1,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 11.0765,
      "y": 11.6416,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.2464,
      "y": 8.6298,
      "count": 1,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 13.3648,
      "y": 10.3641,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 16.1436,
      "y": 10.9053,
      "count": 1,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 16.4117,
      "y": 14.3973,
      "count": 1,
      "walk": 4,
      "eucl": 4
    },
    {
      "x": 12.5905,
      "y": 14.9784,
      "count": 1,
      "walk": 3,
      "eucl": 3
    },
    {
      "x": 13.2547,
      "y": 10.8191,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.1016,
      "y": 10.6498,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 15.6214,
      "y": 12.5562,
      "count": 1,
      "walk": 10,
      "eucl": 7
    },
    {
      "x": 13.1783,
      "y": 10.6118,
      "count": 4,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.806,
      "y": 12.6384,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.9185,
      "y": 9.7942,
      "count": 1,
      "walk": 9,
      "eucl": 9
    },
    {
      "x": 13.3378,
      "y": 14.3314,
      "count": 1,
      "walk": 3,
      "eucl": 7
    },
    {
      "x": 12.1692,
      "y": 11.4368,
      "count": 4,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.0277,
      "y": 11.2829,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 13.2086,
      "y": 14.2624,
      "count": 1,
      "walk": 3,
      "eucl": 7
    },
    {
      "x": 10.485,
      "y": 12.4563,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 10.9263,
      "y": 14.6245,
      "count": 3,
      "walk": 7,
      "eucl": 5
    },
    {
      "x": 13.3186,
      "y": 11.0238,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.0805,
      "y": 14.2013,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.6459,
      "y": 10.4567,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.5639,
      "y": 10.0718,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.3755,
      "y": 13.0669,
      "count": 4,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 10.6883,
      "y": 12.4591,
      "count": 2,
      "walk": 7,
      "eucl": 6
    },
    {
      "x": 12.1876,
      "y": 14.1375,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.7702,
      "y": 9.2105,
      "count": 1,
      "walk": 9,
      "eucl": 10
    },
    {
      "x": 16.2366,
      "y": 9.9145,
      "count": 1,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 11.6528,
      "y": 12.6229,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 9.5015,
      "y": 11.5447,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 13.2694,
      "y": 14.7998,
      "count": 1,
      "walk": 3,
      "eucl": 3
    },
    {
      "x": 13.6161,
      "y": 15.3284,
      "count": 1,
      "walk": 3,
      "eucl": 3
    },
    {
      "x": 13.4306,
      "y": 10.2633,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.8446,
      "y": 16.0189,
      "count": 1,
      "walk": 3,
      "eucl": 3
    },
    {
      "x": 12.7822,
      "y": 11.3419,
      "count": 5,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 9.2077,
      "y": 11.0817,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 15.5814,
      "y": 10.9205,
      "count": 1,
      "walk": 10,
      "eucl": 10
    },
    {
      "x": 12.9804,
      "y": 10.6607,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.5374,
      "y": 10.6277,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 9.379,
      "y": 10.9628,
      "count": 1,
      "walk": 6,
      "eucl": 6
    },
    {
      "x": 13.5217,
      "y": 11.1397,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 13.496,
      "y": 11.039,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 14.2645,
      "y": 15.6235,
      "count": 1,
      "walk": 3,
      "eucl": 3
    },
    {
      "x": 14.0724,
      "y": 15.5104,
      "count": 1,
      "walk": 3,
      "eucl": 3
    },
    {
      "x": 12.9447,
      "y": 13.7879,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.4133,
      "y": 13.8084,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 11.4181,
      "y": 9.8555,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.278,
      "y": 13.5502,
      "count": 2,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.4215,
      "y": 11.567,
      "count": 3,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 12.0609,
      "y": 10.3029,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 17.2717,
      "y": 11.6338,
      "count": 1,
      "walk": 11,
      "eucl": 11
    },
    {
      "x": 12.4261,
      "y": 11.9144,
      "count": 1,
      "walk": 7,
      "eucl": 7
    },
    {
      "x": 15.0182,
      "y": 12.5158,
      "count": 1,
      "walk": 7,
      "eucl": 7
    }
  ],
  "roads": [
    {
      "n": "Oxford Street",
      "x1": 4.91,
      "y1": 15.49,
      "x2": 5.025,
      "y2": 15.516
    },
    {
      "n": "Princes Street (I)",
      "x1": 4.293,
      "y1": 16.615,
      "x2": 4.91,
      "y2": 15.49
    },
    {
      "n": "Soho Square",
      "x1": 18.907,
      "y1": 15.376,
      "x2": 19.064,
      "y2": 15.45
    },
    {
      "n": "Soho Square",
      "x1": 19.064,
      "y1": 15.45,
      "x2": 18.735,
      "y2": 16.15
    },
    {
      "n": "Noel Street",
      "x1": 13.088,
      "y1": 15.357,
      "x2": 13.58,
      "y2": 15.604
    },
    {
      "n": "Berwick Street",
      "x1": 12.306,
      "y1": 16.921,
      "x2": 13.088,
      "y2": 15.357
    },
    {
      "n": "Great Chapel Street",
      "x1": 15.607,
      "y1": 15.622,
      "x2": 15.694,
      "y2": 15.34
    },
    {
      "n": "Blenheim Mews",
      "x1": 10.264,
      "y1": 15.67,
      "x2": 9.491,
      "y2": 15.321
    },
    {
      "n": "Blenheim Street",
      "x1": 9.089,
      "y1": 16.317,
      "x2": 9.491,
      "y2": 15.321
    },
    {
      "n": "Noel Street",
      "x1": 13.58,
      "y1": 15.604,
      "x2": 13.67,
      "y2": 15.389
    },
    {
      "n": "Noel Street",
      "x1": 13.67,
      "y1": 15.389,
      "x2": 13.56,
      "y2": 15.315
    },
    {
      "n": "Oxford Street",
      "x1": 3.721,
      "y1": 15.248,
      "x2": 4.91,
      "y2": 15.49
    },
    {
      "n": "Phoenix Yard",
      "x1": 3.519,
      "y1": 16.033,
      "x2": 3.721,
      "y2": 15.248
    },
    {
      "n": "Carlisle Street",
      "x1": 16.588,
      "y1": 15.171,
      "x2": 17.421,
      "y2": 15.542
    },
    {
      "n": "Dean Street",
      "x1": 16.27,
      "y1": 15.93,
      "x2": 16.588,
      "y2": 15.171
    },
    {
      "n": "Oxford Street",
      "x1": 3.45,
      "y1": 15.169,
      "x2": 3.721,
      "y2": 15.248
    },
    {
      "n": "Soho Square",
      "x1": 18.402,
      "y1": 15.139,
      "x2": 18.907,
      "y2": 15.376
    },
    {
      "n": "Marlborough Mews",
      "x1": 9.059,
      "y1": 15.126,
      "x2": 9.491,
      "y2": 15.321
    },
    {
      "n": "Marlborough Mews",
      "x1": 9.491,
      "y1": 15.321,
      "x2": 8.157,
      "y2": 14.718
    },
    {
      "n": "Nags Head Yard",
      "x1": 9.059,
      "y1": 15.126,
      "x2": 8.784,
      "y2": 15.772
    },
    {
      "n": "Noel Street",
      "x1": 13.088,
      "y1": 15.357,
      "x2": 12.214,
      "y2": 14.909
    },
    {
      "n": "Soho Square",
      "x1": 17.895,
      "y1": 14.9,
      "x2": 18.402,
      "y2": 15.139
    },
    {
      "n": "Carlisle Street",
      "x1": 15.694,
      "y1": 15.34,
      "x2": 15.847,
      "y2": 14.842
    },
    {
      "n": "Carlisle Street",
      "x1": 15.847,
      "y1": 14.842,
      "x2": 16.588,
      "y2": 15.171
    },
    {
      "n": "Soho Square",
      "x1": 17.421,
      "y1": 15.542,
      "x2": 17.744,
      "y2": 14.829
    },
    {
      "n": "Soho Square",
      "x1": 17.744,
      "y1": 14.829,
      "x2": 17.895,
      "y2": 14.9
    },
    {
      "n": "Poland Street",
      "x1": 11.8,
      "y1": 14.811,
      "x2": 11.45,
      "y2": 15.614
    },
    {
      "n": "Poland Street",
      "x1": 11.45,
      "y1": 15.614,
      "x2": 11.165,
      "y2": 16.71
    },
    {
      "n": "Little Chapel Street",
      "x1": 14.547,
      "y1": 14.806,
      "x2": 15.694,
      "y2": 15.34
    },
    {
      "n": "Wardour Street",
      "x1": 14.443,
      "y1": 15.01,
      "x2": 14.547,
      "y2": 14.806
    },
    {
      "n": "Portland Street",
      "x1": 13.934,
      "y1": 14.748,
      "x2": 14.443,
      "y2": 15.01
    },
    {
      "n": "Queen Street (I)",
      "x1": 7.868,
      "y1": 16.078,
      "x2": 7.983,
      "y2": 15.222
    },
    {
      "n": "Queen Street (I)",
      "x1": 7.983,
      "y1": 15.222,
      "x2": 7.953,
      "y2": 15.141
    },
    {
      "n": "Queen Street (I)",
      "x1": 7.953,
      "y1": 15.141,
      "x2": 8.157,
      "y2": 14.718
    },
    {
      "n": "Dean Street",
      "x1": 16.588,
      "y1": 15.171,
      "x2": 16.653,
      "y2": 15.017
    },
    {
      "n": "Dean Street",
      "x1": 16.653,
      "y1": 15.017,
      "x2": 16.863,
      "y2": 14.546
    },
    {
      "n": "Portland Street",
      "x1": 13.502,
      "y1": 14.525,
      "x2": 13.934,
      "y2": 14.748
    },
    {
      "n": "Berwick Street",
      "x1": 13.502,
      "y1": 14.525,
      "x2": 13.088,
      "y2": 15.357
    },
    {
      "n": "Castle Street East",
      "x1": 9.683,
      "y1": 18.209,
      "x2": 10.796,
      "y2": 18.57
    },
    {
      "n": "Argyll Street",
      "x1": 7.235,
      "y1": 14.425,
      "x2": 6.796,
      "y2": 15.297
    },
    {
      "n": "Argyll Street",
      "x1": 6.796,
      "y1": 15.297,
      "x2": 6.633,
      "y2": 15.822
    },
    {
      "n": "Regent Street",
      "x1": 6.012,
      "y1": 14.371,
      "x2": 5.958,
      "y2": 14.593
    },
    {
      "n": "Regent Street",
      "x1": 5.958,
      "y1": 14.593,
      "x2": 5.7,
      "y2": 15.626
    },
    {
      "n": "Princes Street (II)",
      "x1": 5.357,
      "y1": 14.215,
      "x2": 6.012,
      "y2": 14.371
    },
    {
      "n": "Swallow Place",
      "x1": 5.025,
      "y1": 15.516,
      "x2": 5.13,
      "y2": 14.95
    },
    {
      "n": "Swallow Place",
      "x1": 5.13,
      "y1": 14.95,
      "x2": 5.203,
      "y2": 14.957
    },
    {
      "n": "Swallow Place",
      "x1": 5.203,
      "y1": 14.957,
      "x2": 5.357,
      "y2": 14.215
    },
    {
      "n": "Portland Street",
      "x1": 12.689,
      "y1": 14.115,
      "x2": 13.502,
      "y2": 14.525
    },
    {
      "n": "Great Marlborough Street",
      "x1": 10.038,
      "y1": 14.052,
      "x2": 11.8,
      "y2": 14.811
    },
    {
      "n": "Blenheim Street",
      "x1": 9.491,
      "y1": 15.321,
      "x2": 10.038,
      "y2": 14.052
    },
    {
      "n": "St Anns Court",
      "x1": 15.864,
      "y1": 13.981,
      "x2": 15.971,
      "y2": 14.057
    },
    {
      "n": "St Anns Court",
      "x1": 15.971,
      "y1": 14.057,
      "x2": 15.947,
      "y2": 14.103
    },
    {
      "n": "St Anns Court",
      "x1": 15.947,
      "y1": 14.103,
      "x2": 16.863,
      "y2": 14.546
    },
    {
      "n": "St Anns Place",
      "x1": 15.539,
      "y1": 14.11,
      "x2": 15.737,
      "y2": 14.214
    },
    {
      "n": "St Anns Place",
      "x1": 15.737,
      "y1": 14.214,
      "x2": 15.864,
      "y2": 13.981
    },
    {
      "n": "Portland Street",
      "x1": 12.208,
      "y1": 13.86,
      "x2": 12.689,
      "y2": 14.115
    },
    {
      "n": "Poland Street",
      "x1": 11.8,
      "y1": 14.811,
      "x2": 12.208,
      "y2": 13.86
    },
    {
      "n": "St Anns Court",
      "x1": 15.573,
      "y1": 13.84,
      "x2": 15.864,
      "y2": 13.981
    },
    {
      "n": "Greek Street",
      "x1": 18.907,
      "y1": 15.376,
      "x2": 19.625,
      "y2": 13.832
    },
    {
      "n": "Little Argyll Street",
      "x1": 6.149,
      "y1": 13.812,
      "x2": 7.235,
      "y2": 14.425
    },
    {
      "n": "Regent Street",
      "x1": 6.149,
      "y1": 13.812,
      "x2": 6.012,
      "y2": 14.371
    },
    {
      "n": "Dean Street",
      "x1": 16.863,
      "y1": 14.546,
      "x2": 17.194,
      "y2": 13.803
    },
    {
      "n": "St James Workhouse",
      "x1": 11.784,
      "y1": 13.635,
      "x2": 12.208,
      "y2": 13.86
    },
    {
      "n": "St Anns Court",
      "x1": 15.149,
      "y1": 13.627,
      "x2": 15.573,
      "y2": 13.84
    },
    {
      "n": "Market Place",
      "x1": 8.657,
      "y1": 18.089,
      "x2": 8.533,
      "y2": 18.524
    },
    {
      "n": "Wardour Street",
      "x1": 14.547,
      "y1": 14.806,
      "x2": 15.149,
      "y2": 13.627
    },
    {
      "n": "Great Marlborough Street",
      "x1": 8.896,
      "y1": 13.56,
      "x2": 10.038,
      "y2": 14.052
    },
    {
      "n": "Berwick Street",
      "x1": 14.043,
      "y1": 13.508,
      "x2": 13.502,
      "y2": 14.525
    },
    {
      "n": "Wardour Mews",
      "x1": 13.934,
      "y1": 14.748,
      "x2": 14.324,
      "y2": 14.017
    },
    {
      "n": "Wardour Mews",
      "x1": 14.324,
      "y1": 14.017,
      "x2": 14.551,
      "y2": 13.501
    },
    {
      "n": "Queen Street (II)",
      "x1": 19.146,
      "y1": 13.476,
      "x2": 19.627,
      "y2": 13.739
    },
    {
      "n": "Batemans Buildings",
      "x1": 18.402,
      "y1": 15.139,
      "x2": 19.002,
      "y2": 13.788
    },
    {
      "n": "Batemans Buildings",
      "x1": 19.002,
      "y1": 13.788,
      "x2": 19.146,
      "y2": 13.476
    },
    {
      "n": "Wardour Street",
      "x1": 15.149,
      "y1": 13.627,
      "x2": 15.277,
      "y2": 13.375
    },
    {
      "n": "Queen Street (II)",
      "x1": 18.665,
      "y1": 13.191,
      "x2": 19.146,
      "y2": 13.476
    },
    {
      "n": "Frith Street",
      "x1": 17.895,
      "y1": 14.9,
      "x2": 18.361,
      "y2": 13.867
    },
    {
      "n": "Frith Street",
      "x1": 18.361,
      "y1": 13.867,
      "x2": 18.665,
      "y2": 13.191
    },
    {
      "n": "Bentinck Street",
      "x1": 13.379,
      "y1": 13.164,
      "x2": 14.043,
      "y2": 13.508
    },
    {
      "n": "Margaret Street",
      "x1": 5.098,
      "y1": 18.053,
      "x2": 6.479,
      "y2": 18.479
    },
    {
      "n": "Portland Mews",
      "x1": 12.689,
      "y1": 14.115,
      "x2": 12.782,
      "y2": 13.936
    },
    {
      "n": "Portland Mews",
      "x1": 12.782,
      "y1": 13.936,
      "x2": 12.942,
      "y2": 13.597
    },
    {
      "n": "Portland Mews",
      "x1": 12.942,
      "y1": 13.597,
      "x2": 13.103,
      "y2": 13.675
    },
    {
      "n": "Portland Mews",
      "x1": 13.103,
      "y1": 13.675,
      "x2": 13.379,
      "y2": 13.164
    },
    {
      "n": "Argyll Place",
      "x1": 7.912,
      "y1": 13.136,
      "x2": 8.896,
      "y2": 13.56
    },
    {
      "n": "Argyll Street",
      "x1": 7.912,
      "y1": 13.136,
      "x2": 7.235,
      "y2": 14.425
    },
    {
      "n": "Ship Yard",
      "x1": 15.573,
      "y1": 13.84,
      "x2": 15.819,
      "y2": 13.322
    },
    {
      "n": "Ship Yard",
      "x1": 15.819,
      "y1": 13.322,
      "x2": 15.457,
      "y2": 13.131
    },
    {
      "n": "Wardour Street",
      "x1": 15.277,
      "y1": 13.375,
      "x2": 15.457,
      "y2": 13.131
    },
    {
      "n": "Edward Street",
      "x1": 14.809,
      "y1": 13.107,
      "x2": 15.277,
      "y2": 13.375
    },
    {
      "n": "Regent Street",
      "x1": 6.47,
      "y1": 13.027,
      "x2": 6.232,
      "y2": 13.471
    },
    {
      "n": "Regent Street",
      "x1": 6.232,
      "y1": 13.471,
      "x2": 6.149,
      "y2": 13.812
    },
    {
      "n": "Bentinck Street",
      "x1": 13.379,
      "y1": 13.164,
      "x2": 13.085,
      "y2": 13.003
    },
    {
      "n": "Edward Street",
      "x1": 14.364,
      "y1": 12.852,
      "x2": 14.809,
      "y2": 13.107
    },
    {
      "n": "Berwick Street",
      "x1": 14.364,
      "y1": 12.852,
      "x2": 14.043,
      "y2": 13.508
    },
    {
      "n": "Regent Street",
      "x1": 4.992,
      "y1": 18.441,
      "x2": 5.098,
      "y2": 18.053
    },
    {
      "n": "Carnaby Street",
      "x1": 8.896,
      "y1": 13.56,
      "x2": 8.939,
      "y2": 12.832
    },
    {
      "n": "Berwick Street",
      "x1": 14.417,
      "y1": 12.743,
      "x2": 14.364,
      "y2": 12.852
    },
    {
      "n": "Argyll Place",
      "x1": 7.208,
      "y1": 12.74,
      "x2": 7.912,
      "y2": 13.136
    },
    {
      "n": "Queen Street (II)",
      "x1": 18.665,
      "y1": 13.191,
      "x2": 17.707,
      "y2": 12.645
    },
    {
      "n": "Dean Street",
      "x1": 17.194,
      "y1": 13.803,
      "x2": 17.577,
      "y2": 12.939
    },
    {
      "n": "Dean Street",
      "x1": 17.577,
      "y1": 12.939,
      "x2": 17.707,
      "y2": 12.645
    },
    {
      "n": "Hanover Street",
      "x1": 5.187,
      "y1": 12.61,
      "x2": 6.47,
      "y2": 13.027
    },
    {
      "n": "Argyll Place",
      "x1": 6.759,
      "y1": 12.486,
      "x2": 7.208,
      "y2": 12.74
    },
    {
      "n": "Regent Street",
      "x1": 6.759,
      "y1": 12.486,
      "x2": 6.47,
      "y2": 13.027
    },
    {
      "n": "Broad Street",
      "x1": 13.911,
      "y1": 12.479,
      "x2": 14.417,
      "y2": 12.743
    },
    {
      "n": "Green Dragon Yard",
      "x1": 7.417,
      "y1": 12.476,
      "x2": 7.851,
      "y2": 12.745
    },
    {
      "n": "Castle Street East",
      "x1": 8.772,
      "y1": 17.915,
      "x2": 9.683,
      "y2": 18.209
    },
    {
      "n": "King Street (I)",
      "x1": 7.417,
      "y1": 12.476,
      "x2": 7.208,
      "y2": 12.74
    },
    {
      "n": "Tyler Court",
      "x1": 9.097,
      "y1": 12.385,
      "x2": 9.553,
      "y2": 12.727
    },
    {
      "n": "Carnaby Street",
      "x1": 8.939,
      "y1": 12.832,
      "x2": 8.924,
      "y2": 12.636
    },
    {
      "n": "Carnaby Street",
      "x1": 8.924,
      "y1": 12.636,
      "x2": 9.097,
      "y2": 12.385
    },
    {
      "n": "Hanover Street",
      "x1": 4.25,
      "y1": 12.305,
      "x2": 5.187,
      "y2": 12.61
    },
    {
      "n": "Princes Street/Hanover Square",
      "x1": 5.357,
      "y1": 14.215,
      "x2": 3.769,
      "y2": 13.705
    },
    {
      "n": "Princes Street/Hanover Square",
      "x1": 3.769,
      "y1": 13.705,
      "x2": 4.25,
      "y2": 12.305
    },
    {
      "n": "West Street",
      "x1": 9.553,
      "y1": 12.727,
      "x2": 9.858,
      "y2": 12.291
    },
    {
      "n": "Berwick Street",
      "x1": 14.417,
      "y1": 12.743,
      "x2": 14.706,
      "y2": 12.25
    },
    {
      "n": "Broad Street",
      "x1": 13.397,
      "y1": 12.204,
      "x2": 13.911,
      "y2": 12.479
    },
    {
      "n": "Wardour Street",
      "x1": 15.457,
      "y1": 13.131,
      "x2": 15.877,
      "y2": 12.135
    },
    {
      "n": "Richmond Buildings/Mews",
      "x1": 16.942,
      "y1": 12.118,
      "x2": 16.49,
      "y2": 13.016
    },
    {
      "n": "Richmond Buildings/Mews",
      "x1": 16.49,
      "y1": 13.016,
      "x2": 16.436,
      "y2": 13.024
    },
    {
      "n": "Richmond Buildings/Mews",
      "x1": 16.436,
      "y1": 13.024,
      "x2": 16.271,
      "y2": 13.405
    },
    {
      "n": "Richmond Buildings/Mews",
      "x1": 16.271,
      "y1": 13.405,
      "x2": 17.194,
      "y2": 13.803
    },
    {
      "n": "Market Place",
      "x1": 8.772,
      "y1": 17.915,
      "x2": 8.657,
      "y2": 18.089
    },
    {
      "n": "Little Marlborough Street",
      "x1": 8.939,
      "y1": 12.832,
      "x2": 7.752,
      "y2": 12.055
    },
    {
      "n": "King Street (I)",
      "x1": 7.752,
      "y1": 12.055,
      "x2": 7.417,
      "y2": 12.476
    },
    {
      "n": "Dean Street",
      "x1": 17.707,
      "y1": 12.645,
      "x2": 17.97,
      "y2": 12.048
    },
    {
      "n": "Broad Street",
      "x1": 13.007,
      "y1": 11.996,
      "x2": 13.397,
      "y2": 12.204
    },
    {
      "n": "Poland Street",
      "x1": 12.208,
      "y1": 13.86,
      "x2": 13.007,
      "y2": 11.996
    },
    {
      "n": "West Street",
      "x1": 9.858,
      "y1": 12.291,
      "x2": 10.055,
      "y2": 11.991
    },
    {
      "n": "Kemps Court",
      "x1": 14.191,
      "y1": 11.97,
      "x2": 14.706,
      "y2": 12.25
    },
    {
      "n": "Hopkins Street",
      "x1": 13.911,
      "y1": 12.479,
      "x2": 14.191,
      "y2": 11.97
    },
    {
      "n": "Duck Lane/Ham Square",
      "x1": 14.809,
      "y1": 13.107,
      "x2": 15.275,
      "y2": 12.1
    },
    {
      "n": "Duck Lane/Ham Square",
      "x1": 15.275,
      "y1": 12.1,
      "x2": 15.327,
      "y2": 12.016
    },
    {
      "n": "Duck Lane/Ham Square",
      "x1": 15.327,
      "y1": 12.016,
      "x2": 15.475,
      "y2": 12.05
    },
    {
      "n": "Duck Lane/Ham Square",
      "x1": 15.475,
      "y1": 12.05,
      "x2": 15.522,
      "y2": 11.953
    },
    {
      "n": "Duck Lane/Ham Square",
      "x1": 15.522,
      "y1": 11.953,
      "x2": 15.877,
      "y2": 12.135
    },
    {
      "n": "Lowndes Court",
      "x1": 9.377,
      "y1": 11.945,
      "x2": 9.858,
      "y2": 12.291
    },
    {
      "n": "Oxford Street",
      "x1": 17.447,
      "y1": 17.901,
      "x2": 18.736,
      "y2": 18.064
    },
    {
      "n": "Oxford Street",
      "x1": 18.736,
      "y1": 18.064,
      "x2": 19.503,
      "y2": 18.119
    },
    {
      "n": "Carnaby Street",
      "x1": 9.097,
      "y1": 12.385,
      "x2": 9.377,
      "y2": 11.945
    },
    {
      "n": "Marshall Street",
      "x1": 9.553,
      "y1": 12.727,
      "x2": 10.365,
      "y2": 12.975
    },
    {
      "n": "Marshall Street",
      "x1": 10.365,
      "y1": 12.975,
      "x2": 10.837,
      "y2": 11.924
    },
    {
      "n": "Carnaby Street",
      "x1": 9.377,
      "y1": 11.945,
      "x2": 9.436,
      "y2": 11.852
    },
    {
      "n": "Broad Street",
      "x1": 13.007,
      "y1": 11.996,
      "x2": 12.653,
      "y2": 11.838
    },
    {
      "n": "Wardour Street",
      "x1": 15.877,
      "y1": 12.135,
      "x2": 16.064,
      "y2": 11.717
    },
    {
      "n": "Marlborough Court",
      "x1": 10.055,
      "y1": 11.991,
      "x2": 9.558,
      "y2": 11.66
    },
    {
      "n": "Carnaby Street",
      "x1": 9.436,
      "y1": 11.852,
      "x2": 9.558,
      "y2": 11.66
    },
    {
      "n": "Tyler Street",
      "x1": 8.083,
      "y1": 11.64,
      "x2": 9.097,
      "y2": 12.385
    },
    {
      "n": "King Street (I)",
      "x1": 8.083,
      "y1": 11.64,
      "x2": 7.752,
      "y2": 12.055
    },
    {
      "n": "Hanway Street",
      "x1": 17.447,
      "y1": 17.901,
      "x2": 17.518,
      "y2": 18.439
    },
    {
      "n": "Hanway Street",
      "x1": 17.518,
      "y1": 18.439,
      "x2": 17.66,
      "y2": 18.712
    },
    {
      "n": "Dean Street",
      "x1": 17.97,
      "y1": 12.048,
      "x2": 18.151,
      "y2": 11.636
    },
    {
      "n": "South Row",
      "x1": 10.321,
      "y1": 11.583,
      "x2": 10.837,
      "y2": 11.924
    },
    {
      "n": "West Street",
      "x1": 10.055,
      "y1": 11.991,
      "x2": 10.321,
      "y2": 11.583
    },
    {
      "n": "Old Compton Street",
      "x1": 19.416,
      "y1": 11.539,
      "x2": 19.685,
      "y2": 11.699
    },
    {
      "n": "Frith Street",
      "x1": 18.665,
      "y1": 13.191,
      "x2": 18.967,
      "y2": 12.519
    },
    {
      "n": "Frith Street",
      "x1": 18.967,
      "y1": 12.519,
      "x2": 19.416,
      "y2": 11.539
    },
    {
      "n": "Hopkins Street",
      "x1": 14.191,
      "y1": 11.97,
      "x2": 14.417,
      "y2": 11.536
    },
    {
      "n": "Broad Street",
      "x1": 12.653,
      "y1": 11.838,
      "x2": 12.032,
      "y2": 11.535
    },
    {
      "n": "Dufours Place",
      "x1": 12.032,
      "y1": 11.535,
      "x2": 11.589,
      "y2": 12.483
    },
    {
      "n": "Dufours Place",
      "x1": 11.589,
      "y1": 12.483,
      "x2": 11.805,
      "y2": 12.613
    },
    {
      "n": "Pews Place",
      "x1": 9.436,
      "y1": 11.852,
      "x2": 9.208,
      "y2": 11.691
    },
    {
      "n": "Pews Place",
      "x1": 9.208,
      "y1": 11.691,
      "x2": 9.083,
      "y2": 11.661
    },
    {
      "n": "Pews Place",
      "x1": 9.083,
      "y1": 11.661,
      "x2": 8.751,
      "y2": 11.395
    },
    {
      "n": "Maddox Street",
      "x1": 5.866,
      "y1": 11.328,
      "x2": 6.759,
      "y2": 12.486
    },
    {
      "n": "Oxford Street",
      "x1": 17.174,
      "y1": 17.866,
      "x2": 17.447,
      "y2": 17.901
    },
    {
      "n": "Pollen Street",
      "x1": 5.187,
      "y1": 12.61,
      "x2": 5.456,
      "y2": 11.636
    },
    {
      "n": "Pollen Street",
      "x1": 5.456,
      "y1": 11.636,
      "x2": 5.866,
      "y2": 11.328
    },
    {
      "n": "Tylers Court",
      "x1": 15.251,
      "y1": 11.312,
      "x2": 15.637,
      "y2": 11.518
    },
    {
      "n": "Tylers Court",
      "x1": 15.637,
      "y1": 11.518,
      "x2": 15.807,
      "y2": 11.607
    },
    {
      "n": "Tylers Court",
      "x1": 15.807,
      "y1": 11.607,
      "x2": 16.064,
      "y2": 11.717
    },
    {
      "n": "Berwick Street",
      "x1": 14.706,
      "y1": 12.25,
      "x2": 15.251,
      "y2": 11.312
    },
    {
      "n": "Regent Street",
      "x1": 7.396,
      "y1": 11.296,
      "x2": 6.759,
      "y2": 12.486
    },
    {
      "n": "New Street",
      "x1": 13.86,
      "y1": 11.284,
      "x2": 13.397,
      "y2": 12.204
    },
    {
      "n": "Cock Court",
      "x1": 14.417,
      "y1": 11.536,
      "x2": 13.893,
      "y2": 11.22
    },
    {
      "n": "New Street",
      "x1": 13.893,
      "y1": 11.22,
      "x2": 13.86,
      "y2": 11.284
    },
    {
      "n": "Cross Street",
      "x1": 9.839,
      "y1": 11.218,
      "x2": 10.321,
      "y2": 11.583
    },
    {
      "n": "Carnaby Street",
      "x1": 9.558,
      "y1": 11.66,
      "x2": 9.839,
      "y2": 11.218
    },
    {
      "n": "Fouberts Place",
      "x1": 7.459,
      "y1": 11.187,
      "x2": 8.083,
      "y2": 11.64
    },
    {
      "n": "Rathbone Place",
      "x1": 17.174,
      "y1": 17.866,
      "x2": 16.738,
      "y2": 18.696
    },
    {
      "n": "Regent Street",
      "x1": 7.396,
      "y1": 11.296,
      "x2": 7.459,
      "y2": 11.187
    },
    {
      "n": "Berwick Street",
      "x1": 15.251,
      "y1": 11.312,
      "x2": 15.356,
      "y2": 11.147
    },
    {
      "n": "Meards Court/Street",
      "x1": 16.302,
      "y1": 11.124,
      "x2": 16.825,
      "y2": 11.495
    },
    {
      "n": "Meards Court/Street",
      "x1": 16.825,
      "y1": 11.495,
      "x2": 17.144,
      "y2": 11.71
    },
    {
      "n": "Meards Court/Street",
      "x1": 17.144,
      "y1": 11.71,
      "x2": 17.4,
      "y2": 11.808
    },
    {
      "n": "Meards Court/Street",
      "x1": 17.4,
      "y1": 11.808,
      "x2": 17.472,
      "y2": 11.807
    },
    {
      "n": "Meards Court/Street",
      "x1": 17.472,
      "y1": 11.807,
      "x2": 17.97,
      "y2": 12.048
    },
    {
      "n": "Wardour Street",
      "x1": 16.064,
      "y1": 11.717,
      "x2": 16.277,
      "y2": 11.189
    },
    {
      "n": "Wardour Street",
      "x1": 16.277,
      "y1": 11.189,
      "x2": 16.302,
      "y2": 11.124
    },
    {
      "n": "Broad Street",
      "x1": 12.032,
      "y1": 11.535,
      "x2": 11.204,
      "y2": 11.111
    },
    {
      "n": "Marshall Street",
      "x1": 10.837,
      "y1": 11.924,
      "x2": 11.204,
      "y2": 11.111
    },
    {
      "n": "Black Lion Court",
      "x1": 15.452,
      "y1": 10.967,
      "x2": 15.836,
      "y2": 11.243
    },
    {
      "n": "Berwick Street",
      "x1": 15.356,
      "y1": 11.147,
      "x2": 15.452,
      "y2": 10.967
    },
    {
      "n": "Old Compton Street",
      "x1": 18.46,
      "y1": 10.936,
      "x2": 18.808,
      "y2": 11.154
    },
    {
      "n": "Old Compton Street",
      "x1": 18.808,
      "y1": 11.154,
      "x2": 19.416,
      "y2": 11.539
    },
    {
      "n": "Dean Street",
      "x1": 18.151,
      "y1": 11.636,
      "x2": 18.46,
      "y2": 10.936
    },
    {
      "n": "Market Place",
      "x1": 7.926,
      "y1": 17.67,
      "x2": 7.882,
      "y2": 17.85
    },
    {
      "n": "Market Place",
      "x1": 7.882,
      "y1": 17.85,
      "x2": 8.657,
      "y2": 18.089
    },
    {
      "n": "Frith Street",
      "x1": 19.416,
      "y1": 11.539,
      "x2": 19.708,
      "y2": 10.902
    },
    {
      "n": "Pulteney Court (I)",
      "x1": 13.127,
      "y1": 10.853,
      "x2": 13.86,
      "y2": 11.284
    },
    {
      "n": "Cambridge Street",
      "x1": 12.653,
      "y1": 11.838,
      "x2": 12.792,
      "y2": 11.512
    },
    {
      "n": "Cambridge Street",
      "x1": 12.792,
      "y1": 11.512,
      "x2": 13.074,
      "y2": 10.959
    },
    {
      "n": "Cambridge Street",
      "x1": 13.074,
      "y1": 10.959,
      "x2": 13.127,
      "y2": 10.853
    },
    {
      "n": "Maidenhead Court",
      "x1": 15.356,
      "y1": 11.147,
      "x2": 14.826,
      "y2": 10.851
    },
    {
      "n": "Hopkins Street",
      "x1": 14.417,
      "y1": 11.536,
      "x2": 14.688,
      "y2": 11.089
    },
    {
      "n": "Hopkins Street",
      "x1": 14.688,
      "y1": 11.089,
      "x2": 14.826,
      "y2": 10.851
    },
    {
      "n": "Cross Street",
      "x1": 9.351,
      "y1": 10.825,
      "x2": 9.839,
      "y2": 11.218
    },
    {
      "n": "George Place (?)",
      "x1": 9.351,
      "y1": 10.825,
      "x2": 9.046,
      "y2": 11.271
    },
    {
      "n": "Marlborough Row",
      "x1": 10.321,
      "y1": 11.583,
      "x2": 10.77,
      "y2": 10.772
    },
    {
      "n": "Oxford Street",
      "x1": 16.113,
      "y1": 17.645,
      "x2": 17.174,
      "y2": 17.866
    },
    {
      "n": "Maddox Street",
      "x1": 5.372,
      "y1": 10.687,
      "x2": 5.866,
      "y2": 11.328
    },
    {
      "n": "Masons Arms Yard",
      "x1": 4.931,
      "y1": 11.509,
      "x2": 5.063,
      "y2": 10.877
    },
    {
      "n": "Masons Arms Yard",
      "x1": 5.063,
      "y1": 10.877,
      "x2": 5.372,
      "y2": 10.687
    },
    {
      "n": "Peter Street",
      "x1": 15.64,
      "y1": 10.645,
      "x2": 16.302,
      "y2": 11.124
    },
    {
      "n": "Berwick Street",
      "x1": 15.452,
      "y1": 10.967,
      "x2": 15.64,
      "y2": 10.645
    },
    {
      "n": "Peter Street",
      "x1": 15.64,
      "y1": 10.645,
      "x2": 15.597,
      "y2": 10.617
    },
    {
      "n": "Marlborough Row",
      "x1": 10.77,
      "y1": 10.772,
      "x2": 10.865,
      "y2": 10.599
    },
    {
      "n": "Silver Street",
      "x1": 12.641,
      "y1": 10.564,
      "x2": 13.127,
      "y2": 10.853
    },
    {
      "n": "Cross Street",
      "x1": 8.982,
      "y1": 10.534,
      "x2": 9.351,
      "y2": 10.825
    },
    {
      "n": "King Street (I)",
      "x1": 8.083,
      "y1": 11.64,
      "x2": 8.982,
      "y2": 10.534
    },
    {
      "n": "New Street/Husband Street",
      "x1": 14.826,
      "y1": 10.851,
      "x2": 14.243,
      "y2": 10.525
    },
    {
      "n": "New Street/Husband Street",
      "x1": 14.243,
      "y1": 10.525,
      "x2": 13.893,
      "y2": 11.22
    },
    {
      "n": "Perrys Place",
      "x1": 16.113,
      "y1": 17.645,
      "x2": 15.895,
      "y2": 18.333
    },
    {
      "n": "Perrys Place",
      "x1": 15.895,
      "y1": 18.333,
      "x2": 15.507,
      "y2": 18.242
    },
    {
      "n": "Perrys Place",
      "x1": 15.507,
      "y1": 18.242,
      "x2": 15.387,
      "y2": 18.339
    },
    {
      "n": "Perrys Place",
      "x1": 15.387,
      "y1": 18.339,
      "x2": 15.317,
      "y2": 18.517
    },
    {
      "n": "Carnaby Court",
      "x1": 10.351,
      "y1": 10.469,
      "x2": 10.77,
      "y2": 10.772
    },
    {
      "n": "Carnaby Street",
      "x1": 9.839,
      "y1": 11.218,
      "x2": 10.351,
      "y2": 10.469
    },
    {
      "n": "Silver Street",
      "x1": 12.459,
      "y1": 10.457,
      "x2": 12.641,
      "y2": 10.564
    },
    {
      "n": "Tent Court",
      "x1": 12.251,
      "y1": 10.854,
      "x2": 12.459,
      "y2": 10.457
    },
    {
      "n": "Peter Street",
      "x1": 15.167,
      "y1": 10.33,
      "x2": 15.597,
      "y2": 10.617
    },
    {
      "n": "Hopkins Street",
      "x1": 14.826,
      "y1": 10.851,
      "x2": 14.971,
      "y2": 10.593
    },
    {
      "n": "Hopkins Street",
      "x1": 14.971,
      "y1": 10.593,
      "x2": 15.167,
      "y2": 10.33
    },
    {
      "n": "Maddox Street",
      "x1": 5.09,
      "y1": 10.322,
      "x2": 5.372,
      "y2": 10.687
    },
    {
      "n": "Little Dean Street",
      "x1": 16.648,
      "y1": 10.299,
      "x2": 16.928,
      "y2": 10.552
    },
    {
      "n": "Little Dean Street",
      "x1": 16.928,
      "y1": 10.552,
      "x2": 17.11,
      "y2": 10.697
    },
    {
      "n": "Little Dean Street",
      "x1": 17.11,
      "y1": 10.697,
      "x2": 17.269,
      "y2": 10.873
    },
    {
      "n": "Little Dean Street",
      "x1": 17.269,
      "y1": 10.873,
      "x2": 17.45,
      "y2": 11.109
    },
    {
      "n": "Little Dean Street",
      "x1": 17.45,
      "y1": 11.109,
      "x2": 17.828,
      "y2": 11.39
    },
    {
      "n": "Little Dean Street",
      "x1": 17.828,
      "y1": 11.39,
      "x2": 18.151,
      "y2": 11.636
    },
    {
      "n": "Wardour Street",
      "x1": 16.302,
      "y1": 11.124,
      "x2": 16.444,
      "y2": 10.75
    },
    {
      "n": "Wardour Street",
      "x1": 16.444,
      "y1": 10.75,
      "x2": 16.648,
      "y2": 10.299
    },
    {
      "n": "Peter Street",
      "x1": 15.167,
      "y1": 10.33,
      "x2": 15.066,
      "y2": 10.267
    },
    {
      "n": "Margaret Street",
      "x1": 3.733,
      "y1": 17.621,
      "x2": 5.098,
      "y2": 18.053
    },
    {
      "n": "Silver Street",
      "x1": 12.105,
      "y1": 10.247,
      "x2": 12.459,
      "y2": 10.457
    },
    {
      "n": "Church Street",
      "x1": 18.771,
      "y1": 10.23,
      "x2": 19.71,
      "y2": 10.822
    },
    {
      "n": "Dean Street",
      "x1": 18.46,
      "y1": 10.936,
      "x2": 18.551,
      "y2": 10.728
    },
    {
      "n": "Dean Street",
      "x1": 18.551,
      "y1": 10.728,
      "x2": 18.771,
      "y2": 10.23
    },
    {
      "n": "Maddox Street",
      "x1": 5.09,
      "y1": 10.322,
      "x2": 5.069,
      "y2": 10.41
    },
    {
      "n": "Maddox Street",
      "x1": 5.069,
      "y1": 10.41,
      "x2": 4.308,
      "y2": 10.204
    },
    {
      "n": "George Street",
      "x1": 4.308,
      "y1": 10.204,
      "x2": 3.744,
      "y2": 12.013
    },
    {
      "n": "George Street",
      "x1": 3.744,
      "y1": 12.013,
      "x2": 4.25,
      "y2": 12.305
    },
    {
      "n": "Silver Street",
      "x1": 11.828,
      "y1": 10.062,
      "x2": 12.105,
      "y2": 10.247
    },
    {
      "n": "Marshall Street",
      "x1": 11.204,
      "y1": 11.111,
      "x2": 11.56,
      "y2": 10.459
    },
    {
      "n": "Marshall Street",
      "x1": 11.56,
      "y1": 10.459,
      "x2": 11.828,
      "y2": 10.062
    },
    {
      "n": "Greens Court",
      "x1": 15.066,
      "y1": 10.267,
      "x2": 15.225,
      "y2": 10.059
    },
    {
      "n": "Wardour Street",
      "x1": 16.648,
      "y1": 10.299,
      "x2": 16.946,
      "y2": 10.039
    },
    {
      "n": "Regent Street",
      "x1": 7.459,
      "y1": 11.187,
      "x2": 8.135,
      "y2": 10.015
    },
    {
      "n": "Great Castle Street",
      "x1": 7.625,
      "y1": 17.582,
      "x2": 7.926,
      "y2": 17.67
    },
    {
      "n": "Old Compton Street",
      "x1": 17.028,
      "y1": 9.955,
      "x2": 17.229,
      "y2": 10.125
    },
    {
      "n": "Old Compton Street",
      "x1": 17.229,
      "y1": 10.125,
      "x2": 17.643,
      "y2": 10.424
    },
    {
      "n": "Old Compton Street",
      "x1": 17.643,
      "y1": 10.424,
      "x2": 18.46,
      "y2": 10.936
    },
    {
      "n": "Wardour Street",
      "x1": 16.946,
      "y1": 10.039,
      "x2": 17.028,
      "y2": 9.955
    },
    {
      "n": "Peter Street",
      "x1": 15.066,
      "y1": 10.267,
      "x2": 14.532,
      "y2": 9.938
    },
    {
      "n": "Maddox Street",
      "x1": 4.308,
      "y1": 10.204,
      "x2": 3.548,
      "y2": 9.883
    },
    {
      "n": "Little Pulteney Street",
      "x1": 16.021,
      "y1": 9.828,
      "x2": 16.648,
      "y2": 10.299
    },
    {
      "n": "Walkers Court",
      "x1": 15.597,
      "y1": 10.617,
      "x2": 16.021,
      "y2": 9.828
    },
    {
      "n": "King Street (I)",
      "x1": 8.982,
      "y1": 10.534,
      "x2": 9.563,
      "y2": 9.813
    },
    {
      "n": "Silver Street",
      "x1": 11.828,
      "y1": 10.062,
      "x2": 11.489,
      "y2": 9.81
    },
    {
      "n": "Margaret Court",
      "x1": 7.364,
      "y1": 18.499,
      "x2": 7.625,
      "y2": 17.582
    },
    {
      "n": "Pulteney Court (II)",
      "x1": 15.225,
      "y1": 10.059,
      "x2": 14.846,
      "y2": 9.784
    },
    {
      "n": "Wardour Street",
      "x1": 17.028,
      "y1": 9.955,
      "x2": 17.217,
      "y2": 9.726
    },
    {
      "n": "Little Pulteney Street",
      "x1": 15.785,
      "y1": 9.657,
      "x2": 16.021,
      "y2": 9.828
    },
    {
      "n": "Unknown-B",
      "x1": 15.785,
      "y1": 9.657,
      "x2": 15.546,
      "y2": 10.027
    },
    {
      "n": "King Street (II)",
      "x1": 19.065,
      "y1": 9.562,
      "x2": 19.734,
      "y2": 9.968
    },
    {
      "n": "Dean Street",
      "x1": 18.771,
      "y1": 10.23,
      "x2": 19.065,
      "y2": 9.562
    },
    {
      "n": "Little Pulteney Street",
      "x1": 15.603,
      "y1": 9.508,
      "x2": 15.721,
      "y2": 9.61
    },
    {
      "n": "Little Pulteney Street",
      "x1": 15.721,
      "y1": 9.61,
      "x2": 15.785,
      "y2": 9.657
    },
    {
      "n": "Greens Court",
      "x1": 15.225,
      "y1": 10.059,
      "x2": 15.603,
      "y2": 9.508
    },
    {
      "n": "Conduit Street",
      "x1": 6.053,
      "y1": 9.49,
      "x2": 7.396,
      "y2": 11.296
    },
    {
      "n": "Mill Street",
      "x1": 6.053,
      "y1": 9.49,
      "x2": 5.26,
      "y2": 10.098
    },
    {
      "n": "Mill Street",
      "x1": 5.26,
      "y1": 10.098,
      "x2": 5.105,
      "y2": 10.259
    },
    {
      "n": "Mill Street",
      "x1": 5.105,
      "y1": 10.259,
      "x2": 5.09,
      "y2": 10.322
    },
    {
      "n": "Margaret Street",
      "x1": 3.406,
      "y1": 17.536,
      "x2": 3.733,
      "y2": 17.621
    },
    {
      "n": "Silver Street",
      "x1": 11.489,
      "y1": 9.81,
      "x2": 11.032,
      "y2": 9.471
    },
    {
      "n": "Carnaby Street",
      "x1": 10.351,
      "y1": 10.469,
      "x2": 11.032,
      "y2": 9.471
    },
    {
      "n": "Little Crown Court",
      "x1": 16.317,
      "y1": 9.469,
      "x2": 16.946,
      "y2": 10.039
    },
    {
      "n": "Great Crown Court",
      "x1": 16.021,
      "y1": 9.828,
      "x2": 16.317,
      "y2": 9.469
    },
    {
      "n": "Little Pulteney Street",
      "x1": 15.362,
      "y1": 9.302,
      "x2": 15.603,
      "y2": 9.508
    },
    {
      "n": "Old Burlington Mews",
      "x1": 8.135,
      "y1": 10.015,
      "x2": 6.772,
      "y2": 9.173
    },
    {
      "n": "Chapel Place",
      "x1": 8.627,
      "y1": 9.163,
      "x2": 9.563,
      "y2": 9.813
    },
    {
      "n": "Regent Street",
      "x1": 8.135,
      "y1": 10.015,
      "x2": 8.627,
      "y2": 9.163
    },
    {
      "n": "Silver Street",
      "x1": 11.032,
      "y1": 9.471,
      "x2": 10.616,
      "y2": 9.159
    },
    {
      "n": "Naylors Yard",
      "x1": 10.616,
      "y1": 9.159,
      "x2": 9.663,
      "y2": 10.411
    },
    {
      "n": "Macclesfield Street",
      "x1": 19.065,
      "y1": 9.562,
      "x2": 19.306,
      "y2": 9.09
    },
    {
      "n": "Upper Rupert Street",
      "x1": 17.217,
      "y1": 9.726,
      "x2": 16.552,
      "y2": 9.088
    },
    {
      "n": "Rupert Street",
      "x1": 16.412,
      "y1": 9.285,
      "x2": 16.552,
      "y2": 9.088
    },
    {
      "n": "Regent Street",
      "x1": 8.627,
      "y1": 9.163,
      "x2": 8.702,
      "y2": 9.062
    },
    {
      "n": "Mill Street",
      "x1": 6.545,
      "y1": 9.044,
      "x2": 6.053,
      "y2": 9.49
    },
    {
      "n": "Upper James Street",
      "x1": 12.026,
      "y1": 9.023,
      "x2": 11.489,
      "y2": 9.81
    },
    {
      "n": "Little Pulteney Street",
      "x1": 14.993,
      "y1": 8.988,
      "x2": 15.263,
      "y2": 9.217
    },
    {
      "n": "Little Pulteney Street",
      "x1": 15.263,
      "y1": 9.217,
      "x2": 15.362,
      "y2": 9.302
    },
    {
      "n": "William and Mary Yard",
      "x1": 14.993,
      "y1": 8.988,
      "x2": 14.678,
      "y2": 9.38
    },
    {
      "n": "William and Mary Yard",
      "x1": 14.678,
      "y1": 9.38,
      "x2": 14.462,
      "y2": 9.646
    },
    {
      "n": "William and Mary Yard",
      "x1": 14.462,
      "y1": 9.646,
      "x2": 14.02,
      "y2": 10.426
    },
    {
      "n": "Silver Street",
      "x1": 10.616,
      "y1": 9.159,
      "x2": 10.288,
      "y2": 8.913
    },
    {
      "n": "King Street (I)",
      "x1": 9.563,
      "y1": 9.813,
      "x2": 10.288,
      "y2": 8.913
    },
    {
      "n": "Oxford Street",
      "x1": 15.6,
      "y1": 17.525,
      "x2": 16.113,
      "y2": 17.645
    },
    {
      "n": "Great Crown Court",
      "x1": 16.317,
      "y1": 9.469,
      "x2": 15.733,
      "y2": 8.885
    },
    {
      "n": "Great Crown Court",
      "x1": 15.733,
      "y1": 8.885,
      "x2": 15.362,
      "y2": 9.302
    },
    {
      "n": "Little Pulteney Street",
      "x1": 14.731,
      "y1": 8.75,
      "x2": 14.878,
      "y2": 8.891
    },
    {
      "n": "Little Pulteney Street",
      "x1": 14.878,
      "y1": 8.891,
      "x2": 14.993,
      "y2": 8.988
    },
    {
      "n": "King Street (II)",
      "x1": 19.065,
      "y1": 9.562,
      "x2": 17.906,
      "y2": 8.722
    },
    {
      "n": "Wardour Street",
      "x1": 17.217,
      "y1": 9.726,
      "x2": 17.906,
      "y2": 8.722
    },
    {
      "n": "Little Pulteney Street",
      "x1": 14.685,
      "y1": 8.706,
      "x2": 14.731,
      "y2": 8.75
    },
    {
      "n": "Little Windmill Street",
      "x1": 13.127,
      "y1": 10.853,
      "x2": 13.16,
      "y2": 10.787
    },
    {
      "n": "Little Windmill Street",
      "x1": 13.16,
      "y1": 10.787,
      "x2": 13.789,
      "y2": 9.86
    },
    {
      "n": "Little Windmill Street",
      "x1": 13.789,
      "y1": 9.86,
      "x2": 14.289,
      "y2": 9.192
    },
    {
      "n": "Little Windmill Street",
      "x1": 14.289,
      "y1": 9.192,
      "x2": 14.685,
      "y2": 8.706
    },
    {
      "n": "Rupert Street",
      "x1": 16.552,
      "y1": 9.088,
      "x2": 16.759,
      "y2": 8.699
    },
    {
      "n": "Silver Street",
      "x1": 10.288,
      "y1": 8.913,
      "x2": 9.883,
      "y2": 8.598
    },
    {
      "n": "Rupert Street",
      "x1": 16.759,
      "y1": 8.699,
      "x2": 16.886,
      "y2": 8.459
    },
    {
      "n": "Oxford Street",
      "x1": 14.97,
      "y1": 17.415,
      "x2": 15.6,
      "y2": 17.525
    },
    {
      "n": "Golden Square",
      "x1": 11.149,
      "y1": 8.377,
      "x2": 12.026,
      "y2": 9.023
    },
    {
      "n": "Upper John Street",
      "x1": 11.149,
      "y1": 8.377,
      "x2": 10.616,
      "y2": 9.159
    },
    {
      "n": "Queens Head Court",
      "x1": 15.733,
      "y1": 8.885,
      "x2": 15.682,
      "y2": 8.79
    },
    {
      "n": "Queens Head Court",
      "x1": 15.682,
      "y1": 8.79,
      "x2": 15.642,
      "y2": 8.753
    },
    {
      "n": "Queens Head Court",
      "x1": 15.642,
      "y1": 8.753,
      "x2": 15.493,
      "y2": 8.642
    },
    {
      "n": "Queens Head Court",
      "x1": 15.493,
      "y1": 8.642,
      "x2": 15.389,
      "y2": 8.543
    },
    {
      "n": "Queens Head Court",
      "x1": 15.389,
      "y1": 8.543,
      "x2": 15.11,
      "y2": 8.318
    },
    {
      "n": "Great Windmill Street",
      "x1": 14.731,
      "y1": 8.75,
      "x2": 15.11,
      "y2": 8.318
    },
    {
      "n": "George Yard",
      "x1": 18.112,
      "y1": 8.28,
      "x2": 18.409,
      "y2": 8.48
    },
    {
      "n": "George Yard",
      "x1": 18.409,
      "y1": 8.48,
      "x2": 18.695,
      "y2": 8.692
    },
    {
      "n": "George Yard",
      "x1": 18.695,
      "y1": 8.692,
      "x2": 18.9,
      "y2": 8.842
    },
    {
      "n": "George Yard",
      "x1": 18.9,
      "y1": 8.842,
      "x2": 19.306,
      "y2": 9.09
    },
    {
      "n": "Princes Street (III)",
      "x1": 17.906,
      "y1": 8.722,
      "x2": 18.112,
      "y2": 8.28
    },
    {
      "n": "Beak Street",
      "x1": 9.883,
      "y1": 8.598,
      "x2": 9.726,
      "y2": 8.475
    },
    {
      "n": "Beak Street",
      "x1": 9.726,
      "y1": 8.475,
      "x2": 9.164,
      "y2": 8.228
    },
    {
      "n": "Regent Street",
      "x1": 8.702,
      "y1": 9.062,
      "x2": 9.067,
      "y2": 8.4
    },
    {
      "n": "Regent Street",
      "x1": 9.067,
      "y1": 8.4,
      "x2": 9.164,
      "y2": 8.228
    },
    {
      "n": "Plough Yard",
      "x1": 16.886,
      "y1": 8.459,
      "x2": 16.503,
      "y2": 8.204
    },
    {
      "n": "Great Windmill Street",
      "x1": 15.11,
      "y1": 8.318,
      "x2": 15.201,
      "y2": 8.202
    },
    {
      "n": "Newman Street",
      "x1": 14.97,
      "y1": 17.415,
      "x2": 14.462,
      "y2": 18.655
    },
    {
      "n": "Brewer Street",
      "x1": 14.137,
      "y1": 8.187,
      "x2": 14.415,
      "y2": 8.446
    },
    {
      "n": "Brewer Street",
      "x1": 14.415,
      "y1": 8.446,
      "x2": 14.685,
      "y2": 8.706
    },
    {
      "n": "Great Pulteney Street",
      "x1": 12.641,
      "y1": 10.564,
      "x2": 13.395,
      "y2": 9.189
    },
    {
      "n": "Great Pulteney Street",
      "x1": 13.395,
      "y1": 9.189,
      "x2": 13.785,
      "y2": 8.645
    },
    {
      "n": "Great Pulteney Street",
      "x1": 13.785,
      "y1": 8.645,
      "x2": 14.137,
      "y2": 8.187
    },
    {
      "n": "Golden Square",
      "x1": 12.653,
      "y1": 8.105,
      "x2": 12.026,
      "y2": 9.023
    },
    {
      "n": "Conduit Street",
      "x1": 5.022,
      "y1": 8.104,
      "x2": 6.053,
      "y2": 9.49
    },
    {
      "n": "George Street",
      "x1": 5.022,
      "y1": 8.104,
      "x2": 4.308,
      "y2": 10.204
    },
    {
      "n": "Richmond Street",
      "x1": 17.081,
      "y1": 8.092,
      "x2": 17.906,
      "y2": 8.722
    },
    {
      "n": "Rupert Street",
      "x1": 16.886,
      "y1": 8.459,
      "x2": 17.081,
      "y2": 8.092
    },
    {
      "n": "Regent Street",
      "x1": 9.164,
      "y1": 8.228,
      "x2": 9.248,
      "y2": 8.087
    },
    {
      "n": "New Burlington Street",
      "x1": 7.043,
      "y1": 7.998,
      "x2": 8.702,
      "y2": 9.062
    },
    {
      "n": "Great Castle Street",
      "x1": 6.994,
      "y1": 17.399,
      "x2": 7.625,
      "y2": 17.582
    },
    {
      "n": "New Burlington Mews",
      "x1": 9.019,
      "y1": 7.981,
      "x2": 9.248,
      "y2": 8.087
    },
    {
      "n": "Regent Street",
      "x1": 9.248,
      "y1": 8.087,
      "x2": 9.364,
      "y2": 7.88
    },
    {
      "n": "Macclesfield Street/Gerrard Street",
      "x1": 18.328,
      "y1": 7.818,
      "x2": 19.555,
      "y2": 8.61
    },
    {
      "n": "Macclesfield Street/Gerrard Street",
      "x1": 19.555,
      "y1": 8.61,
      "x2": 19.306,
      "y2": 9.09
    },
    {
      "n": "Princes Street (III)",
      "x1": 18.112,
      "y1": 8.28,
      "x2": 18.328,
      "y2": 7.818
    },
    {
      "n": "Boyle Street",
      "x1": 7.043,
      "y1": 7.998,
      "x2": 6.886,
      "y2": 8.261
    },
    {
      "n": "Boyle Street",
      "x1": 6.886,
      "y1": 8.261,
      "x2": 6.185,
      "y2": 7.799
    },
    {
      "n": "Archer Street",
      "x1": 15.527,
      "y1": 7.785,
      "x2": 16.759,
      "y2": 8.699
    },
    {
      "n": "Great Windmill Street",
      "x1": 15.201,
      "y1": 8.202,
      "x2": 15.527,
      "y2": 7.785
    },
    {
      "n": "Brewer Street",
      "x1": 13.674,
      "y1": 7.755,
      "x2": 14.137,
      "y2": 8.187
    },
    {
      "n": "Bridle Street",
      "x1": 12.105,
      "y1": 10.247,
      "x2": 12.739,
      "y2": 9.015
    },
    {
      "n": "Bridle Street",
      "x1": 12.739,
      "y1": 9.015,
      "x2": 13.674,
      "y2": 7.755
    },
    {
      "n": "Great Windmill Street",
      "x1": 15.527,
      "y1": 7.785,
      "x2": 15.561,
      "y2": 7.744
    },
    {
      "n": "John Street",
      "x1": 6.994,
      "y1": 17.399,
      "x2": 6.703,
      "y2": 18.485
    },
    {
      "n": "Ham Yard",
      "x1": 15.319,
      "y1": 7.527,
      "x2": 15.274,
      "y2": 7.579
    },
    {
      "n": "Ham Yard",
      "x1": 15.274,
      "y1": 7.579,
      "x2": 15.561,
      "y2": 7.744
    },
    {
      "n": "New Burlington Mews",
      "x1": 8.207,
      "y1": 7.521,
      "x2": 9.019,
      "y2": 7.981
    },
    {
      "n": "Smiths Court/Yard",
      "x1": 14.165,
      "y1": 7.515,
      "x2": 14.425,
      "y2": 7.8
    },
    {
      "n": "Smiths Court/Yard",
      "x1": 14.425,
      "y1": 7.8,
      "x2": 14.56,
      "y2": 7.655
    },
    {
      "n": "Smiths Court/Yard",
      "x1": 14.56,
      "y1": 7.655,
      "x2": 15.201,
      "y2": 8.202
    },
    {
      "n": "Ham Yard",
      "x1": 14.962,
      "y1": 7.507,
      "x2": 15.264,
      "y2": 7.761
    },
    {
      "n": "Ham Yard",
      "x1": 15.095,
      "y1": 7.912,
      "x2": 14.835,
      "y2": 7.653
    },
    {
      "n": "Ham Yard",
      "x1": 14.835,
      "y1": 7.653,
      "x2": 14.962,
      "y2": 7.507
    },
    {
      "n": "Princes Street (III)",
      "x1": 18.328,
      "y1": 7.818,
      "x2": 18.506,
      "y2": 7.472
    },
    {
      "n": "Heddon Court",
      "x1": 8.592,
      "y1": 7.471,
      "x2": 9.364,
      "y2": 7.88
    },
    {
      "n": "Golden Square",
      "x1": 11.789,
      "y1": 7.438,
      "x2": 12.653,
      "y2": 8.105
    },
    {
      "n": "Golden Square",
      "x1": 11.789,
      "y1": 7.438,
      "x2": 11.149,
      "y2": 8.377
    },
    {
      "n": "Lisle Street",
      "x1": 19.296,
      "y1": 7.437,
      "x2": 19.797,
      "y2": 7.741
    },
    {
      "n": "Warwick Street",
      "x1": 9.883,
      "y1": 8.598,
      "x2": 10.639,
      "y2": 7.406
    },
    {
      "n": "Ham Yard",
      "x1": 15.102,
      "y1": 7.328,
      "x2": 15.319,
      "y2": 7.527
    },
    {
      "n": "Ham Yard",
      "x1": 14.962,
      "y1": 7.507,
      "x2": 15.102,
      "y2": 7.328
    },
    {
      "n": "Brewer Street",
      "x1": 13.194,
      "y1": 7.312,
      "x2": 13.486,
      "y2": 7.58
    },
    {
      "n": "Brewer Street",
      "x1": 13.486,
      "y1": 7.58,
      "x2": 13.674,
      "y2": 7.755
    },
    {
      "n": "Lower James Street",
      "x1": 13.194,
      "y1": 7.312,
      "x2": 12.653,
      "y2": 8.105
    },
    {
      "n": "Ham Yard",
      "x1": 15.319,
      "y1": 7.527,
      "x2": 15.496,
      "y2": 7.312
    },
    {
      "n": "Heddon Court",
      "x1": 8.238,
      "y1": 7.225,
      "x2": 8.592,
      "y2": 7.471
    },
    {
      "n": "Lower John Street",
      "x1": 12.039,
      "y1": 7.088,
      "x2": 11.789,
      "y2": 7.438
    },
    {
      "n": "George Court (II)",
      "x1": 17.576,
      "y1": 7.072,
      "x2": 18.506,
      "y2": 7.472
    },
    {
      "n": "Oxford Street",
      "x1": 14.159,
      "y1": 17.262,
      "x2": 14.783,
      "y2": 17.382
    },
    {
      "n": "Oxford Street",
      "x1": 14.783,
      "y1": 17.382,
      "x2": 14.97,
      "y2": 17.415
    },
    {
      "n": "Rupert Street",
      "x1": 17.081,
      "y1": 8.092,
      "x2": 17.371,
      "y2": 7.468
    },
    {
      "n": "Rupert Street",
      "x1": 17.371,
      "y1": 7.468,
      "x2": 17.576,
      "y2": 7.072
    },
    {
      "n": "Conduit Street",
      "x1": 4.253,
      "y1": 7.069,
      "x2": 5.022,
      "y2": 8.104
    },
    {
      "n": "New Bond Street",
      "x1": 4.253,
      "y1": 7.069,
      "x2": 3.581,
      "y2": 8.069
    },
    {
      "n": "Lisle Street",
      "x1": 18.68,
      "y1": 7.063,
      "x2": 19.296,
      "y2": 7.437
    },
    {
      "n": "Princes Street (III)",
      "x1": 18.506,
      "y1": 7.472,
      "x2": 18.68,
      "y2": 7.063
    },
    {
      "n": "Coach & Horses Yard",
      "x1": 6.185,
      "y1": 7.799,
      "x2": 5.666,
      "y2": 7.415
    },
    {
      "n": "Coach & Horses Yard",
      "x1": 5.666,
      "y1": 7.415,
      "x2": 5.597,
      "y2": 7.339
    },
    {
      "n": "Coach & Horses Yard",
      "x1": 5.597,
      "y1": 7.339,
      "x2": 5.61,
      "y2": 7.246
    },
    {
      "n": "Coach & Horses Yard",
      "x1": 5.61,
      "y1": 7.246,
      "x2": 5.588,
      "y2": 7.2
    },
    {
      "n": "Coach & Horses Yard",
      "x1": 5.588,
      "y1": 7.2,
      "x2": 5.36,
      "y2": 7.04
    },
    {
      "n": "Great Windmill Street",
      "x1": 15.561,
      "y1": 7.744,
      "x2": 15.7,
      "y2": 7.394
    },
    {
      "n": "Great Windmill Street",
      "x1": 15.7,
      "y1": 7.394,
      "x2": 15.864,
      "y2": 7.007
    },
    {
      "n": "Leicester Street (I)",
      "x1": 10.639,
      "y1": 7.406,
      "x2": 9.874,
      "y2": 6.963
    },
    {
      "n": "Regent Street",
      "x1": 9.364,
      "y1": 7.88,
      "x2": 9.874,
      "y2": 6.963
    },
    {
      "n": "Old Burlington Street",
      "x1": 6.73,
      "y1": 6.961,
      "x2": 6.185,
      "y2": 7.799
    },
    {
      "n": "Market Place",
      "x1": 8.824,
      "y1": 17.196,
      "x2": 8.876,
      "y2": 17.326
    },
    {
      "n": "Market Place",
      "x1": 8.876,
      "y1": 17.326,
      "x2": 8.772,
      "y2": 17.915
    },
    {
      "n": "Bull Yard",
      "x1": 15.864,
      "y1": 7.007,
      "x2": 15.446,
      "y2": 6.927
    },
    {
      "n": "Bull Yard",
      "x1": 15.446,
      "y1": 6.927,
      "x2": 15.317,
      "y2": 7.102
    },
    {
      "n": "Orchard Place",
      "x1": 13.544,
      "y1": 6.859,
      "x2": 13.935,
      "y2": 7.189
    },
    {
      "n": "Sherrard Street",
      "x1": 13.544,
      "y1": 6.859,
      "x2": 13.194,
      "y2": 7.312
    },
    {
      "n": "Golden Place",
      "x1": 11.533,
      "y1": 6.987,
      "x2": 11.661,
      "y2": 6.81
    },
    {
      "n": "Golden Place",
      "x1": 11.661,
      "y1": 6.81,
      "x2": 12.039,
      "y2": 7.088
    },
    {
      "n": "Catherine Wheel Yard",
      "x1": 15.936,
      "y1": 6.782,
      "x2": 16.301,
      "y2": 7.006
    },
    {
      "n": "Catherine Wheel Yard",
      "x1": 16.301,
      "y1": 7.006,
      "x2": 16.822,
      "y2": 7.325
    },
    {
      "n": "Great Windmill Street",
      "x1": 15.864,
      "y1": 7.007,
      "x2": 15.936,
      "y2": 6.782
    },
    {
      "n": "Bruton Street",
      "x1": 4.253,
      "y1": 7.069,
      "x2": 3.608,
      "y2": 6.626
    },
    {
      "n": "Great Windmill Street",
      "x1": 15.936,
      "y1": 6.782,
      "x2": 15.977,
      "y2": 6.653
    },
    {
      "n": "Great Windmill Street",
      "x1": 15.977,
      "y1": 6.653,
      "x2": 16.001,
      "y2": 6.598
    },
    {
      "n": "Brewer Street",
      "x1": 12.384,
      "y1": 6.571,
      "x2": 12.716,
      "y2": 6.874
    },
    {
      "n": "Brewer Street",
      "x1": 12.716,
      "y1": 6.874,
      "x2": 13.194,
      "y2": 7.312
    },
    {
      "n": "Falconberg Court",
      "x1": 19.353,
      "y1": 17.184,
      "x2": 19.527,
      "y2": 17.264
    },
    {
      "n": "Lower John Street",
      "x1": 12.384,
      "y1": 6.571,
      "x2": 12.039,
      "y2": 7.088
    },
    {
      "n": "Leicester Street (I)",
      "x1": 9.874,
      "y1": 6.963,
      "x2": 9.17,
      "y2": 6.477
    },
    {
      "n": "Heddon Street",
      "x1": 9.17,
      "y1": 6.477,
      "x2": 8.592,
      "y2": 7.471
    },
    {
      "n": "Queen Street (III)",
      "x1": 16.001,
      "y1": 6.598,
      "x2": 14.981,
      "y2": 6.473
    },
    {
      "n": "Wellington Mews",
      "x1": 14.055,
      "y1": 6.835,
      "x2": 14.585,
      "y2": 7.26
    },
    {
      "n": "Wellington Mews",
      "x1": 14.585,
      "y1": 7.26,
      "x2": 14.754,
      "y2": 7.066
    },
    {
      "n": "Wellington Mews",
      "x1": 14.754,
      "y1": 7.066,
      "x2": 14.83,
      "y2": 7.03
    },
    {
      "n": "Wellington Mews",
      "x1": 14.83,
      "y1": 7.03,
      "x2": 14.928,
      "y2": 6.912
    },
    {
      "n": "Wellington Mews",
      "x1": 14.928,
      "y1": 6.912,
      "x2": 14.981,
      "y2": 6.473
    },
    {
      "n": "Leicester Street (II)",
      "x1": 19.296,
      "y1": 7.437,
      "x2": 19.833,
      "y2": 6.47
    },
    {
      "n": "Clifford Street",
      "x1": 5.855,
      "y1": 6.45,
      "x2": 6.73,
      "y2": 6.961
    },
    {
      "n": "Regent Street",
      "x1": 9.874,
      "y1": 6.963,
      "x2": 10.199,
      "y2": 6.38
    },
    {
      "n": "Leicester Street (I)",
      "x1": 9.17,
      "y1": 6.477,
      "x2": 8.98,
      "y2": 6.369
    },
    {
      "n": "Falconberg Mews",
      "x1": 18.508,
      "y1": 17.328,
      "x2": 19.184,
      "y2": 17.562
    },
    {
      "n": "Falconberg Mews",
      "x1": 19.184,
      "y1": 17.562,
      "x2": 19.353,
      "y2": 17.184
    },
    {
      "n": "Queen Street (III)",
      "x1": 13.955,
      "y1": 6.327,
      "x2": 14.981,
      "y2": 6.473
    },
    {
      "n": "Sherrard Street",
      "x1": 13.955,
      "y1": 6.327,
      "x2": 13.544,
      "y2": 6.859
    },
    {
      "n": "Leicester Street (I)",
      "x1": 8.98,
      "y1": 6.369,
      "x2": 8.905,
      "y2": 6.317
    },
    {
      "n": "Unknown-A1",
      "x1": 9.976,
      "y1": 6.252,
      "x2": 10.199,
      "y2": 6.38
    },
    {
      "n": "Sidney Alley",
      "x1": 19.833,
      "y1": 6.47,
      "x2": 19.07,
      "y2": 6.095
    },
    {
      "n": "Princes Street (III)",
      "x1": 18.68,
      "y1": 7.063,
      "x2": 18.924,
      "y2": 6.541
    },
    {
      "n": "Princes Street (III)",
      "x1": 18.924,
      "y1": 6.541,
      "x2": 19.054,
      "y2": 6.172
    },
    {
      "n": "Princes Street (III)",
      "x1": 19.054,
      "y1": 6.172,
      "x2": 19.07,
      "y2": 6.095
    },
    {
      "n": "Great Windmill Street",
      "x1": 16.001,
      "y1": 6.598,
      "x2": 16.119,
      "y2": 6.325
    },
    {
      "n": "Great Windmill Street",
      "x1": 16.119,
      "y1": 6.325,
      "x2": 16.221,
      "y2": 6.089
    },
    {
      "n": "Unknown-C",
      "x1": 8.98,
      "y1": 6.369,
      "x2": 9.171,
      "y2": 6.072
    },
    {
      "n": "Unknown-A2",
      "x1": 9.606,
      "y1": 6.039,
      "x2": 9.976,
      "y2": 6.252
    },
    {
      "n": "Oxford Street",
      "x1": 13.395,
      "y1": 17.12,
      "x2": 13.816,
      "y2": 17.196
    },
    {
      "n": "Oxford Street",
      "x1": 13.816,
      "y1": 17.196,
      "x2": 14.159,
      "y2": 17.262
    },
    {
      "n": "Angel Court",
      "x1": 15.571,
      "y1": 5.992,
      "x2": 16.221,
      "y2": 6.089
    },
    {
      "n": "Brewer Street",
      "x1": 11.689,
      "y1": 5.933,
      "x2": 12.384,
      "y2": 6.571
    },
    {
      "n": "Warwick Street",
      "x1": 10.639,
      "y1": 7.406,
      "x2": 11.164,
      "y2": 6.572
    },
    {
      "n": "Warwick Street",
      "x1": 11.164,
      "y1": 6.572,
      "x2": 11.689,
      "y2": 5.933
    },
    {
      "n": "Marylebone Street",
      "x1": 11.689,
      "y1": 5.933,
      "x2": 11.545,
      "y2": 5.951
    },
    {
      "n": "Clifford Street",
      "x1": 4.968,
      "y1": 5.923,
      "x2": 5.855,
      "y2": 6.45
    },
    {
      "n": "New Bond Street",
      "x1": 4.968,
      "y1": 5.923,
      "x2": 4.253,
      "y2": 7.069
    },
    {
      "n": "Princes Street (III)",
      "x1": 19.07,
      "y1": 6.095,
      "x2": 19.095,
      "y2": 5.973
    },
    {
      "n": "Princes Street (III)",
      "x1": 19.095,
      "y1": 5.973,
      "x2": 19.099,
      "y2": 5.839
    },
    {
      "n": "Francis Street",
      "x1": 12.625,
      "y1": 5.815,
      "x2": 12.384,
      "y2": 6.571
    },
    {
      "n": "Marylebone Street",
      "x1": 12.625,
      "y1": 5.815,
      "x2": 11.689,
      "y2": 5.933
    },
    {
      "n": "Kings Arms Yard",
      "x1": 12.938,
      "y1": 5.774,
      "x2": 12.953,
      "y2": 6.199
    },
    {
      "n": "Kings Arms Yard",
      "x1": 12.953,
      "y1": 6.199,
      "x2": 13.135,
      "y2": 6.374
    },
    {
      "n": "Berners Street",
      "x1": 13.395,
      "y1": 17.12,
      "x2": 12.794,
      "y2": 18.616
    },
    {
      "n": "Marylebone Street",
      "x1": 12.938,
      "y1": 5.774,
      "x2": 12.835,
      "y2": 5.788
    },
    {
      "n": "Marylebone Street",
      "x1": 12.835,
      "y1": 5.788,
      "x2": 12.625,
      "y2": 5.815
    },
    {
      "n": "North Coventry Street",
      "x1": 19.262,
      "y1": 5.7,
      "x2": 19.846,
      "y2": 6.033
    },
    {
      "n": "Princes Street (III)",
      "x1": 19.099,
      "y1": 5.839,
      "x2": 19.262,
      "y2": 5.7
    },
    {
      "n": "Coventry Street",
      "x1": 19.099,
      "y1": 5.839,
      "x2": 18.325,
      "y2": 5.646
    },
    {
      "n": "Rupert Street",
      "x1": 17.576,
      "y1": 7.072,
      "x2": 17.864,
      "y2": 6.517
    },
    {
      "n": "Rupert Street",
      "x1": 17.864,
      "y1": 6.517,
      "x2": 18.325,
      "y2": 5.646
    },
    {
      "n": "Glasshouse Street",
      "x1": 11.545,
      "y1": 5.951,
      "x2": 10.61,
      "y2": 5.642
    },
    {
      "n": "Regent Street",
      "x1": 10.199,
      "y1": 6.38,
      "x2": 10.61,
      "y2": 5.642
    },
    {
      "n": "Coventry Street",
      "x1": 18.325,
      "y1": 5.646,
      "x2": 18.114,
      "y2": 5.597
    },
    {
      "n": "Sherrard Street",
      "x1": 14.488,
      "y1": 5.57,
      "x2": 14.238,
      "y2": 5.984
    },
    {
      "n": "Sherrard Street",
      "x1": 14.238,
      "y1": 5.984,
      "x2": 13.955,
      "y2": 6.327
    },
    {
      "n": "Marylebone Street",
      "x1": 14.488,
      "y1": 5.57,
      "x2": 12.938,
      "y2": 5.774
    },
    {
      "n": "Adam and Eve Court",
      "x1": 11.525,
      "y1": 17.075,
      "x2": 10.972,
      "y2": 18.574
    },
    {
      "n": "New Bond Street",
      "x1": 5.234,
      "y1": 5.511,
      "x2": 4.968,
      "y2": 5.923
    },
    {
      "n": "Coventry Street",
      "x1": 18.114,
      "y1": 5.597,
      "x2": 17.603,
      "y2": 5.467
    },
    {
      "n": "Arundel Street",
      "x1": 17.603,
      "y1": 5.467,
      "x2": 16.98,
      "y2": 6.703
    },
    {
      "n": "Coventry Street",
      "x1": 17.603,
      "y1": 5.467,
      "x2": 17.482,
      "y2": 5.439
    },
    {
      "n": "Tichborne Street",
      "x1": 14.901,
      "y1": 5.419,
      "x2": 14.589,
      "y2": 5.535
    },
    {
      "n": "Tichborne Street",
      "x1": 14.589,
      "y1": 5.535,
      "x2": 14.488,
      "y2": 5.57
    },
    {
      "n": "Vigo Street",
      "x1": 10.61,
      "y1": 5.642,
      "x2": 9.664,
      "y2": 5.329
    },
    {
      "n": "Coventry Street",
      "x1": 17.482,
      "y1": 5.439,
      "x2": 17.032,
      "y2": 5.325
    },
    {
      "n": "Coventry Street",
      "x1": 17.032,
      "y1": 5.325,
      "x2": 16.893,
      "y2": 5.282
    },
    {
      "n": "Coventry Street",
      "x1": 16.893,
      "y1": 5.282,
      "x2": 16.636,
      "y2": 5.19
    },
    {
      "n": "Great Windmill Street",
      "x1": 16.221,
      "y1": 6.089,
      "x2": 16.26,
      "y2": 6.0
    },
    {
      "n": "Great Windmill Street",
      "x1": 16.26,
      "y1": 6.0,
      "x2": 16.492,
      "y2": 5.542
    },
    {
      "n": "Great Windmill Street",
      "x1": 16.492,
      "y1": 5.542,
      "x2": 16.636,
      "y2": 5.19
    },
    {
      "n": "Princes Street (III)",
      "x1": 19.262,
      "y1": 5.7,
      "x2": 19.549,
      "y2": 5.147
    },
    {
      "n": "Tichborne Street",
      "x1": 16.636,
      "y1": 5.19,
      "x2": 16.509,
      "y2": 5.133
    },
    {
      "n": "Tichborne Street",
      "x1": 16.509,
      "y1": 5.133,
      "x2": 16.367,
      "y2": 5.114
    },
    {
      "n": "Tichborne Street",
      "x1": 16.367,
      "y1": 5.114,
      "x2": 16.2,
      "y2": 5.1
    },
    {
      "n": "Tichborne Street",
      "x1": 16.2,
      "y1": 5.1,
      "x2": 16.014,
      "y2": 5.123
    },
    {
      "n": "Tichborne Street",
      "x1": 16.014,
      "y1": 5.123,
      "x2": 15.696,
      "y2": 5.202
    },
    {
      "n": "Tichborne Street",
      "x1": 15.696,
      "y1": 5.202,
      "x2": 15.077,
      "y2": 5.353
    },
    {
      "n": "Tichborne Street",
      "x1": 15.077,
      "y1": 5.353,
      "x2": 14.901,
      "y2": 5.419
    },
    {
      "n": "Market Place",
      "x1": 8.193,
      "y1": 17.015,
      "x2": 8.824,
      "y2": 17.196
    },
    {
      "n": "Vigo Street",
      "x1": 9.664,
      "y1": 5.329,
      "x2": 8.94,
      "y2": 5.089
    },
    {
      "n": "Vigo Street",
      "x1": 8.94,
      "y1": 5.089,
      "x2": 8.784,
      "y2": 5.088
    },
    {
      "n": "Saville Row",
      "x1": 8.784,
      "y1": 5.088,
      "x2": 7.043,
      "y2": 7.998
    },
    {
      "n": "Tichborne Street",
      "x1": 16.636,
      "y1": 5.19,
      "x2": 16.68,
      "y2": 5.083
    },
    {
      "n": "Regents Quadrant",
      "x1": 14.661,
      "y1": 5.055,
      "x2": 14.901,
      "y2": 5.419
    },
    {
      "n": "Grafton Street",
      "x1": 4.527,
      "y1": 5.037,
      "x2": 5.234,
      "y2": 5.511
    },
    {
      "n": "Regents Quadrant",
      "x1": 10.61,
      "y1": 5.642,
      "x2": 10.633,
      "y2": 5.594
    },
    {
      "n": "Regents Quadrant",
      "x1": 10.633,
      "y1": 5.594,
      "x2": 10.703,
      "y2": 5.465
    },
    {
      "n": "Regents Quadrant",
      "x1": 10.703,
      "y1": 5.465,
      "x2": 10.79,
      "y2": 5.348
    },
    {
      "n": "Regents Quadrant",
      "x1": 10.79,
      "y1": 5.348,
      "x2": 10.922,
      "y2": 5.222
    },
    {
      "n": "Regents Quadrant",
      "x1": 10.922,
      "y1": 5.222,
      "x2": 11.104,
      "y2": 5.083
    },
    {
      "n": "Regents Quadrant",
      "x1": 11.104,
      "y1": 5.083,
      "x2": 11.345,
      "y2": 4.968
    },
    {
      "n": "Cork Street",
      "x1": 6.788,
      "y1": 4.939,
      "x2": 5.855,
      "y2": 6.45
    },
    {
      "n": "Burlington Gardens",
      "x1": 8.784,
      "y1": 5.088,
      "x2": 8.555,
      "y2": 5.087
    },
    {
      "n": "Burlington Gardens",
      "x1": 8.555,
      "y1": 5.087,
      "x2": 8.024,
      "y2": 4.752
    },
    {
      "n": "Old Burlington Street",
      "x1": 8.024,
      "y1": 4.752,
      "x2": 6.73,
      "y2": 6.961
    },
    {
      "n": "Cork Mews",
      "x1": 6.788,
      "y1": 4.939,
      "x2": 6.274,
      "y2": 4.648
    },
    {
      "n": "Cork Mews",
      "x1": 6.274,
      "y1": 4.648,
      "x2": 6.029,
      "y2": 4.917
    },
    {
      "n": "Cork Mews",
      "x1": 6.029,
      "y1": 4.917,
      "x2": 5.777,
      "y2": 5.195
    },
    {
      "n": "Cork Mews",
      "x1": 5.777,
      "y1": 5.195,
      "x2": 5.553,
      "y2": 5.497
    },
    {
      "n": "Market Place",
      "x1": 8.146,
      "y1": 16.991,
      "x2": 8.193,
      "y2": 17.015
    },
    {
      "n": "Picadilly",
      "x1": 16.68,
      "y1": 5.083,
      "x2": 15.78,
      "y2": 4.627
    },
    {
      "n": "Whitcomb Court",
      "x1": 18.71,
      "y1": 4.597,
      "x2": 19.549,
      "y2": 5.147
    },
    {
      "n": "Oxendon Street",
      "x1": 18.71,
      "y1": 4.597,
      "x2": 18.114,
      "y2": 5.597
    },
    {
      "n": "Regents Quadrant",
      "x1": 13.198,
      "y1": 4.573,
      "x2": 13.393,
      "y2": 4.615
    },
    {
      "n": "Regents Quadrant",
      "x1": 14.486,
      "y1": 5.013,
      "x2": 14.661,
      "y2": 5.055
    },
    {
      "n": "Regents Quadrant",
      "x1": 13.393,
      "y1": 4.615,
      "x2": 13.556,
      "y2": 4.647
    },
    {
      "n": "Regents Quadrant",
      "x1": 13.556,
      "y1": 4.647,
      "x2": 13.699,
      "y2": 4.689
    },
    {
      "n": "Regents Quadrant",
      "x1": 13.699,
      "y1": 4.689,
      "x2": 13.809,
      "y2": 4.725
    },
    {
      "n": "Regents Quadrant",
      "x1": 13.809,
      "y1": 4.725,
      "x2": 13.953,
      "y2": 4.779
    },
    {
      "n": "Regents Quadrant",
      "x1": 13.953,
      "y1": 4.779,
      "x2": 14.112,
      "y2": 4.854
    },
    {
      "n": "Regents Quadrant",
      "x1": 14.112,
      "y1": 4.854,
      "x2": 14.272,
      "y2": 4.92
    },
    {
      "n": "Regents Quadrant",
      "x1": 14.272,
      "y1": 4.92,
      "x2": 14.415,
      "y2": 4.978
    },
    {
      "n": "Regents Quadrant",
      "x1": 14.415,
      "y1": 4.978,
      "x2": 14.486,
      "y2": 5.013
    },
    {
      "n": "Air Street",
      "x1": 13.198,
      "y1": 4.573,
      "x2": 12.625,
      "y2": 5.815
    },
    {
      "n": "Princes Street (III)",
      "x1": 19.549,
      "y1": 5.147,
      "x2": 19.888,
      "y2": 4.558
    },
    {
      "n": "Grafton Street",
      "x1": 3.699,
      "y1": 4.483,
      "x2": 4.527,
      "y2": 5.037
    },
    {
      "n": "Grafton Street",
      "x1": 3.649,
      "y1": 4.449,
      "x2": 3.699,
      "y2": 4.483
    },
    {
      "n": "Market Place",
      "x1": 7.926,
      "y1": 17.67,
      "x2": 8.146,
      "y2": 16.991
    },
    {
      "n": "Haymarket",
      "x1": 16.68,
      "y1": 5.083,
      "x2": 16.886,
      "y2": 5.138
    },
    {
      "n": "Haymarket",
      "x1": 16.886,
      "y1": 5.138,
      "x2": 17.435,
      "y2": 4.319
    },
    {
      "n": "Picadilly",
      "x1": 15.78,
      "y1": 4.627,
      "x2": 15.082,
      "y2": 4.273
    },
    {
      "n": "Regent Street",
      "x1": 14.661,
      "y1": 5.055,
      "x2": 15.082,
      "y2": 4.273
    },
    {
      "n": "Arundel Place",
      "x1": 17.464,
      "y1": 4.252,
      "x2": 18.023,
      "y2": 4.614
    },
    {
      "n": "Arundel Place",
      "x1": 18.023,
      "y1": 4.614,
      "x2": 17.482,
      "y2": 5.439
    },
    {
      "n": "Haymarket",
      "x1": 17.435,
      "y1": 4.319,
      "x2": 17.464,
      "y2": 4.252
    },
    {
      "n": "Burlington Gardens",
      "x1": 8.024,
      "y1": 4.752,
      "x2": 7.218,
      "y2": 4.244
    },
    {
      "n": "Cork Street",
      "x1": 7.218,
      "y1": 4.244,
      "x2": 6.788,
      "y2": 4.939
    },
    {
      "n": "Haymarket",
      "x1": 17.464,
      "y1": 4.252,
      "x2": 17.595,
      "y2": 4.074
    },
    {
      "n": "Panton Street",
      "x1": 19.051,
      "y1": 4.026,
      "x2": 19.888,
      "y2": 4.558
    },
    {
      "n": "Oxendon Street",
      "x1": 19.051,
      "y1": 4.026,
      "x2": 18.71,
      "y2": 4.597
    },
    {
      "n": "Great Castle Street",
      "x1": 5.403,
      "y1": 16.937,
      "x2": 6.994,
      "y2": 17.399
    },
    {
      "n": "Burlington Gardens",
      "x1": 7.218,
      "y1": 4.244,
      "x2": 6.569,
      "y2": 3.835
    },
    {
      "n": "New Bond Street",
      "x1": 6.569,
      "y1": 3.835,
      "x2": 5.234,
      "y2": 5.511
    },
    {
      "n": "Jermyn Street",
      "x1": 16.549,
      "y1": 3.805,
      "x2": 17.435,
      "y2": 4.319
    },
    {
      "n": "Oxendon Street",
      "x1": 19.256,
      "y1": 3.682,
      "x2": 19.051,
      "y2": 4.026
    },
    {
      "n": "Jermyn Street",
      "x1": 16.357,
      "y1": 3.681,
      "x2": 16.549,
      "y2": 3.805
    },
    {
      "n": "White Bear Yard",
      "x1": 16.357,
      "y1": 3.681,
      "x2": 15.78,
      "y2": 4.627
    },
    {
      "n": "Panton Street",
      "x1": 18.499,
      "y1": 3.66,
      "x2": 19.051,
      "y2": 4.026
    },
    {
      "n": "Regent Street",
      "x1": 5.098,
      "y1": 18.053,
      "x2": 5.403,
      "y2": 16.937
    },
    {
      "n": "Haymarket",
      "x1": 17.595,
      "y1": 4.074,
      "x2": 17.863,
      "y2": 3.642
    },
    {
      "n": "St James's Market",
      "x1": 16.808,
      "y1": 3.612,
      "x2": 17.595,
      "y2": 4.074
    },
    {
      "n": "Market Street (II)",
      "x1": 16.549,
      "y1": 3.805,
      "x2": 16.67,
      "y2": 3.608
    },
    {
      "n": "Jermyn Street",
      "x1": 16.211,
      "y1": 3.595,
      "x2": 16.357,
      "y2": 3.681
    },
    {
      "n": "Vine Street",
      "x1": 11.625,
      "y1": 3.571,
      "x2": 11.969,
      "y2": 3.752
    },
    {
      "n": "Regent Street",
      "x1": 15.476,
      "y1": 3.571,
      "x2": 15.082,
      "y2": 4.273
    },
    {
      "n": "Oxford Street",
      "x1": 12.306,
      "y1": 16.921,
      "x2": 12.742,
      "y2": 17.002
    },
    {
      "n": "Oxford Street",
      "x1": 12.742,
      "y1": 17.002,
      "x2": 13.395,
      "y2": 17.12
    },
    {
      "n": "Picadilly",
      "x1": 15.082,
      "y1": 4.273,
      "x2": 13.692,
      "y2": 3.513
    },
    {
      "n": "Air Street",
      "x1": 13.692,
      "y1": 3.513,
      "x2": 13.198,
      "y2": 4.573
    },
    {
      "n": "George Court (I)",
      "x1": 11.969,
      "y1": 3.752,
      "x2": 12.125,
      "y2": 3.475
    },
    {
      "n": "Swallow Street",
      "x1": 11.625,
      "y1": 3.571,
      "x2": 11.688,
      "y2": 3.465
    },
    {
      "n": "Sackville Street",
      "x1": 9.664,
      "y1": 5.329,
      "x2": 10.784,
      "y2": 3.439
    },
    {
      "n": "Oxford Street",
      "x1": 12.245,
      "y1": 16.91,
      "x2": 12.306,
      "y2": 16.921
    },
    {
      "n": "Albany Street",
      "x1": 9.783,
      "y1": 3.41,
      "x2": 8.784,
      "y2": 5.088
    },
    {
      "n": "Burlington Arcade",
      "x1": 7.218,
      "y1": 4.244,
      "x2": 7.799,
      "y2": 3.353
    },
    {
      "n": "New Bond Street",
      "x1": 6.569,
      "y1": 3.835,
      "x2": 6.964,
      "y2": 3.329
    },
    {
      "n": "Albemarle Street",
      "x1": 4.527,
      "y1": 5.037,
      "x2": 5.65,
      "y2": 3.292
    },
    {
      "n": "Dover Street",
      "x1": 3.699,
      "y1": 4.483,
      "x2": 4.502,
      "y2": 3.259
    },
    {
      "n": "Allens Court",
      "x1": 14.159,
      "y1": 17.262,
      "x2": 14.332,
      "y2": 16.49
    },
    {
      "n": "Allens Court",
      "x1": 14.332,
      "y1": 16.49,
      "x2": 14.389,
      "y2": 16.499
    },
    {
      "n": "Vine Street",
      "x1": 11.745,
      "y1": 4.812,
      "x2": 11.878,
      "y2": 5.175
    },
    {
      "n": "Vine Street",
      "x1": 11.878,
      "y1": 5.175,
      "x2": 11.545,
      "y2": 5.951
    },
    {
      "n": "Vine Street",
      "x1": 11.745,
      "y1": 4.812,
      "x2": 11.722,
      "y2": 4.759
    },
    {
      "n": "Regents Quadrant",
      "x1": 11.345,
      "y1": 4.968,
      "x2": 11.541,
      "y2": 4.826
    },
    {
      "n": "Regents Quadrant",
      "x1": 11.541,
      "y1": 4.826,
      "x2": 11.722,
      "y2": 4.759
    },
    {
      "n": "Regents Quadrant",
      "x1": 11.722,
      "y1": 4.759,
      "x2": 11.912,
      "y2": 4.701
    },
    {
      "n": "Regents Quadrant",
      "x1": 11.912,
      "y1": 4.701,
      "x2": 12.102,
      "y2": 4.637
    },
    {
      "n": "Regents Quadrant",
      "x1": 12.102,
      "y1": 4.637,
      "x2": 12.237,
      "y2": 4.604
    },
    {
      "n": "Regents Quadrant",
      "x1": 12.237,
      "y1": 4.604,
      "x2": 12.308,
      "y2": 4.586
    },
    {
      "n": "Regents Quadrant",
      "x1": 12.308,
      "y1": 4.586,
      "x2": 12.465,
      "y2": 4.57
    },
    {
      "n": "Regents Quadrant",
      "x1": 12.465,
      "y1": 4.57,
      "x2": 12.788,
      "y2": 4.558
    },
    {
      "n": "Regents Quadrant",
      "x1": 12.788,
      "y1": 4.558,
      "x2": 12.998,
      "y2": 4.552
    },
    {
      "n": "Regents Quadrant",
      "x1": 12.998,
      "y1": 4.552,
      "x2": 13.111,
      "y2": 4.568
    },
    {
      "n": "Regents Quadrant",
      "x1": 13.111,
      "y1": 4.568,
      "x2": 13.198,
      "y2": 4.573
    },
    {
      "n": "Vine Street",
      "x1": 12.329,
      "y1": 3.895,
      "x2": 12.456,
      "y2": 3.954
    },
    {
      "n": "Vine Street",
      "x1": 12.237,
      "y1": 4.604,
      "x2": 12.169,
      "y2": 4.25
    },
    {
      "n": "Vine Street",
      "x1": 12.169,
      "y1": 4.25,
      "x2": 12.329,
      "y2": 3.895
    },
    {
      "n": "Vine Street",
      "x1": 11.969,
      "y1": 3.752,
      "x2": 12.329,
      "y2": 3.895
    },
    {
      "n": "Swallow Street",
      "x1": 11.345,
      "y1": 4.968,
      "x2": 11.081,
      "y2": 4.488
    },
    {
      "n": "Swallow Street",
      "x1": 11.081,
      "y1": 4.488,
      "x2": 11.625,
      "y2": 3.571
    },
    {
      "n": "Clifford Street",
      "x1": 7.422,
      "y1": 7.365,
      "x2": 6.73,
      "y2": 6.961
    },
    {
      "n": "Great Chapel Street",
      "x1": 15.317,
      "y1": 16.41,
      "x2": 14.97,
      "y2": 17.415
    },
    {
      "n": "Titchfield Street",
      "x1": 15.389,
      "y1": 16.12,
      "x2": 16.069,
      "y2": 16.408
    },
    {
      "n": "Great Chapel Street",
      "x1": 15.317,
      "y1": 16.41,
      "x2": 15.389,
      "y2": 16.12
    },
    {
      "n": "Hollen Street",
      "x1": 14.024,
      "y1": 15.827,
      "x2": 15.134,
      "y2": 16.356
    },
    {
      "n": "Hollen Street",
      "x1": 15.134,
      "y1": 16.356,
      "x2": 15.317,
      "y2": 16.41
    },
    {
      "n": "Wardour Street",
      "x1": 14.024,
      "y1": 15.827,
      "x2": 13.395,
      "y2": 17.12
    },
    {
      "n": "Great Chapel Street",
      "x1": 15.389,
      "y1": 16.12,
      "x2": 15.51,
      "y2": 15.752
    },
    {
      "n": "Great Chapel Street",
      "x1": 15.51,
      "y1": 15.752,
      "x2": 15.607,
      "y2": 15.622
    },
    {
      "n": "Noel Street",
      "x1": 13.58,
      "y1": 15.604,
      "x2": 14.024,
      "y2": 15.827
    },
    {
      "n": "Wardour Street",
      "x1": 14.443,
      "y1": 15.01,
      "x2": 14.024,
      "y2": 15.827
    },
    {
      "n": "Wells Street",
      "x1": 12.245,
      "y1": 16.91,
      "x2": 11.6,
      "y2": 18.588
    },
    {
      "n": "Falconberg Mews",
      "x1": 19.353,
      "y1": 17.184,
      "x2": 19.541,
      "y2": 16.768
    },
    {
      "n": "Oxford Street",
      "x1": 11.165,
      "y1": 16.71,
      "x2": 12.245,
      "y2": 16.91
    },
    {
      "n": "Princes Street (I)",
      "x1": 3.733,
      "y1": 17.621,
      "x2": 4.244,
      "y2": 16.702
    },
    {
      "n": "Market Row",
      "x1": 8.146,
      "y1": 16.991,
      "x2": 7.186,
      "y2": 16.684
    },
    {
      "n": "John Street",
      "x1": 7.186,
      "y1": 16.684,
      "x2": 6.994,
      "y2": 17.399
    },
    {
      "n": "Oxford Street",
      "x1": 10.829,
      "y1": 16.646,
      "x2": 11.165,
      "y2": 16.71
    },
    {
      "n": "Great Castle Street",
      "x1": 4.293,
      "y1": 16.615,
      "x2": 5.403,
      "y2": 16.937
    },
    {
      "n": "Princes Street (I)",
      "x1": 4.244,
      "y1": 16.702,
      "x2": 4.293,
      "y2": 16.615
    },
    {
      "n": "Charles Street",
      "x1": 17.174,
      "y1": 17.866,
      "x2": 17.743,
      "y2": 16.587
    },
    {
      "n": "Oxford Street",
      "x1": 10.319,
      "y1": 16.55,
      "x2": 10.829,
      "y2": 16.646
    },
    {
      "n": "Winsley Street",
      "x1": 9.683,
      "y1": 18.209,
      "x2": 10.319,
      "y2": 16.55
    },
    {
      "n": "Dean Street",
      "x1": 15.6,
      "y1": 17.525,
      "x2": 16.069,
      "y2": 16.408
    },
    {
      "n": "Oxford Street",
      "x1": 9.475,
      "y1": 16.39,
      "x2": 10.319,
      "y2": 16.55
    },
    {
      "n": "Turks Head Yard",
      "x1": 9.337,
      "y1": 16.97,
      "x2": 9.475,
      "y2": 16.39
    },
    {
      "n": "Phoenix Yard",
      "x1": 4.244,
      "y1": 16.702,
      "x2": 3.427,
      "y2": 16.385
    },
    {
      "n": "Oxford Street",
      "x1": 9.089,
      "y1": 16.317,
      "x2": 9.475,
      "y2": 16.39
    },
    {
      "n": "Oxford Street",
      "x1": 9.03,
      "y1": 16.306,
      "x2": 9.089,
      "y2": 16.317
    },
    {
      "n": "Market Street (I)",
      "x1": 8.824,
      "y1": 17.196,
      "x2": 9.03,
      "y2": 16.306
    },
    {
      "n": "Oxford Street",
      "x1": 8.371,
      "y1": 16.175,
      "x2": 9.03,
      "y2": 16.306
    },
    {
      "n": "Market Court",
      "x1": 8.193,
      "y1": 17.015,
      "x2": 8.371,
      "y2": 16.175
    },
    {
      "n": "Sutton Street",
      "x1": 18.735,
      "y1": 16.15,
      "x2": 19.548,
      "y2": 16.537
    },
    {
      "n": "Soho Square",
      "x1": 18.735,
      "y1": 16.15,
      "x2": 18.394,
      "y2": 16.876
    },
    {
      "n": "Soho Square",
      "x1": 18.394,
      "y1": 16.876,
      "x2": 17.743,
      "y2": 16.587
    },
    {
      "n": "Oxford Street",
      "x1": 7.868,
      "y1": 16.078,
      "x2": 8.371,
      "y2": 16.175
    },
    {
      "n": "Phoenix Yard",
      "x1": 3.519,
      "y1": 16.033,
      "x2": 3.944,
      "y2": 16.159
    },
    {
      "n": "Phoenix Yard",
      "x1": 3.427,
      "y1": 16.385,
      "x2": 3.519,
      "y2": 16.033
    },
    {
      "n": "Oxford Street",
      "x1": 7.375,
      "y1": 15.978,
      "x2": 7.868,
      "y2": 16.078
    },
    {
      "n": "John Street",
      "x1": 7.375,
      "y1": 15.978,
      "x2": 7.186,
      "y2": 16.684
    },
    {
      "n": "Dean Street",
      "x1": 16.069,
      "y1": 16.408,
      "x2": 16.27,
      "y2": 15.93
    },
    {
      "n": "Norris's Place",
      "x1": 10.829,
      "y1": 16.646,
      "x2": 11.026,
      "y2": 15.859
    },
    {
      "n": "Oxford Street",
      "x1": 6.633,
      "y1": 15.822,
      "x2": 7.375,
      "y2": 15.978
    },
    {
      "n": "Oxford Street",
      "x1": 5.7,
      "y1": 15.626,
      "x2": 6.633,
      "y2": 15.822
    },
    {
      "n": "Regent Street",
      "x1": 5.403,
      "y1": 16.937,
      "x2": 5.7,
      "y2": 15.626
    },
    {
      "n": "Crown Court",
      "x1": 15.607,
      "y1": 15.622,
      "x2": 16.27,
      "y2": 15.93
    },
    {
      "n": "Soho Square",
      "x1": 17.743,
      "y1": 16.587,
      "x2": 17.099,
      "y2": 16.255
    },
    {
      "n": "Soho Square",
      "x1": 17.099,
      "y1": 16.255,
      "x2": 17.421,
      "y2": 15.542
    },
    {
      "n": "Oxford Street",
      "x1": 5.025,
      "y1": 15.516,
      "x2": 5.7,
      "y2": 15.626
    }
  ],
  "landmarks": [
    {
      "name": "Golden Square-N",
      "x": 12.026,
      "y": 9.023
    },
    {
      "name": "Golden Square-E",
      "x": 12.653,
      "y": 8.105
    },
    {
      "name": "Golden Square-S",
      "x": 11.789,
      "y": 7.438
    },
    {
      "name": "Golden Square-W",
      "x": 11.149,
      "y": 8.377
    },
    {
      "name": "Soho Square-N",
      "x": 17.743,
      "y": 16.587
    },
    {
      "name": "Soho Square-E",
      "x": 18.735,
      "y": 16.15
    },
    {
      "name": "Soho Square-S1",
      "x": 18.907,
      "y": 15.376
    },
    {
      "name": "Soho Square-S2",
      "x": 18.402,
      "y": 15.139
    },
    {
      "name": "Soho Square-S3",
      "x": 17.895,
      "y": 14.9
    },
    {
      "name": "Soho Square-W",
      "x": 17.421,
      "y": 15.542
    },
    {
      "name": "Argyll House",
      "x": 8.046,
      "y": 14.003
    },
    {
      "name": "Craven Chapel",
      "x": 8.065,
      "y": 11.009
    },
    {
      "name": "Lion Brewery",
      "x": 13.902,
      "y": 11.873
    },
    {
      "name": "Magistrates Court",
      "x": 9.019,
      "y": 14.358
    },
    {
      "name": "Karl Marx",
      "x": 17.385,
      "y": 13.371
    },
    {
      "name": "Model Lodging Houses",
      "x": 14.333,
      "y": 11.046
    },
    {
      "name": "The Pantheon",
      "x": 10.319,
      "y": 16.55
    },
    {
      "name": "St James Workhouse",
      "x": 11.074,
      "y": 13.305
    },
    {
      "name": "St Luke's Church",
      "x": 14.987,
      "y": 11.171
    },
    {
      "name": "John Snow",
      "x": 10.224,
      "y": 4.384
    }
  ],
  "summary": {
    "totalDeaths": 578,
    "totalAnchors": 321,
    "byPumpWalking": {
      "7": 387,
      "9": 57,
      "8": 18,
      "3": 19,
      "10": 24,
      "4": 6,
      "6": 64,
      "12": 1,
      "5": 1,
      "11": 1
    },
    "byPumpEuclidean": {
      "7": 361,
      "10": 62,
      "8": 16,
      "6": 61,
      "4": 23,
      "3": 13,
      "5": 6,
      "9": 27,
      "11": 2,
      "13": 4,
      "12": 2,
      "2": 1
    }
  }
};
