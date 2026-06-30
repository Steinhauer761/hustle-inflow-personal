import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Activity, BarChart2, Users, Wifi, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Tier2Lock from '@/components/shared/Tier2Lock';
import Tier2Footer from '@/components/shared/Tier2Footer';
import Tier2Banner from '@/components/shared/Tier2Banner';
import PromoBanner from '@/components/shared/PromoBanner';

const TABS = [
  { id: 'live', label: 'Live', icon: Wifi },
  { id: 'stats', label: 'Stats', icon: BarChart2 },
  { id: 'rankings', label: 'Rankings', icon: Trophy },
  { id: 'teams', label: 'Teams', icon: Users },
];

// All Canadian teams across major leagues
const CANADIAN_TEAMS = [
  // NHL
  { name: 'Toronto Maple Leafs', sport: 'NHL', city: 'Toronto', province: 'ON', record: '46-24-8', logo: '🍁', rating: 84, emoji: '🍁' },
  { name: 'Montreal Canadiens', sport: 'NHL', city: 'Montreal', province: 'QC', record: '31-35-14', logo: '🔵', rating: 65, emoji: '🔵' },
  { name: 'Vancouver Canucks', sport: 'NHL', city: 'Vancouver', province: 'BC', record: '40-33-7', logo: '🟢', rating: 75, emoji: '🟢' },
  { name: 'Edmonton Oilers', sport: 'NHL', city: 'Edmonton', province: 'AB', record: '49-27-4', logo: '🟠', rating: 88, emoji: '🟠' },
  { name: 'Calgary Flames', sport: 'NHL', city: 'Calgary', province: 'AB', record: '35-37-8', logo: '🔴', rating: 68, emoji: '🔴' },
  { name: 'Ottawa Senators', sport: 'NHL', city: 'Ottawa', province: 'ON', record: '38-36-6', logo: '⚫', rating: 70, emoji: '⚫' },
  { name: 'Winnipeg Jets', sport: 'NHL', city: 'Winnipeg', province: 'MB', record: '52-22-6', logo: '✈️', rating: 91, emoji: '✈️' },
  // NBA
  { name: 'Toronto Raptors', sport: 'NBA', city: 'Toronto', province: 'ON', record: '30-52', logo: '🦖', rating: 62, emoji: '🦖' },
  // CFL
  { name: 'Edmonton Elks', sport: 'CFL', city: 'Edmonton', province: 'AB', record: '8-10', logo: '🟢', rating: 70, emoji: '🟢' },
  { name: 'Calgary Stampeders', sport: 'CFL', city: 'Calgary', province: 'AB', record: '10-8', logo: '🔴', rating: 75, emoji: '🔴' },
  { name: 'Winnipeg Blue Bombers', sport: 'CFL', city: 'Winnipeg', province: 'MB', record: '13-5', logo: '💙', rating: 88, emoji: '💙' },
  { name: 'BC Lions', sport: 'CFL', city: 'Vancouver', province: 'BC', record: '9-9', logo: '🦁', rating: 72, emoji: '🦁' },
  { name: 'Toronto Argonauts', sport: 'CFL', city: 'Toronto', province: 'ON', record: '11-7', logo: '⚪', rating: 78, emoji: '⚪' },
  { name: 'Hamilton Tiger-Cats', sport: 'CFL', city: 'Hamilton', province: 'ON', record: '7-11', logo: '🐯', rating: 65, emoji: '🐯' },
  { name: 'Ottawa Redblacks', sport: 'CFL', city: 'Ottawa', province: 'ON', record: '6-12', logo: '🔴', rating: 58, emoji: '🔴' },
  { name: 'Montreal Alouettes', sport: 'CFL', city: 'Montreal', province: 'QC', record: '12-6', logo: '🐦', rating: 82, emoji: '🐦' },
  { name: 'Saskatchewan Roughriders', sport: 'CFL', city: 'Regina', province: 'SK', record: '9-9', logo: '🟩', rating: 71, emoji: '🟩' },
  // MLS
  { name: 'Toronto FC', sport: 'MLS', city: 'Toronto', province: 'ON', record: '12-14-8', logo: '🔴', rating: 68, emoji: '🔴' },
  { name: 'CF Montréal', sport: 'MLS', city: 'Montreal', province: 'QC', record: '11-15-8', logo: '🔵', rating: 65, emoji: '🔵' },
  { name: 'Vancouver Whitecaps', sport: 'MLS', city: 'Vancouver', province: 'BC', record: '14-12-8', logo: '🔵', rating: 72, emoji: '🔵' },
];

