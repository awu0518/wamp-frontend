export const W_W = 800;
export const W_H = 460;
export const US_W = 960;
export const US_H = 600;

export const COLOR = {
  countryIn:     '#2478A0',
  countryInHov:  '#0B3345',
  countryUSA:    '#14506E',
  countryUSAHov: '#0B3345',
  countryOut:    '#E8D9C0',
  countryOutHov: '#D4BF9A',
  stateIn:       '#3D7A50',
  stateInHov:    '#2A5738',
  stateOut:      '#D4E8D9',
  stateOutHov:   '#B09468',
  stroke:        '#FFFFFF',
  badge:         '#E97451',
  badgeStroke:   '#FFFFFF',
  badgeText:     '#FFFFFF',
};

// Heatmap: 5 stops — [0] = 0 journals, [1]-[4] = increasing intensity.
export const STATE_HEAT     = ['#3D7A50', '#347048', '#2A5738', '#1E4430', '#173020'];
export const STATE_HEAT_HOV = ['#2A5738', '#234A30', '#1B3D26', '#142E1E', '#0F2416'];

export const COUNTRY_HEAT     = ['#2478A0', '#1C6487', '#14506E', '#0F3D55', '#0B3345'];
export const COUNTRY_HEAT_HOV = ['#0B3345', '#092938', '#081F2B', '#061A23', '#04111A'];

// Selected-state highlight (uses ocean palette so it clearly stands out)
export const STATE_SELECTED     = '#14506E';  // ocean-800
export const STATE_SELECTED_HOV = '#0B3345';  // ocean-900

function lerp(a, b, t) { return a + (b - a) * t; }

function parseHex(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function toHex(r, g, b) {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

/**
 * Pick a fill from a 5-stop gradient.
 *   count === 0         → scale[0]
 *   count  > 0          → interpolate across scale[1]…scale[4]
 *   count >= maxCount   → scale[4]
 */
export function heatColor(scale, count, maxCount) {
  if (!count || maxCount <= 0) return scale[0];
  const last = scale.length - 1;
  const t = Math.min(count / maxCount, 1);
  const pos = 1 + t * (last - 1);
  const lo = Math.floor(pos);
  const hi = Math.min(lo + 1, last);
  const frac = pos - lo;
  const [r1, g1, b1] = parseHex(scale[lo]);
  const [r2, g2, b2] = parseHex(scale[hi]);
  return toHex(lerp(r1, r2, frac), lerp(g1, g2, frac), lerp(b1, b2, frac));
}

export const NUMERIC_TO_ALPHA2 = {
  4:'AF',8:'AL',12:'DZ',20:'AD',24:'AO',28:'AG',31:'AZ',32:'AR',
  36:'AU',40:'AT',44:'BS',48:'BH',50:'BD',51:'AM',52:'BB',56:'BE',
  64:'BT',68:'BO',70:'BA',72:'BW',76:'BR',84:'BZ',90:'SB',96:'BN',
  100:'BG',104:'MM',108:'BI',112:'BY',116:'KH',120:'CM',124:'CA',
  132:'CV',140:'CF',144:'LK',148:'TD',152:'CL',156:'CN',170:'CO',
  174:'KM',178:'CG',180:'CD',188:'CR',191:'HR',192:'CU',196:'CY',
  203:'CZ',204:'BJ',208:'DK',212:'DM',214:'DO',218:'EC',222:'SV',
  226:'GQ',231:'ET',232:'ER',233:'EE',238:'FK',242:'FJ',246:'FI',
  250:'FR',262:'DJ',266:'GA',268:'GE',270:'GM',276:'DE',288:'GH',
  296:'KI',300:'GR',304:'GL',308:'GD',320:'GT',324:'GN',328:'GY',
  332:'HT',340:'HN',344:'HK',348:'HU',352:'IS',356:'IN',360:'ID',
  364:'IR',368:'IQ',372:'IE',376:'IL',380:'IT',384:'CI',388:'JM',
  392:'JP',398:'KZ',400:'JO',404:'KE',408:'KP',410:'KR',414:'KW',
  417:'KG',418:'LA',422:'LB',426:'LS',428:'LV',430:'LR',434:'LY',
  438:'LI',440:'LT',442:'LU',446:'MO',450:'MG',454:'MW',458:'MY',
  462:'MV',466:'ML',470:'MT',478:'MR',480:'MU',484:'MX',492:'MC',
  496:'MN',498:'MD',499:'ME',504:'MA',508:'MZ',512:'OM',516:'NA',
  520:'NR',524:'NP',528:'NL',531:'CW',534:'SX',540:'NC',548:'VU',
  554:'NZ',558:'NI',562:'NE',566:'NG',578:'NO',583:'FM',584:'MH',
  585:'PW',586:'PK',591:'PA',598:'PG',600:'PY',604:'PE',608:'PH',
  616:'PL',620:'PT',624:'GW',626:'TL',634:'QA',642:'RO',643:'RU',
  646:'RW',659:'KN',662:'LC',670:'VC',674:'SM',678:'ST',682:'SA',
  686:'SN',688:'RS',690:'SC',694:'SL',702:'SG',703:'SK',704:'VN',
  705:'SI',706:'SO',710:'ZA',716:'ZW',724:'ES',728:'SS',729:'SD',
  740:'SR',748:'SZ',752:'SE',756:'CH',760:'SY',762:'TJ',764:'TH',
  768:'TG',776:'TO',780:'TT',784:'AE',788:'TN',792:'TR',795:'TM',
  800:'UG',804:'UA',807:'MK',818:'EG',826:'GB',840:'US',854:'BF',
  858:'UY',860:'UZ',862:'VE',882:'WS',887:'YE',894:'ZM',
};
