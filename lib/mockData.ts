export const mockIntegrations = [
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Listening history, audio features (BPM, energy, valence), recently played, top tracks by period',
    icon: '🎵',
    badge: 'OAuth',
    connected: true,
    metrics: { listening_hours: 24.5, top_tracks: 142, playlists: 12 },
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Commits, PR activity, code review patterns, languages used, contribution streaks',
    icon: '💻',
    badge: 'GraphQL',
    connected: true,
    metrics: { commits: 342, prs: 28, reviews: 156 },
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: 'Meeting load, free vs busy time blocks, late meetings, back-to-back ratios',
    icon: '📅',
    badge: 'OAuth',
    connected: true,
    metrics: { meetings_week: 18, avg_duration: '45m', busy_percent: 62 },
  },
  {
    id: 'weather',
    name: 'Weather API',
    description: 'Temperature, humidity, UV index, rain — correlated against your behavior patterns',
    icon: '🌤️',
    badge: 'REST',
    connected: true,
    metrics: { temp_avg: '72°F', humidity: 65, uv_index: 6 },
  },
  {
    id: 'checkin',
    name: 'Manual check-ins',
    description: 'Optional daily 30-second mood + energy rating. Fills gaps where API data is thin',
    icon: '📝',
    badge: 'manual',
    connected: false,
    metrics: { days_logged: 45, streak: 7 },
  },
  {
    id: 'wakatime',
    name: 'Wakatime',
    description: 'Precise coding time per language and project — more granular than GitHub commits alone',
    icon: '⏱️',
    badge: 'OAuth',
    connected: false,
    metrics: { coding_hours: 0, languages: 0 },
  },
]

export const mockDailyMetrics = {
  today_at_glance: [
    { label: 'Energy Level', value: 78, unit: '%' },
    { label: 'Meeting Load', value: 5, unit: 'meetings' },
    { label: 'Current Streak', value: 12, unit: 'days' },
    { label: 'Coding Minutes', value: 240, unit: 'min' },
    { label: 'Listening Mood', value: 'Energetic', unit: 'mood' },
  ],
  morning_briefing: 'Yesterday was a high-focus day. Heavy meetings today. Your best work happens before noon.',
  live_now: {
    currently_playing: 'Synthwave - Night Drive',
    focus_mode: true,
    next_meeting: '2:00 PM - Team Sync',
    time_until: '45 minutes',
  },
  streaks: [
    { name: 'Coding Days', current: 12, best: 24, icon: '💻' },
    { name: 'Daily Check-ins', current: 7, best: 15, icon: '📝' },
    { name: 'Calendar Hygiene', current: 3, best: 8, icon: '📅' },
  ],
  week_heatmap: [
    { day: 'Mon', score: 92, label: 'Excellent' },
    { day: 'Tue', score: 78, label: 'Good' },
    { day: 'Wed', score: 65, label: 'Moderate' },
    { day: 'Thu', score: 88, label: 'Excellent' },
    { day: 'Fri', score: 71, label: 'Good' },
    { day: 'Sat', score: 42, label: 'Low' },
    { day: 'Sun', score: 55, label: 'Moderate' },
  ],
  focus_score: {
    score: 76,
    components: [
      { label: 'Commit Quality', value: 85 },
      { label: 'Deep Work Blocks', value: 72 },
      { label: 'Meeting Interruption Ratio', value: 68 },
      { label: 'Music Energy During Work', value: 80 },
    ],
  },
}

export const mockCorrelationInsights = [
  {
    id: 1,
    title: 'Music → Productivity Correlation',
    description: 'Which genres, BPM ranges, and energy levels coincide with your highest-output coding sessions. Updated weekly.',
    badge: 'time-series ML',
    icon: '🎵',
    correlation: 0.84,
  },
  {
    id: 2,
    title: 'Weather → Mood Correlation',
    description: 'Does rain make you more or less productive? Does temperature affect your commit frequency?',
    badge: 'causal inference',
    icon: '🌤️',
    correlation: 0.52,
  },
  {
    id: 3,
    title: 'Meeting Load → Code Quality',
    description: 'Correlates calendar density with commit message length, PR size, and bug-fix ratio. Quantifies meeting tax.',
    badge: 'regression',
    icon: '📊',
    correlation: -0.71,
  },
  {
    id: 4,
    title: 'Sleep Proxy Detection',
    description: 'Infers approximate sleep time from when Spotify/GitHub activity ends. Correlates against next-day output.',
    badge: 'pattern detection',
    icon: '😴',
    correlation: 0.78,
  },
  {
    id: 5,
    title: 'Anomaly Alerts',
    description: '"Something is different this week" flags statistically significant deviations from your baseline before they become burnout',
    badge: 'anomaly detection',
    icon: '⚠️',
    correlation: null,
  },
  {
    id: 6,
    title: 'Optimal Work Window',
    description: 'Learns your personal peak hours from 90 days of data. Not a generic "9-11am" — YOUR specific best window.',
    badge: 'personalised ML',
    icon: '⭐',
    correlation: 0.91,
  },
]

export const mockAnalyticsData = {
  listening_timeline: {
    recent: [
      { time: '2:45 PM', track: 'Neon Dreams', artist: 'Synthwave', duration: 240 },
      { time: '1:30 PM', track: 'Code Flow', artist: 'Lo-Fi Beats', duration: 1800 },
      { time: '11:15 AM', track: 'Morning Run', artist: 'Electronic', duration: 600 },
      { time: '8:00 PM Yesterday', track: 'Evening Jazz', artist: 'Chill Jazz', duration: 1200 },
    ],
  },
  coding_timeline: {
    recent: [
      { time: '3:20 PM', message: 'feat: add correlation engine', repo: 'pulseos/core', lines: 342 },
      { time: '1:45 PM', message: 'fix: race condition in sync worker', repo: 'pulseos/workers', lines: 28 },
      { time: '11:00 AM', message: 'refactor: dashboard components', repo: 'pulseos/web', lines: 156 },
    ],
  },
  time_allocation: {
    meetings: 42,
    deep_work: 35,
    buffer: 23,
  },
  insights: {
    monthly: 'Top moment: Monday deep focus session. Biggest change: more evening commits.',
    yearly: 'Coding year: 1,200 commits across 45 repos. Music year: 2,400 hours. Productivity year: 847 focused days.',
  },
}

export const mockUser = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  joined: 'January 2024',
  avatar: '👤',
  bio: 'Software engineer obsessed with data-driven insights',
}