// Province → city mapping for auto-detection
const PROVINCE_CITIES = {
  'AB': ['Edmonton', 'Calgary'],
  'ON': ['Toronto', 'Ottawa', 'Hamilton'],
  'BC': ['Vancouver'],
  'QC': ['Montreal'],
  'MB': ['Winnipeg'],
  'SK': ['Regina'],
};

// Canadian games (scores)
const CANADIAN_GAMES = [
  { id: 1, home: 'Edmonton Oilers', away: 'Winnipeg Jets', homeScore: 3, awayScore: 2, quarter: '3rd · 8:42', sport: '🏒', live: true },
  { id: 2, home: 'Toronto Maple Leafs', away: 'Ottawa Senators', homeScore: 2, awayScore: 2, quarter: '2nd · 14:11', sport: '🏒', live: true },
  { id: 3, home: 'Toronto Raptors', away: 'Miami Heat', homeScore: 94, awayScore: 101, quarter: 'Q4 Final', sport: '🏀', live: false },
  { id: 4, home: 'Calgary Stampeders', away: 'Winnipeg Blue Bombers', homeScore: 24, awayScore: 31, quarter: 'Q4 Final', sport: '🏈', live: false },
];

const CANADIAN_STATS = [
  { player: 'Connor McDavid', team: 'Oilers', pts: 51, ast: 34, reb: 0, avatar: '⚡', sport: 'NHL' },
  { player: 'Auston Matthews', team: 'Maple Leafs', pts: 40, ast: 28, reb: 0, avatar: '🍁', sport: 'NHL' },
  { player: 'Kyle Connor', team: 'Jets', pts: 37, ast: 22, reb: 0, avatar: '✈️', sport: 'NHL' },
  { player: 'Bo Horvat', team: 'Islanders', pts: 30, ast: 19, reb: 0, avatar: '🟢', sport: 'NHL' },
  { player: 'Scottie Barnes', team: 'Raptors', pts: 21, ast: 6, reb: 8, avatar: '🦖', sport: 'NBA' },
];

const CANADIAN_RANKINGS = [
  { rank: 1, team: 'Winnipeg Jets', w: 52, l: 22, pct: '.703', streak: 'W4', emoji: '✈️', sport: 'NHL' },
  { rank: 2, team: 'Edmonton Oilers', w: 49, l: 27, pct: '.645', streak: 'W2', emoji: '🟠', sport: 'NHL' },
  { rank: 3, team: 'Toronto Maple Leafs', w: 46, l: 24, pct: '.617', streak: 'L1', emoji: '🍁', sport: 'NHL' },
  { rank: 4, team: 'Vancouver Canucks', w: 40, l: 33, pct: '.548', streak: 'W1', emoji: '🟢', sport: 'NHL' },
  { rank: 5, team: 'Ottawa Senators', w: 38, l: 36, pct: '.513', streak: 'W2', emoji: '⚫', sport: 'NHL' },
  { rank: 6, team: 'Calgary Flames', w: 35, l: 37, pct: '.486', streak: 'L2', emoji: '🔴', sport: 'NHL' },
  { rank: 7, team: 'Montreal Canadiens', w: 31, l: 35, pct: '.470', streak: 'W1', emoji: '🔵', sport: 'NHL' },
];

function LiveTab({ province }) {
  const games = province
    ? CANADIAN_GAMES.filter(g =>
        (PROVINCE_CITIES[province] || []).some(city =>
          g.home.includes(city.split(' ')[0]) || g.away.includes(city.split(' ')[0]) ||
          CANADIAN_TEAMS.some(t => t.city === city && (g.home.includes(t.name.split(' ')[0]) || g.away.includes(t.name.split(' ')[0])))
        )
      )
    : CANADIAN_GAMES;

  const displayGames = games.length > 0 ? games : CANADIAN_GAMES;

  return (
    <div className="space-y-3">
      {displayGames.map((g, i) => (
        <motion.div key={g.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
          className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{g.sport}</span>
              {g.live && (
                <span className="flex items-center gap-1 bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> Live
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground font-semibold">{g.quarter}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-sm">{g.home}</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-display text-primary">{g.homeScore}</span>
              <span className="text-muted-foreground text-sm">–</span>
              <span className="text-2xl font-display text-foreground">{g.awayScore}</span>
            </div>
            <span className="font-bold text-foreground text-sm text-right">{g.away}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StatsTab() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-1">
        <span className="col-span-2">Player</span><span className="text-center">PTS</span><span className="text-center">AST</span><span className="text-center">REB</span>
      </div>
      {CANADIAN_STATS.map((p, i) => (
        <motion.div key={p.player} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
          className="bg-card border border-border rounded-2xl p-3 grid grid-cols-5 items-center">
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-xl">{p.avatar}</span>
            <div>
              <p className="text-xs font-bold text-foreground">{p.player}</p>
              <p className="text-[10px] text-muted-foreground">{p.team} · {p.sport}</p>
            </div>
          </div>
          <span className="text-center font-bold text-primary text-sm">{p.pts}</span>
          <span className="text-center text-sm text-foreground">{p.ast}</span>
          <span className="text-center text-sm text-foreground">{p.reb > 0 ? p.reb : '—'}</span>
        </motion.div>
      ))}
    </div>
  );
}

function RankingsTab() {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">🏒 NHL — Canadian Division Standings</p>
      {CANADIAN_RANKINGS.map((r, i) => (
        <motion.div key={r.team} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-slate-500/20 text-slate-400' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-muted text-muted-foreground'}`}>
            {r.rank}
          </span>
          <span className="text-lg">{r.emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{r.team}</p>
            <p className="text-[10px] text-muted-foreground">{r.w}W – {r.l}L · {r.pct}</p>
          </div>
          <span className={`text-xs font-bold ${r.streak.startsWith('W') ? 'text-emerald-400' : 'text-red-400'}`}>{r.streak}</span>
        </motion.div>
      ))}
    </div>
  );
}

function TeamsTab({ province }) {
  const [sportFilter, setSportFilter] = useState('all');

  const provinceCities = province ? (PROVINCE_CITIES[province] || []) : null;
  const localTeams = provinceCities
    ? CANADIAN_TEAMS.filter(t => provinceCities.includes(t.city))
    : CANADIAN_TEAMS;

  const sports = ['all', ...new Set(localTeams.map(t => t.sport))];
  const filtered = sportFilter === 'all' ? localTeams : localTeams.filter(t => t.sport === sportFilter);

  return (
    <div>
      {/* Sport filter pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {sports.map(s => (
          <button key={s} onClick={() => setSportFilter(s)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all border ${sportFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-2xl p-4">
            <div className="text-3xl mb-2">{t.logo}</div>
            <p className="font-bold text-foreground text-sm leading-tight">{t.name}</p>
            <p className="text-[10px] text-muted-foreground mb-2">{t.sport} · {t.record}</p>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${t.rating}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Rating: {t.rating}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function SportsLounge() {
  const [tab, setTab] = useState('live');
  const [province, setProvince] = useState(null);
  const [locationLabel, setLocationLabel] = useState('Canada');

  useEffect(() => {
    base44.entities.UserSettings.list().then(settings => {
      if (settings?.length > 0) {
        const s = settings[0];
        if (s.province_state) {
          setProvince(s.province_state.toUpperCase());
          setLocationLabel(s.province_state.toUpperCase());
        }
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Tier2Banner feature="Sports Lounge" />
      <div className="px-4 pt-4 pb-10 max-w-2xl mx-auto">
        <PromoBanner variant="teal" />
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-display text-foreground flex items-center gap-2">
              🏟️ Sports Lounge
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-primary" />
              <p className="text-xs text-muted-foreground">Canadian Teams · <span className="text-primary font-semibold">{locationLabel}</span></p>
            </div>
          </div>
          <Tier2Lock />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-2xl p-1 mb-5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${tab === t.id ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[300px]">
          {tab === 'live' && <LiveTab province={province} />}
          {tab === 'stats' && <StatsTab />}
          {tab === 'rankings' && <RankingsTab />}
          {tab === 'teams' && <TeamsTab province={province} />}
        </div>

        <Tier2Footer moduleName="Sports Lounge" />
      </div>
    </div>
  );
}