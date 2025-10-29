
import React, { useState, createContext, useContext, useEffect, useMemo, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// --- TYPES AND CONSTANTS ---

const AppColors = {
  emeraldGreen: '#0BAE7E',
  deepJade: '#0B5F4A',
  goldAccent: '#C9A227',
  bronzeTint: '#B8892E',
  warmSand: '#F3EAD7',
  charcoal: '#1F2937',
  white: '#FFFFFF',
};

type Level = 'ضعيف' | 'متوسط' | 'قوي';

type FootballPosition = 'حارس' | 'دفاع' | 'وسط' | 'هجوم' | 'جوكر';
type BasketballPosition = 'صانع ألعاب' | 'مدافع مسدد' | 'جناح صغير' | 'مهاجم قوي' | 'لاعب ارتكاز';
type VolleyballPosition = 'مُعد' | 'ضارب خارجي' | 'حاجز وسط' | 'ضارب مقابل' | 'ليبرو';
type HandballPosition = 'حارس مرمى' | 'جناح أيسر' | 'ظهير أيسر' | 'ظهير وسط' | 'ظهير أيمن' | 'جناح أيمن' | 'لاعب دائرة';
type Position = FootballPosition | BasketballPosition | VolleyballPosition | HandballPosition;
type Sport = 'كرة القدم' | 'كرة السلة' | 'كرة الطائرة' | 'كرة اليد';

interface BracketItem {
  id: string | number;
  name: string;
}


interface Player extends BracketItem {
  id: string;
  level: Level;
  position: Position;
}

interface Team extends BracketItem {
  id: number;
  captain: Player | null;
  startersByPosition: Record<string, Player[]>;
  substitutes: Player[];
}

interface BracketMatch<T extends BracketItem> {
    id: string;
    participants: [(T & { isBye?: boolean }) | { name: string; isBye?: boolean } | null, (T & { isBye?: boolean }) | { name: string; isBye?: boolean } | null];
    winner: T | null;
}
type Bracket<T extends BracketItem> = BracketMatch<T>[][];


// --- I1N (INTERNATIONALIZATION) ---

const translations = {
  en: {
    // General
    appName: 'FairPlay Team Divider',
    fairTeamsBetterGames: 'Fair Teams. Better Games.',
    fairTeamsDesc: 'Add players, set roles and strength, get balanced squads in seconds.',
    startNewMatch: 'Start New Match',
    players: 'Players',
    matchSetup: 'Match Setup',
    results: 'Results',
    settings: 'Settings',
    language: 'Language',
    addPlayer: 'Add Player',
    playerName: 'Player Name',
    level: 'Level',
    position: 'Position',
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
    // Positions
    goalkeeper: 'Goalkeeper',
    defense: 'Defense',
    midfield: 'Midfield',
    attack: 'Attack',
    joker: 'Joker',
    pointGuard: 'Point Guard',
    shootingGuard: 'Shooting Guard',
    smallForward: 'Small Forward',
    powerForward: 'Power Forward',
    center: 'Center',
    setter: 'Setter',
    outsideHitter: 'Outside Hitter',
    middleBlocker: 'Middle Blocker',
    oppositeHitter: 'Opposite Hitter',
    libero: 'Libero',
    goalkeeper_hb: 'Goalkeeper',
    leftWing: 'Left Wing',
    leftBack: 'Left Back',
    centreBack: 'Centre Back',
    rightBack: 'Right Back',
    rightWing: 'Right Wing',
    pivot: 'Pivot',
    // Match Setup
    numTeams: 'Number of Teams',
    playersPerTeam: 'Players per Team (Starters)',
    generateTeams: 'Generate Teams',
    // Results
    team: 'Team',
    captain: 'Captain',
    starters: 'Starters',
    substitutes: 'Substitutes',
    fairnessRating: 'Fairness Rating',
    veryBalanced: 'Very Balanced',
    quiteBalanced: 'Quite Balanced',
    needsSwap: 'A swap might be needed',
    regenerate: 'Regenerate',
    backToSetup: 'Back to Setup',
    copyright: '© All rights reserved to Mohammed Ahmed Al-Moussawi.',
    playerList: 'Player List',
    noPlayers: 'No players added yet. Add some players to get started!',
    endMatch: 'End Match',
    score: 'Score',
    // Player Card
    delete: 'Delete',
    duplicatePlayerError: 'This name already exists. Please enter a different name.',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    // New
    sport: 'Sport',
    football: 'Football',
    basketball: 'Basketball',
    volleyball: 'Volleyball',
    handball: 'Handball',
    competitions: 'Competitions',
    startTournament: 'Start Tournament',
    tournamentBracket: 'Tournament Bracket',
    round: 'Round',
    final: 'Final',
    winner: 'Winner',
    declareWinner: 'Declare Winner',
    redraw: 'Redraw',
    bye: 'BYE',
    goldenChance: 'Golden Chance',
    drawLoser: 'Draw a Loser',
    // Individual Competition
    individualCompetition: 'Individual Competition',
    teamMatch: 'Team Match',
    setupIndividualCompetition: 'Setup Individual Competition',
    forTeachersAndEducators: 'Designed for esteemed teachers and educators.',
    numberOfParticipants: 'Number of Participants',
    addParticipant: 'Add Participant',
    participantName: 'Participant Name',
    participantList: 'Participant List',
    noParticipants: 'No participants added yet.',
    startCompetition: 'Start Competition',
    backToHome: 'Back to Home',
    // Roulette Wheel
    rouletteWheel: 'Roulette Wheel',
    setupRoulette: 'Setup Roulette Wheel',
    spinTheWheel: 'Spin the Wheel',
    spin: 'Spin',
    winnerIs: 'The winner is...',
    close: 'Close',
    deleteAndRespin: 'Delete and Respin',
    addParticipantHelpText: 'Add participants to the wheel (2-99).',
    min2Participants: 'You need at least 2 participants to spin.',
  },
  ar: {
    // General
    appName: 'تحدي الأبطال',
    fairTeamsBetterGames: 'تحدي الأبطال',
    fairTeamsDesc: 'رتّب لعب الحارة بذكاء: أضف لاعبيك، حدّد مراكزهم ومستوياتهم، ودع منصّتنا توزّعهم بعدل على فريقين أو أكثر.',
    startNewMatch: 'ابدأ مباراة جديدة',
    players: 'اللاعبين',
    matchSetup: 'إعداد المباراة',
    results: 'النتائج',
    settings: 'الإعدادات',
    language: 'اللغة',
    addPlayer: 'أضف لاعب',
    playerName: 'اسم اللاعب',
    level: 'المستوى',
    position: 'المركز',
    weak: 'ضعيف',
    medium: 'متوسط',
    strong: 'قوي',
    // Positions
    goalkeeper: 'حارس',
    defense: 'دفاع',
    midfield: 'وسط',
    attack: 'هجوم',
    joker: 'جوكر',
    pointGuard: 'صانع ألعاب',
    shootingGuard: 'مدافع مسدد',
    smallForward: 'جناح صغير',
    powerForward: 'مهاجم قوي',
    center: 'لاعب ارتكاز',
    setter: 'مُعد',
    outsideHitter: 'ضارب خارجي',
    middleBlocker: 'حاجز وسط',
    oppositeHitter: 'ضارب مقابل',
    libero: 'ليبرو',
    goalkeeper_hb: 'حارس مرمى',
    leftWing: 'جناح أيسر',
    leftBack: 'ظهير أيسر',
    centreBack: 'ظهير وسط',
    rightBack: 'ظهير أيمن',
    rightWing: 'جناح أيمن',
    pivot: 'لاعب دائرة',
    // Match Setup
    numTeams: 'عدد الفرق',
    playersPerTeam: 'عدد اللاعبين الأساسيين بالفريق',
    generateTeams: 'قسّم الفرق',
    // Results
    team: 'فريق',
    captain: 'الكابتن',
    starters: 'الأساسيون',
    substitutes: 'الاحتياط',
    fairnessRating: 'مؤشر العدالة',
    veryBalanced: 'متوازن جدًا',
    quiteBalanced: 'متقارب',
    needsSwap: 'ينصح بتبديل',
    regenerate: 'إعادة التوزيع',
    backToSetup: 'العودة للإعدادات',
    copyright: '© جميع الحقوق محفوظة لـ محمد أحمد الموسوي.',
    playerList: 'قائمة اللاعبين',
    noPlayers: 'لم يتم إضافة أي لاعب بعد. أضف بعض اللاعبين للبدء!',
    endMatch: 'إنهاء المباراة',
    score: 'النتيجة',
    // Player Card
    delete: 'حذف',
    duplicatePlayerError: 'هذا الاسم موجود بالفعل. يرجى إدخال اسم مختلف.',
    edit: 'تعديل',
    save: 'حفظ',
    cancel: 'إلغاء',
     // New
    sport: 'الرياضة',
    football: 'كرة القدم',
    basketball: 'كرة السلة',
    volleyball: 'كرة الطائرة',
    handball: 'كرة اليد',
    competitions: 'المسابقات',
    startTournament: 'ابدأ البطولة',
    tournamentBracket: 'مخطط البطولة',
    round: 'جولة',
    final: 'النهائي',
    winner: 'الفائز',
    declareWinner: 'تحديد الفائز',
    redraw: 'إعادة القرعة',
    bye: 'تأهل مباشر',
    goldenChance: 'الفرصة الذهبية',
    drawLoser: 'سحب خاسر',
    // Individual Competition
    individualCompetition: 'مسابقة فردية',
    teamMatch: 'مباراة فرق',
    setupIndividualCompetition: 'إعداد المسابقة الفردية',
    forTeachersAndEducators: 'مخصصة للمعلمين والمربين الأفاضل',
    numberOfParticipants: 'عدد المشاركين',
    addParticipant: 'أضف مشارك',
    participantName: 'اسم المشارك',
    participantList: 'قائمة المشاركين',
    noParticipants: 'لم يتم إضافة أي مشارك بعد.',
    startCompetition: 'ابدأ المسابقة',
    backToHome: 'العودة للرئيسية',
    // Roulette Wheel
    rouletteWheel: 'عجلة الحظ',
    setupRoulette: 'إعداد عجلة الحظ',
    spinTheWheel: 'أدر العجلة',
    spin: 'أدر',
    winnerIs: 'الفائز هو...',
    close: 'إغلاق',
    deleteAndRespin: 'حذف',
    addParticipantHelpText: 'أضف مشاركين للعجلة (2-99).',
    min2Participants: 'تحتاج لمشاركين اثنين على الأقل لبدء السحب.',
  }
};

const levelToKey: Record<Level, 'weak' | 'medium' | 'strong'> = {
    'ضعيف': 'weak',
    'متوسط': 'medium',
    'قوي': 'strong',
};

const positionToKey: Record<Position, keyof typeof translations.en> = {
    'حارس': 'goalkeeper',
    'دفاع': 'defense',
    'وسط': 'midfield',
    'هجوم': 'attack',
    'جوكر': 'joker',
    'صانع ألعاب': 'pointGuard',
    'مدافع مسدد': 'shootingGuard',
    'جناح صغير': 'smallForward',
    'مهاجم قوي': 'powerForward',
    'لاعب ارتكاز': 'center',
    'مُعد': 'setter',
    'ضارب خارجي': 'outsideHitter',
    'حاجز وسط': 'middleBlocker',
    'ضارب مقابل': 'oppositeHitter',
    'ليبرو': 'libero',
    'حارس مرمى': 'goalkeeper_hb',
    'جناح أيسر': 'leftWing',
    'ظهير أيسر': 'leftBack',
    'ظهير وسط': 'centreBack',
    'ظهير أيمن': 'rightBack',
    'جناح أيمن': 'rightWing',
    'لاعب دائرة': 'pivot',
};

const SPORTS: Sport[] = ['كرة القدم', 'كرة السلة', 'كرة الطائرة', 'كرة اليد'];
const POSITIONS_BY_SPORT: Record<Sport, Position[]> = {
    'كرة القدم': ['حارس', 'دفاع', 'وسط', 'هجوم', 'جوكر'],
    'كرة السلة': ['صانع ألعاب', 'مدافع مسدد', 'جناح صغير', 'مهاجم قوي', 'لاعب ارتكاز'],
    'كرة الطائرة': ['مُعد', 'ضارب خارجي', 'حاجز وسط', 'ضارب مقابل', 'ليبرو'],
    'كرة اليد': ['حارس مرمى', 'جناح أيسر', 'ظهير أيسر', 'ظهير وسط', 'ظهير أيمن', 'جناح أيمن', 'لاعب دائرة'],
};

const FORMATIONS: Partial<Record<Sport, Record<string, number>>> = {
    'كرة السلة': { 'صانع ألعاب': 1, 'مدافع مسدد': 1, 'جناح صغير': 1, 'مهاجم قوي': 1, 'لاعب ارتكاز': 1 }, // 5
    'كرة الطائرة': { 'مُعد': 1, 'ضارب خارجي': 2, 'حاجز وسط': 2, 'ضارب مقابل': 1 }, // 6
    'كرة اليد': { 'حارس مرمى': 1, 'جناح أيسر': 1, 'ظهير أيسر': 1, 'ظهير وسط': 1, 'ظهير أيمن': 1, 'جناح أيمن': 1, 'لاعب دائرة': 1 }, // 7
};

type Language = 'en' | 'ar';
const LanguageContext = createContext<{ lang: Language; setLang: (lang: Language) => void; t: (key: keyof typeof translations.en) => string, dir: 'ltr' | 'rtl' }>({
  lang: 'ar',
  setLang: () => {},
  t: () => '',
  dir: 'rtl',
});

const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>('ar');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = (key: keyof typeof translations.en) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useTranslation = () => useContext(LanguageContext);

// --- CORE LOGIC ---

const getLevelValue = (level: Level): number => {
    if (level === 'قوي') return 3;
    if (level === 'متوسط') return 2;
    return 1;
};

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const getFootballFormation = (playerCount: number): Record<string, number> => {
    if (playerCount <= 3) return { 'حارس': 1, 'دفاع': playerCount - 1 };
    if (playerCount === 4) return { 'حارس': 1, 'دفاع': 1, 'وسط': 1, 'هجوم': 1 };
    if (playerCount === 5) return { 'حارس': 1, 'دفاع': 2, 'وسط': 1, 'هجوم': 1 };
    if (playerCount === 6) return { 'حارس': 1, 'دفاع': 2, 'وسط': 2, 'هجوم': 1 };
    if (playerCount === 7) return { 'حارس': 1, 'دفاع': 3, 'وسط': 2, 'هجوم': 1 };
    if (playerCount === 8) return { 'حارس': 1, 'دفاع': 3, 'وسط': 3, 'هجوم': 1 };
    if (playerCount === 9) return { 'حارس': 1, 'دفاع': 3, 'وسط': 3, 'هجوم': 2 };
    if (playerCount === 10) return { 'حارس': 1, 'دفاع': 4, 'وسط': 3, 'هجوم': 2 };
    if (playerCount >= 11) return { 'حارس': 1, 'دفاع': 4, 'وسط': 4, 'هجوم': 2 };
    return { 'حارس': 1 }; // Fallback
};

const assignPlayersToPositions = (
    players: Player[],
    formation: Record<string, number>,
    positionPriority: Position[]
): { assigned: Record<string, Player[]>, remaining: Player[] } => {
    let availablePlayers = [...players];
    const assigned: Record<string, Player[]> = {};
    positionPriority.forEach(p => { assigned[p] = [] });

    // First pass: assign specialists
    positionPriority.forEach(pos => {
        const needed = formation[pos] || 0;
        for (let i = 0; i < needed; i++) {
            const specialistIndex = availablePlayers.findIndex(p => p.position === pos);
            if (specialistIndex !== -1) {
                const [specialist] = availablePlayers.splice(specialistIndex, 1);
                assigned[pos].push(specialist);
            }
        }
    });

    // Second pass: fill remaining spots with jokers, then others
    positionPriority.forEach(pos => {
        const needed = (formation[pos] || 0) - assigned[pos].length;
        for (let i = 0; i < needed; i++) {
            if (availablePlayers.length === 0) break;
            let playerToAssignIndex = availablePlayers.findIndex(p => p.position === 'جوكر');
            if (playerToAssignIndex === -1) {
                playerToAssignIndex = 0; // Take any player
            }
            const [playerToAssign] = availablePlayers.splice(playerToAssignIndex, 1);
            assigned[pos].push(playerToAssign);
        }
    });

    Object.keys(assigned).forEach(key => {
        if (assigned[key].length === 0) delete assigned[key];
    });

    return { assigned, remaining: availablePlayers };
};

const getAllStarters = (team: Team): Player[] => {
    return Object.values(team.startersByPosition).flat();
};

const generateTeamsLogic = (allPlayers: Player[], numTeams: number, playersPerTeam: number, sport: Sport, t: (key: keyof typeof translations.en) => string): Team[] => {
    let teams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
        id: i + 1,
        name: `${t('team')} ${i + 1}`,
        captain: null,
        startersByPosition: {},
        substitutes: [],
    }));

    const sortedPlayers = shuffleArray(allPlayers).sort((a, b) => getLevelValue(b.level) - getLevelValue(a.level));
    const tempTeamStarters: Player[][] = Array.from({ length: numTeams }, () => []);
    const tempSubstitutes: Player[][] = Array.from({ length: numTeams }, () => []);

    let round = 0;
    while (sortedPlayers.length > 0) {
        const player = sortedPlayers.shift();
        if (!player) continue;

        const teamIndex = round % numTeams;

        if (tempTeamStarters[teamIndex].length < playersPerTeam) {
            tempTeamStarters[teamIndex].push(player);
        } else {
            tempSubstitutes[teamIndex].push(player);
        }
        round++;
    }
    
    teams.forEach((team, index) => {
        team.substitutes = tempSubstitutes[index];
        let availableStarters = [...tempTeamStarters[index]];
        
        const formation = sport === 'كرة القدم' ? getFootballFormation(availableStarters.length) : FORMATIONS[sport];

        if (formation) {
            const positionPriority = POSITIONS_BY_SPORT[sport];
            const { assigned, remaining } = assignPlayersToPositions(availableStarters, formation, positionPriority);
            team.startersByPosition = assigned;
            team.substitutes.push(...remaining);
        } else {
            team.startersByPosition = { 'الأساسيون': availableStarters };
        }
    });

    teams.forEach(team => {
        const starters = getAllStarters(team);
        if (starters.length > 0) {
            team.captain = starters[Math.floor(Math.random() * starters.length)];
        }
    });

    return teams;
};

const createBracket = <T extends BracketItem>(items: T[]): Bracket<T> => {
    const shuffledItems = shuffleArray(items);
    const numItems = shuffledItems.length;
    if (numItems < 2) return [];

    const rounds: Bracket<T> = [];
    
    let itemQueue: (T | { name: string; isBye?: boolean })[] = [...shuffledItems];
    
    const nextPowerOfTwo = 2 ** Math.ceil(Math.log2(numItems));
    const byes = nextPowerOfTwo - numItems;

    let round1: BracketMatch<T>[] = [];
    
    // Assign byes to the top seeds (who are now at the start of the shuffled array)
    for (let i = 0; i < byes; i++) {
        const byeItem = itemQueue.shift()! as T;
        round1.push({
            id: `r1m${i}`,
            participants: [byeItem, { name: 'BYE', isBye: true }],
            winner: byeItem,
        });
    }

    while (itemQueue.length > 0) {
        const item1 = itemQueue.shift()! as T;
        const item2 = itemQueue.shift()! as T;
        round1.push({
            id: `r1m${round1.length}`,
            participants: [item1, item2],
            winner: null,
        });
    }

    rounds.push(round1);

    let previousRound = round1;
    while(previousRound.length > 1) {
        const nextRound: BracketMatch<T>[] = [];
        for (let i = 0; i < previousRound.length; i += 2) {
             const participant1 = previousRound[i].winner;
             const participant2 = previousRound[i+1]?.winner;
             nextRound.push({
                id: `r${rounds.length + 1}m${i/2}`,
                participants: [participant1, participant2],
                winner: null,
            });
        }
        rounds.push(nextRound);
        previousRound = nextRound;
    }
    return rounds;
};


// --- UI COMPONENTS ---

const Confetti = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const particles: any[] = [];
        const particleCount = 200;
        const colors = ['#0BAE7E', '#0B5F4A', '#C9A227', '#B8892E', '#F3EAD7'];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height - height,
                speed: Math.random() * 5 + 2,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                angle: Math.random() * 360,
                spin: (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 2 + 1),
            });
        }

        let animationFrameId: number;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                ctx.save();
                ctx.fillStyle = p.color;
                ctx.translate(p.x + p.size / 2, p.y + p.size / 2);
                ctx.rotate(p.angle * Math.PI / 180);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();

                p.y += p.speed;
                p.angle += p.spin;

                if (p.y > height) {
                    p.y = -20;
                    p.x = Math.random() * width;
                }
            });
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', handleResize);

        const timer = setTimeout(() => {
            cancelAnimationFrame(animationFrameId);
        }, 5000); // Stop animation after 5 seconds

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" />;
};


const Header = ({ onNavigate, currentPage, sport, setSport, teamTournament, individualTournament }) => {
    const { lang, setLang, t, dir } = useTranslation();
    const isRTL = dir === 'rtl';

    const toggleLang = () => setLang(lang === 'ar' ? 'en' : 'ar');
    const isTournamentActive = teamTournament || individualTournament;

    return (
        <header className="bg-warmSand shadow-md border-b-4 border-bronzeTint sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 text-[${AppColors.deepJade}]`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm-1.056 16.082l-3.41-3.41 1.414-1.414 1.996 1.996 4.957-4.957 1.414 1.414-6.37 6.371z"/></svg>
                            <span className="text-xl font-bold text-deepJade" style={{color: AppColors.deepJade}}>{t('appName')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        { currentPage === 'setup' && (
                            <div className="relative">
                               <select value={sport} onChange={e => setSport(e.target.value as Sport)} className={`-mx-2 block appearance-none w-full bg-transparent border-2 border-[${AppColors.goldAccent}] text-[${AppColors.deepJade}] py-1 px-2 pr-6 rounded-md leading-tight focus:outline-none font-bold`}>
                                    {SPORTS.map(s => <option key={s} value={s}>{isRTL ? s : t(s.replace(/ /g, '').toLowerCase() as any)}</option>)}
                               </select>
                            </div>
                        )}
                        {isTournamentActive && (
                            <button onClick={() => onNavigate(teamTournament ? 'teamTournament' : 'individualTournament')} className={`px-3 py-1 rounded-md font-bold text-white transition-transform duration-200 transform hover:scale-105 shadow-md bg-[${AppColors.goldAccent}] hover:bg-[${AppColors.bronzeTint}]`}>
                               {t('competitions')}
                            </button>
                        )}
                        <button onClick={() => onNavigate('home')} className={`px-3 py-1 rounded-md font-bold text-white transition-transform duration-200 transform hover:scale-105 shadow-md bg-[${AppColors.emeraldGreen}] hover:bg-[${AppColors.deepJade}] hidden sm:block`}>
                           {t('backToHome')}
                        </button>
                        <button onClick={toggleLang} className={`px-3 py-1 border-2 rounded-md font-bold transition-all duration-300 border-[${AppColors.goldAccent}] text-[${AppColors.deepJade}] hover:bg-[${AppColors.goldAccent}] hover:text-white`}>
                           {lang === 'ar' ? 'EN' : 'AR'}
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className={`bg-[${AppColors.warmSand}] mt-12`}>
            <div className={`h-1 bg-gradient-to-r from-[${AppColors.goldAccent}] to-[${AppColors.bronzeTint}]`}></div>
            <div className="text-center py-4">
                <p className={`text-sm text-[${AppColors.charcoal}]`}>{t('copyright')}</p>
            </div>
        </footer>
    );
}

const Icon = ({ name, className = '' }) => {
    const icons = {
        star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.975-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
        circle: <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />,
        filledCircle: <circle cx="12" cy="12" r="10" fill="currentColor" />,
        joker: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />,
        trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
        edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />,
        save: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
        cancel: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
        trophy: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M5 3a2 2 0 012 2v1h10V5a2 2 0 012-2h-2.172a2 2 0 00-1.414.586L12 5.172l-2.414-2.586A2 2 0 008.172 2H6m3 4v11m0 0a2 2 0 104 0M9 19a2 2 0 114 0" />,
    };
    return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">{icons[name]}</svg>;
}

const NumberStepper = ({ label, value, onChange, min, max }) => {
    const increment = () => onChange(Math.min(max, value + 1));
    const decrement = () => onChange(Math.max(min, value - 1));

    const buttonClasses = `w-10 h-10 flex items-center justify-center font-bold text-2xl rounded-md transition-colors bg-gray-200 text-[${AppColors.deepJade}] hover:bg-[${AppColors.emeraldGreen}] hover:text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed`;

    return (
        <div>
            <label className="block text-lg font-medium text-gray-700 text-center">{label}</label>
            <div className="mt-2 flex items-center justify-center gap-4">
                <button onClick={decrement} disabled={value <= min} className={buttonClasses}>-</button>
                <span className={`text-4xl font-bold w-20 text-center text-[${AppColors.deepJade}]`}>{value}</span>
                <button onClick={increment} disabled={value >= max} className={buttonClasses}>+</button>
            </div>
        </div>
    );
};


// --- PAGE COMPONENTS ---

const HomePage = ({ onNavigate }) => {
    const { t } = useTranslation();
    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
            <h1 className={`text-5xl md:text-6xl font-bold mb-4 text-[${AppColors.deepJade}]`}>{t('fairTeamsBetterGames')}</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-charcoal">{t('fairTeamsDesc')}</p>
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap justify-center">
                 <button onClick={() => onNavigate('setup')} className={`px-8 py-4 rounded-lg font-bold text-white text-xl transition-transform duration-200 transform hover:scale-105 shadow-xl bg-[${AppColors.emeraldGreen}] hover:bg-[${AppColors.deepJade}]`}>
                    {t('teamMatch')}
                </button>
                 <button onClick={() => onNavigate('individualSetup')} className={`px-8 py-4 rounded-lg font-bold text-white text-xl transition-transform duration-200 transform hover:scale-105 shadow-xl bg-[${AppColors.goldAccent}] hover:bg-[${AppColors.bronzeTint}]`}>
                    {t('individualCompetition')}
                </button>
                 <button onClick={() => onNavigate('rouletteSetup')} className={`px-8 py-4 rounded-lg font-bold text-white text-xl transition-transform duration-200 transform hover:scale-105 shadow-xl bg-purple-600 hover:bg-purple-800`}>
                    {t('rouletteWheel')}
                </button>
            </div>
        </div>
    );
};

const PlayerPage = ({ players, setPlayers, sport }) => {
    const { t, dir } = useTranslation();
    const positionOptions = POSITIONS_BY_SPORT[sport];
    
    const [name, setName] = useState('');
    const [level, setLevel] = useState<Level>('متوسط');
    const [position, setPosition] = useState<Position>(positionOptions[0]);
    const [error, setError] = useState<string | null>(null);
    const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
    const [editedData, setEditedData] = useState<Partial<Player>>({});
    const [editError, setEditError] = useState<string | null>(null);

    const isRTL = dir === 'rtl';

    useEffect(() => {
        setPosition(positionOptions[0]);
    }, [sport, positionOptions]);

    useEffect(() => {
        if(error) setError(null);
    }, [name]);
    
    useEffect(() => {
        if(editError) setEditError(null);
    }, [editedData.name]);

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (trimmedName) {
            if (players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
                setError(t('duplicatePlayerError'));
                return;
            }
            const newPlayer: Player = { id: Date.now().toString(), name: trimmedName, level, position };
            setPlayers(prev => [...prev, newPlayer]);
            setName('');
        }
    };
    
    const handleDeletePlayer = (id: string) => {
        setPlayers(prev => prev.filter(p => p.id !== id));
    };
    
    const handleEditStart = (player: Player) => {
        setEditingPlayerId(player.id);
        setEditedData(player);
        setEditError(null);
    };

    const handleCancelEdit = () => {
        setEditingPlayerId(null);
        setEditedData({});
        setEditError(null);
    };

    const handleUpdatePlayer = () => {
        if (!editingPlayerId || !editedData.name) return;

        const trimmedName = editedData.name.trim();
        if (!trimmedName) return;

        const isDuplicate = players.some(
            p => p.id !== editingPlayerId && p.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (isDuplicate) {
            setEditError(t('duplicatePlayerError'));
            return;
        }

        setPlayers(prev => 
            prev.map(p => (p.id === editingPlayerId ? { ...p, ...editedData, name: trimmedName } as Player : p))
        );
        handleCancelEdit();
    };


    const levelOptions: Level[] = ['ضعيف', 'متوسط', 'قوي'];

    const getLevelIndicator = (level: Level) => {
        const baseClasses = "w-5 h-5";
        if (level === 'قوي') return <Icon name="star" className={`${baseClasses} text-yellow-500 fill-current`} />;
        if (level === 'متوسط') return <Icon name="filledCircle" className={`${baseClasses} text-blue-500`} />;
        return <Icon name="circle" className={`${baseClasses} text-gray-400`} />;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <form onSubmit={handleAddPlayer} className={`p-6 bg-white rounded-lg shadow-lg border-t-4 border-[${AppColors.goldAccent}]`}>
                        <h2 className={`text-2xl font-bold mb-4 text-[${AppColors.deepJade}]`}>{t('addPlayer')}</h2>
                        <div className="mb-4">
                            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700">{t('playerName')}</label>
                            <input 
                                type="text" 
                                id="playerName" 
                                value={name} 
                                onChange={e => setName(e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[${AppColors.emeraldGreen}] focus:border-[${AppColors.emeraldGreen}]`} 
                                required 
                            />
                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">{t('level')}</label>
                            <div className="flex justify-around mt-2">
                                {levelOptions.map(l => (
                                    <label key={l} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="level" value={l} checked={level === l} onChange={() => setLevel(l)} className={`form-radio h-5 w-5 text-[${AppColors.emeraldGreen}] focus:ring-[${AppColors.emeraldGreen}]`} />
                                        <span>{isRTL ? l : t(levelToKey[l])}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="position" className="block text-sm font-medium text-gray-700">{t('position')}</label>
                            <select id="position" value={position} onChange={e => setPosition(e.target.value as Position)} className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[${AppColors.emeraldGreen}] focus:border-[${AppColors.emeraldGreen}] sm:text-sm rounded-md`}>
                                {positionOptions.map(p => <option key={p} value={p}>{isRTL ? p : t(positionToKey[p])}</option>)}
                            </select>
                        </div>
                        <button type="submit" className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-bold bg-[${AppColors.emeraldGreen}] hover:bg-[${AppColors.deepJade}] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${AppColors.emeraldGreen}] transition-transform transform hover:scale-105`}>
                            {t('addPlayer')}
                        </button>
                    </form>
                </div>
                <div className="md:col-span-2">
                    <h2 className={`text-2xl font-bold mb-4 text-[${AppColors.deepJade}]`}>{t('playerList')}</h2>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {players.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {players.map(player => (
                                    <li key={player.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        {editingPlayerId === player.id ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <input 
                                                        type="text" 
                                                        value={editedData.name || ''}
                                                        onChange={e => setEditedData(d => ({ ...d, name: e.target.value }))}
                                                        className={`block w-full px-3 py-2 bg-white border ${editError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[${AppColors.emeraldGreen}] focus:border-[${AppColors.emeraldGreen}]`}
                                                    />
                                                    {editError && <p className="text-red-500 text-sm mt-1">{editError}</p>}
                                                </div>
                                                <div className="flex justify-around">
                                                    {levelOptions.map(l => (
                                                        <label key={l} className="flex items-center gap-2 cursor-pointer">
                                                            <input 
                                                                type="radio" 
                                                                name={`level-${player.id}`} 
                                                                value={l} 
                                                                checked={editedData.level === l} 
                                                                onChange={() => setEditedData(d => ({...d, level: l}))} 
                                                                className={`form-radio h-5 w-5 text-[${AppColors.emeraldGreen}] focus:ring-[${AppColors.emeraldGreen}]`} 
                                                            />
                                                            <span>{isRTL ? l : t(levelToKey[l])}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <div>
                                                    <select 
                                                        value={editedData.position} 
                                                        onChange={e => setEditedData(d => ({...d, position: e.target.value as Position}))} 
                                                        className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[${AppColors.emeraldGreen}] focus:border-[${AppColors.emeraldGreen}] sm:text-sm rounded-md`}
                                                    >
                                                        {positionOptions.map(p => <option key={p} value={p}>{isRTL ? p : t(positionToKey[p])}</option>)}
                                                    </select>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200" aria-label={t('cancel')}>
                                                        <Icon name="cancel" className="w-6 h-6" />
                                                    </button>
                                                    <button onClick={handleUpdatePlayer} className="text-green-600 hover:text-green-800 transition-colors p-2 rounded-full hover:bg-green-100" aria-label={t('save')}>
                                                        <Icon name="save" className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    {getLevelIndicator(player.level)}
                                                    <div>
                                                        <p className="font-semibold text-lg">{player.name}</p>
                                                        <p className="text-sm text-gray-500">{isRTL ? player.position : t(positionToKey[player.position])}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEditStart(player)} className="text-blue-500 hover:text-blue-700 transition-colors" aria-label={`${t('edit')} ${player.name}`}>
                                                        <Icon name="edit" className="w-6 h-6" />
                                                    </button>
                                                    <button onClick={() => handleDeletePlayer(player.id)} className="text-red-500 hover:text-red-700 transition-colors" aria-label={`${t('delete')} ${player.name}`}>
                                                        <Icon name="trash" className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-8 text-center text-gray-500">{t('noPlayers')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SetupPage = ({ onGenerate, players }) => {
    const { t } = useTranslation();
    const [numTeams, setNumTeams] = useState(2);
    const [playersPerTeam, setPlayersPerTeam] = useState(4);
    const canGenerate = players.length >= numTeams * playersPerTeam;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className={`p-8 bg-white rounded-lg shadow-lg border-t-4 border-[${AppColors.goldAccent}]`}>
                <h1 className={`text-3xl font-bold mb-6 text-center text-[${AppColors.deepJade}]`}>{t('matchSetup')}</h1>
                <div className="space-y-8">
                    <NumberStepper 
                        label={t('numTeams')} 
                        value={numTeams} 
                        onChange={setNumTeams}
                        min={2} 
                        max={16}
                    />
                    <NumberStepper 
                        label={t('playersPerTeam')} 
                        value={playersPerTeam}
                        onChange={setPlayersPerTeam}
                        min={1}
                        max={11}
                    />
                </div>
                <div className="mt-8">
                    <button onClick={() => onGenerate(numTeams, playersPerTeam)} disabled={!canGenerate} className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white text-xl font-bold bg-[${AppColors.emeraldGreen}] hover:bg-[${AppColors.deepJade}] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${AppColors.emeraldGreen}] transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100`}>
                        {t('generateTeams')}
                    </button>
                    {!canGenerate && (
                        <p className="text-center text-red-600 mt-4">
                            تحتاج على الأقل {numTeams * playersPerTeam} لاعبين. لديك حاليا {players.length} لاعبين.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const IndividualSetupPage = ({ participants, setParticipants, onStart }) => {
    const { t, dir } = useTranslation();
    const [numParticipants, setNumParticipants] = useState(8);
    const [name, setName] = useState('');
    const [level, setLevel] = useState<Level>('متوسط');
    const [error, setError] = useState<string | null>(null);

    const isRTL = dir === 'rtl';
    const canStart = participants.length === numParticipants;

    useEffect(() => {
        if(error) setError(null);
    }, [name]);
    
    const handleAddParticipant = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (trimmedName) {
            if (participants.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
                setError(t('duplicatePlayerError'));
                return;
            }
            if (participants.length >= numParticipants) {
                 setError(`لا يمكن إضافة أكثر من ${numParticipants} مشارك.`);
                 return;
            }
            // Position is irrelevant, so assign a default
            const newParticipant: Player = { id: Date.now().toString(), name: trimmedName, level, position: 'جوكر' };
            setParticipants(prev => [...prev, newParticipant]);
            setName('');
        }
    };
    
    const handleDeleteParticipant = (id: string) => {
        setParticipants(prev => prev.filter(p => p.id !== id));
    };

    const getLevelIndicator = (level: Level) => {
        const baseClasses = "w-5 h-5";
        if (level === 'قوي') return <Icon name="star" className={`${baseClasses} text-yellow-500 fill-current`} />;
        if (level === 'متوسط') return <Icon name="filledCircle" className={`${baseClasses} text-blue-500`} />;
        return <Icon name="circle" className={`${baseClasses} text-gray-400`} />;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className={`p-8 bg-white rounded-lg shadow-lg border-t-4 border-[${AppColors.goldAccent}] max-w-4xl mx-auto`}>
                 <h1 className={`text-3xl font-bold mb-2 text-center text-[${AppColors.deepJade}]`}>{t('setupIndividualCompetition')}</h1>
                 <p className="text-center text-gray-600 mb-6">{t('forTeachersAndEducators')}</p>
                 <NumberStepper 
                    label={t('numberOfParticipants')}
                    value={numParticipants}
                    onChange={setNumParticipants}
                    min={8}
                    max={32}
                 />
                 <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <form onSubmit={handleAddParticipant} className="p-4 border rounded-lg">
                            <h2 className="text-xl font-bold mb-3">{t('addParticipant')}</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">{t('participantName')}</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md`} required />
                                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">{t('level')}</label>
                                <div className="flex justify-around mt-2">
                                    {(['ضعيف', 'متوسط', 'قوي'] as Level[]).map(l => (
                                        <label key={l} className="flex items-center gap-1 cursor-pointer text-sm">
                                            <input type="radio" name="level" value={l} checked={level === l} onChange={() => setLevel(l)} className={`form-radio h-4 w-4 text-[${AppColors.emeraldGreen}]`} />
                                            <span>{isRTL ? l : t(levelToKey[l])}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className={`w-full py-2 px-4 rounded-md text-white font-bold bg-[${AppColors.emeraldGreen}] hover:bg-[${AppColors.deepJade}]`}>{t('addParticipant')}</button>
                        </form>
                    </div>
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-bold mb-3">{t('participantList')} ({participants.length} / {numParticipants})</h2>
                         <div className="bg-gray-50 rounded-lg p-2 h-64 overflow-y-auto">
                            {participants.length > 0 ? (
                                <ul className="divide-y">
                                    {participants.map(p => (
                                        <li key={p.id} className="p-2 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                {getLevelIndicator(p.level)}
                                                <span>{p.name}</span>
                                            </div>
                                            <button onClick={() => handleDeleteParticipant(p.id)} className="text-red-500 hover:text-red-700">
                                                <Icon name="trash" className="w-5 h-5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-center text-gray-500 p-4">{t('noParticipants')}</p>}
                        </div>
                    </div>
                 </div>
                 <div className="mt-8">
                     <button onClick={() => onStart(participants)} disabled={!canStart} className={`w-full py-3 px-4 rounded-md text-white text-xl font-bold bg-[${AppColors.goldAccent}] hover:bg-[${AppColors.bronzeTint}] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed`}>
                        {t('startCompetition')}
                    </button>
                     {!canStart && <p className="text-center text-red-600 mt-2">تحتاج لإضافة {numParticipants - participants.length} مشاركين لبدء المسابقة.</p>}
                 </div>
            </div>
        </div>
    );
}

const ResultsPage = ({ teams, onRegenerate, onBack, onStartTournament, sport, onUpdateTeamName }) => {
    const { t, dir } = useTranslation();
    const isRTL = dir === 'rtl';

    const [scores, setScores] = useState<Record<number, number>>({});
    const [winningTeamId, setWinningTeamId] = useState<number | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
    const [editedName, setEditedName] = useState('');

    useEffect(() => {
        const initialScores: Record<number, number> = {};
        teams.forEach(team => {
            initialScores[team.id] = 0;
        });
        setScores(initialScores);
        setWinningTeamId(null);
        setShowConfetti(false);
    }, [teams]);

    const handleScoreChange = (teamId: number, delta: number) => {
        setScores(prev => ({
            ...prev,
            [teamId]: Math.max(0, prev[teamId] + delta)
        }));
    };

    const handleEndMatch = () => {
        let maxScore = -1;
        let winners: number[] = [];
        for (const teamId in scores) {
            if (scores[teamId] > maxScore) {
                maxScore = scores[teamId];
                winners = [parseInt(teamId)];
            } else if (scores[teamId] === maxScore) {
                winners.push(parseInt(teamId));
            }
        }
        if (winners.length === 1) {
            setWinningTeamId(winners[0]);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); // Hide after 5 seconds
        }
    };
    
    const handleEditNameStart = (team: Team) => {
        setEditingTeamId(team.id);
        setEditedName(team.name);
    };

    const handleEditNameCancel = () => {
        setEditingTeamId(null);
        setEditedName('');
    };

    const handleEditNameSave = () => {
        if (editingTeamId && editedName.trim()) {
            onUpdateTeamName(editingTeamId, editedName.trim());
        }
        setEditingTeamId(null);
        setEditedName('');
    };

    const teamStrength = useMemo(() => teams.map(team => 
        getAllStarters(team).reduce((acc, p) => acc + getLevelValue(p.level), 0)
    ), [teams]);
    
    const maxStrength = teamStrength.length > 0 ? Math.max(...teamStrength) : 0;
    const minStrength = teamStrength.length > 0 ? Math.min(...teamStrength) : 0;
    const diff = maxStrength - minStrength;

    const fairness = diff <= 1 ? t('veryBalanced') : diff <= 2 ? t('quiteBalanced') : t('needsSwap');
    const fairnessColor = diff <= 1 ? 'text-green-600' : diff <= 2 ? 'text-yellow-600' : 'text-red-600';
    
    const positionOrder = useMemo(() => {
        const order = POSITIONS_BY_SPORT[sport];
        return [...order, 'الأساسيون']; // Add generic for fallback
    }, [sport]);

    return (
        <div className="container mx-auto px-4 py-8">
            {showConfetti && <Confetti />}
            <div className="text-center mb-8">
                <h2 className={`text-2xl font-bold text-[${AppColors.deepJade}]`}>{t('fairnessRating')}</h2>
                <p className={`text-3xl font-bold ${fairnessColor}`}>{fairness}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team, index) => {
                    const allStarters = getAllStarters(team);
                    const isWinner = winningTeamId === team.id;
                    return (
                        <div key={team.id} className={`bg-white rounded-lg shadow-xl overflow-hidden flex flex-col transition-all duration-500 ${isWinner ? `ring-4 ring-offset-2 ring-[${AppColors.goldAccent}] scale-105` : ''}`} style={{borderTop: `8px solid hsl(${index * (360 / teams.length)}, 60%, 50%)`}}>
                            <div className="p-4 bg-gray-50 relative">
                                {editingTeamId === team.id ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="text-2xl font-bold text-center border-b-2 border-emeraldGreen focus:outline-none bg-transparent"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleEditNameSave();
                                                if (e.key === 'Escape') handleEditNameCancel();
                                            }}
                                        />
                                        <button onClick={handleEditNameSave} className="text-green-600 hover:text-green-800 p-1" aria-label={t('save')}><Icon name="save" className="w-5 h-5" /></button>
                                        <button onClick={handleEditNameCancel} className="text-gray-500 hover:text-gray-700 p-1" aria-label={t('cancel')}><Icon name="cancel" className="w-5 h-5" /></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 group">
                                        <h3 className="text-2xl font-bold text-center">{team.name}</h3>
                                        <button onClick={() => handleEditNameStart(team)} className="text-blue-500 hover:text-blue-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={t('edit')}>
                                            <Icon name="edit" className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                                {team.captain && (
                                    <p className="text-center text-gray-600 mt-1">
                                        <span className="font-semibold">{t('captain')}:</span> {team.captain.name}
                                    </p>
                                )}
                                <div className="absolute top-2 right-2 flex flex-col items-center">
                                    <span className="font-bold text-sm">{t('score')}</span>
                                    <span className="text-2xl font-bold text-deepJade">{scores[team.id] ?? 0}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-100 flex justify-center items-center gap-4">
                               <button onClick={() => handleScoreChange(team.id, -1)} disabled={winningTeamId !== null} className="w-10 h-10 rounded-full bg-red-500 text-white font-bold text-2xl disabled:bg-gray-300">-</button>
                               <button onClick={() => handleScoreChange(team.id, 1)} disabled={winningTeamId !== null} className="w-10 h-10 rounded-full bg-green-500 text-white font-bold text-2xl disabled:bg-gray-300">+</button>
                            </div>
                            <div className="p-4 flex-grow">
                                <h4 className="font-bold text-lg mb-2 text-deepJade border-b pb-1">{t('starters')} ({allStarters.length})</h4>
                                <div className="space-y-3">
                                     {positionOrder.map(position => {
                                        const playersInPosition = team.startersByPosition[position];
                                        if (!playersInPosition || playersInPosition.length === 0) return null;
                                        
                                        return (
                                            <div key={position}>
                                                <h5 className="font-semibold text-sm text-gray-700 uppercase">{isRTL ? position : t(position === 'الأساسيون' ? 'starters' : positionToKey[position as Position])}</h5>
                                                <ul className="pl-2 mt-1 space-y-1">
                                                    {playersInPosition.map(p => (
                                                        <li key={p.id} className="flex justify-between text-sm">
                                                            <span>{p.name}</span> 
                                                            <span className="text-gray-500">{isRTL ? p.level : t(levelToKey[p.level])}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {team.substitutes.length > 0 && (
                                <div className="p-4 border-t">
                                    <h4 className="font-bold text-lg mb-2 text-deepJade border-b pb-1">{t('substitutes')} ({team.substitutes.length})</h4>
                                    <ul className="space-y-1">
                                        {team.substitutes.map(p => <li key={p.id} className="flex justify-between"><span>{p.name}</span> <span className="text-gray-500">{isRTL ? p.level : t(levelToKey[p.level])}</span></li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
                <button onClick={onBack} className="px-6 py-2 rounded-md font-semibold text-charcoal bg-gray-200 hover:bg-gray-300 transition-colors">{t('backToSetup')}</button>
                <button onClick={onRegenerate} className={`px-6 py-2 rounded-md font-bold text-white transition-transform duration-200 transform hover:scale-105 shadow-lg bg-[${AppColors.emeraldGreen}] hover:bg-[${AppColors.deepJade}]`}>{t('regenerate')}</button>
                <button onClick={handleEndMatch} disabled={winningTeamId !== null} className={`px-6 py-2 rounded-md font-bold text-white transition-transform duration-200 transform hover:scale-105 shadow-lg bg-red-600 hover:bg-red-800 disabled:bg-gray-400`}>{t('endMatch')}</button>
                 {teams.length >= 2 && (
                    <button onClick={onStartTournament} className={`px-6 py-2 rounded-md font-bold text-white transition-transform duration-200 transform hover:scale-105 shadow-lg bg-[${AppColors.goldAccent}] hover:bg-[${AppColors.bronzeTint}]`}>
                        {t('startTournament')}
                    </button>
                )}
            </div>
        </div>
    );
};

const BracketPage = <T extends BracketItem>({ bracket, onSetWinner, onRedraw, onSetGoldenChanceWinner }: { bracket: Bracket<T> | null, onSetWinner: (roundIndex: number, matchIndex: number, winner: T) => void, onRedraw: () => void, onSetGoldenChanceWinner?: (winner: T) => void }) => {
    const { t } = useTranslation();
    const [canRedraw, setCanRedraw] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const [goldenChanceMatch, setGoldenChanceMatch] = useState<BracketMatch<T> | null>(null);
    const [byePlayer, setByePlayer] = useState<T | null>(null);
    const [round1Losers, setRound1Losers] = useState<T[]>([]);

    useEffect(() => {
        if (!bracket || !bracket[0]) return;
        const firstRound = bracket[0];
        const firstRoundStarted = firstRound.some(match => match.winner && !match.participants[1]?.isBye);
        setCanRedraw(!firstRoundStarted);

        const byeMatch = firstRound.find(m => m.participants[1]?.isBye);
        const playerWithBye = byeMatch ? (byeMatch.participants[0] as T) : null;
        setByePlayer(playerWithBye);
        
        if (!playerWithBye) {
            setRound1Losers([]);
            setGoldenChanceMatch(null);
            return;
        }

        const nonByeMatches = firstRound.filter(m => !m.participants[1]?.isBye);
        const allRound1MatchesPlayed = nonByeMatches.length > 0 && nonByeMatches.every(m => m.winner);

        if (allRound1MatchesPlayed) {
            const losers = nonByeMatches
                .map(m => m.participants.find(p => p && 'id' in p && p.id !== m.winner?.id) as T)
                .filter(Boolean);
            setRound1Losers(losers);
        } else {
            setRound1Losers([]);
        }

    }, [bracket]);

    const handleDrawLoser = () => {
        if (round1Losers.length > 0 && byePlayer) {
            const luckyLoser = shuffleArray(round1Losers)[0];
            setGoldenChanceMatch({
                id: 'gc-01',
                participants: [byePlayer, luckyLoser],
                winner: null
            });
            setRound1Losers([]); // Loser has been drawn, clear the pool
        }
    };
    
    const champion = bracket?.[bracket.length - 1]?.[0]?.winner;

    useEffect(() => {
      if (champion) {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
      }
    }, [champion]);
    
    if (!bracket || bracket.length === 0) {
        return <div className="text-center p-8">{t('noPlayers')}</div>;
    }

    const handleGoldenChanceWin = (winner: T) => {
        if (onSetGoldenChanceWinner) {
            onSetGoldenChanceWinner(winner);
        }
        setGoldenChanceMatch(prev => prev ? {...prev, winner} : null);
    }
    
    // --- New Horizontal Bracket Logic ---

    const MatchCard = ({ match, onDeclareWinner, canDeclare }) => {
        const isByeMatch = match.participants.some(p => p?.isBye);
        return (
            <div className="p-2 rounded-lg shadow-md border-l-4 border-emeraldGreen bg-white w-52 my-3">
                {match.participants.map((p, pIdx) => {
                    if (!p) return <div key={pIdx} className="p-2 text-sm text-gray-400">...</div>;
                    const participantName = p.name;
                    const isWinner = match.winner && 'id' in p && match.winner.id === p.id;
                    return (
                        <div key={pIdx} className={`flex items-center justify-between p-2 text-sm ${pIdx === 0 ? 'border-b border-gray-200' : ''} ${isWinner ? 'font-bold text-green-700' : ''}`}>
                            <span className="truncate">{participantName}</span>
                            {canDeclare && 'id' in p && !isByeMatch && (
                                <button onClick={() => onDeclareWinner(p)} className="text-xs text-white bg-emeraldGreen hover:bg-deepJade px-2 py-1 rounded transition-colors" title={t('declareWinner')}>🏆</button>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const numRounds = bracket.length;
    const finalRoundIndex = numRounds - 1;
    const leftColumns = [];
    const rightColumns = [];

    for (let i = 0; i < finalRoundIndex; i++) {
        const round = bracket[i];
        const mid = Math.ceil(round.length / 2);
        leftColumns.push(round.slice(0, mid));
        rightColumns.push(round.slice(mid));
    }
    const finalMatch = bracket[finalRoundIndex][0];

    return (
        <div className="container mx-auto px-2 py-8">
            {showConfetti && <Confetti />}
            <h1 className="text-3xl font-bold text-center mb-4 text-deepJade">{t('tournamentBracket')}</h1>
            
            {champion ? (
                 <div className="text-center mb-8 bg-warmSand p-6 rounded-lg shadow-lg border-2 border-goldAccent flex flex-col items-center">
                    <h2 className={`text-4xl font-bold text-[${AppColors.bronzeTint}]`}>{t('winner')}!</h2>
                    <div className="flex items-center gap-4 mt-2">
                        <Icon name="trophy" className={`w-12 h-12 text-[${AppColors.goldAccent}]`} />
                        <p className={`text-3xl text-[${AppColors.deepJade}]`}>{champion.name}</p>
                        <Icon name="trophy" className={`w-12 h-12 text-[${AppColors.goldAccent}]`} />
                    </div>
                </div>
            ) : (
                 <div className="flex justify-center mb-6">
                    <button onClick={onRedraw} disabled={!canRedraw} className={`px-6 py-2 rounded-md font-bold text-white transition-all shadow-lg bg-[${AppColors.emeraldGreen}] hover:bg-[${AppColors.deepJade}] disabled:bg-gray-400 disabled:cursor-not-allowed`}>
                        {t('redraw')}
                    </button>
                </div>
            )}

            {byePlayer && round1Losers.length > 0 && !goldenChanceMatch && onSetGoldenChanceWinner && (
                <div className="text-center mb-8 bg-yellow-100 p-4 rounded-lg shadow-md border-2 border-yellow-400">
                    <h3 className="text-2xl font-bold text-yellow-800">{t('goldenChance')}!</h3>
                    <p className="mt-2">{byePlayer.name} سيواجه خاسرًا محظوظًا من الجولة الأولى.</p>
                    <button onClick={handleDrawLoser} className={`mt-4 px-5 py-2 rounded-md font-bold text-white bg-[${AppColors.goldAccent}] hover:bg-[${AppColors.bronzeTint}]`}>{t('drawLoser')}</button>
                </div>
            )}

            {goldenChanceMatch && onSetGoldenChanceWinner && (
                 <div className="mb-8">
                     <h3 className="text-xl font-bold text-center mb-2 text-deepJade">{t('goldenChance')}</h3>
                     <div className="max-w-sm mx-auto p-3 rounded-lg shadow-md border-l-4 border-yellow-500 bg-white">
                         {goldenChanceMatch.participants.map((p, pIdx) => (
                             p && 'id' in p && <div key={pIdx} className="flex items-center justify-between p-2">
                                <span>{p?.name}</span>
                                 {!goldenChanceMatch.winner && (
                                    <button onClick={() => handleGoldenChanceWin(p as T)} className={`text-xs text-white px-2 py-1 rounded transition-colors bg-[${AppColors.goldAccent}] hover:bg-[${AppColors.bronzeTint}]`}>🏆 {t('declareWinner')}</button>
                                 )}
                             </div>
                         ))}
                         {goldenChanceMatch.winner && <p className="text-center font-bold mt-2 text-green-600">{t('winner')}: {goldenChanceMatch.winner.name}</p>}
                     </div>
                 </div>
            )}

            <div className="flex justify-between items-stretch w-full overflow-x-auto p-4 space-x-4 min-h-[50vh]">
                {/* Left Side */}
                <div className="flex items-center space-x-6 md:space-x-10">
                    {leftColumns.map((col, colIndex) => (
                        <div key={`left-col-${colIndex}`} className="flex flex-col justify-around h-full space-y-4">
                            <h3 className="text-center font-bold text-deepJade">{`${t('round')} ${colIndex + 1}`}</h3>
                            {col.map(match => {
                                const matchIndex = bracket[colIndex].findIndex(m => m.id === match.id);
                                return <MatchCard key={match.id} match={match} canDeclare={!match.winner} onDeclareWinner={(w) => onSetWinner(colIndex, matchIndex, w as T)} />;
                            })}
                        </div>
                    ))}
                </div>

                {/* Final */}
                <div className="flex flex-col items-center justify-center px-6 md:px-10">
                     <h3 className="text-center font-bold text-xl text-deepJade">{t('final')}</h3>
                     <MatchCard key={finalMatch.id} match={finalMatch} canDeclare={!finalMatch.winner} onDeclareWinner={(w) => onSetWinner(finalRoundIndex, 0, w as T)} />
                </div>

                {/* Right Side */}
                <div className="flex items-center space-x-6 md:space-x-10 flex-row-reverse">
                    {rightColumns.map((col, colIndex) => {
                        const originalRoundIndex = colIndex;
                        return (
                            <div key={`right-col-${originalRoundIndex}`} className="flex flex-col justify-around h-full space-y-4">
                                <h3 className="text-center font-bold text-deepJade">{`${t('round')} ${originalRoundIndex + 1}`}</h3>
                                {col.map(match => {
                                    const matchIndex = bracket[originalRoundIndex].findIndex(m => m.id === match.id);
                                    return <MatchCard key={match.id} match={match} canDeclare={!match.winner} onDeclareWinner={(w) => onSetWinner(originalRoundIndex, matchIndex, w as T)} />;
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const RouletteSetupPage = ({ participants, setParticipants, onStart }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const canStart = participants.length >= 2;

    useEffect(() => {
        if(error) setError(null);
    }, [name]);
    
    const handleAddParticipant = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (trimmedName) {
            if (participants.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
                setError(t('duplicatePlayerError'));
                return;
            }
            if (participants.length >= 99) {
                 setError(`لا يمكن إضافة أكثر من 99 مشارك.`);
                 return;
            }
            const newParticipant: BracketItem = { id: Date.now().toString(), name: trimmedName };
            setParticipants(prev => [...prev, newParticipant]);
            setName('');
        }
    };
    
    const handleDeleteParticipant = (id: string | number) => {
        setParticipants(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className={`p-8 bg-white rounded-lg shadow-lg border-t-4 border-purple-600 max-w-4xl mx-auto`}>
                 <h1 className={`text-3xl font-bold mb-2 text-center text-purple-800`}>{t('setupRoulette')}</h1>
                 <p className="text-center text-gray-600 mb-6">{t('addParticipantHelpText')}</p>
                 <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <form onSubmit={handleAddParticipant} className="p-4 border rounded-lg">
                            <h2 className="text-xl font-bold mb-3">{t('addParticipant')}</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">{t('participantName')}</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md`} required />
                                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                            </div>
                            <button type="submit" className={`w-full py-2 px-4 rounded-md text-white font-bold bg-purple-600 hover:bg-purple-800`}>{t('addParticipant')}</button>
                        </form>
                    </div>
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-bold mb-3">{t('participantList')} ({participants.length})</h2>
                         <div className="bg-gray-50 rounded-lg p-2 h-64 overflow-y-auto">
                            {participants.length > 0 ? (
                                <ul className="divide-y">
                                    {participants.map(p => (
                                        <li key={p.id} className="p-2 flex justify-between items-center">
                                            <span>{p.name}</span>
                                            <button onClick={() => handleDeleteParticipant(p.id)} className="text-red-500 hover:text-red-700">
                                                <Icon name="trash" className="w-5 h-5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-center text-gray-500 p-4">{t('noParticipants')}</p>}
                        </div>
                    </div>
                 </div>
                 <div className="mt-8">
                     <button onClick={onStart} disabled={!canStart} className={`w-full py-3 px-4 rounded-md text-white text-xl font-bold bg-purple-600 hover:bg-purple-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed`}>
                        {t('spinTheWheel')}
                    </button>
                     {!canStart && <p className="text-center text-red-600 mt-2">{t('min2Participants')}</p>}
                 </div>
            </div>
        </div>
    );
};

const RoulettePage = ({ participants, onDeleteWinner }) => {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<BracketItem | null>(null);
    const rotationRef = useRef(0);
    const spinTime = 8000; // 8 seconds for a spin
    const colors = ['#f87171', '#60a5fa', '#4ade80', '#fbbf24', '#a78bfa', '#f472b6', '#34d399', '#f9a8d4'];

    const drawWheel = useCallback((rotation = 0) => {
        const canvas = canvasRef.current;
        if (!canvas || participants.length === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = canvas.width / dpr;
        const logicalHeight = canvas.height / dpr;

        const centerX = logicalWidth / 2;
        const centerY = logicalHeight / 2;
        const radius = Math.min(logicalWidth, logicalHeight) / 2 * 0.9;
        
        const numParticipants = participants.length;
        const arcSize = 2 * Math.PI / numParticipants;

        ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);

        participants.forEach((p, i) => {
            const angle = i * arcSize;
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, angle, angle + arcSize);
            ctx.closePath();
            ctx.fill();

            ctx.save();
            ctx.rotate(angle + arcSize / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            const fontSize = Math.max(10, Math.min(18, radius / 10));
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.fillText(p.name, radius * 0.95, 0);
            ctx.restore();
        });

        ctx.restore();
    }, [participants]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        let animationFrameId: number;
        
        const handleResize = () => {
            // Debounce resize with requestAnimationFrame
            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                const rect = container.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                
                // Container is aspect-square, so width and height will be the same
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(dpr, dpr);
                }
                drawWheel(rotationRef.current);
            });
        };
        
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);
        
        // Initial draw
        handleResize();

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, [drawWheel]);

    const easeOut = (t: number, b: number, c: number, d: number) => {
        t /= d;
        t--;
        return c * (t * t * t + 1) + b;
    };

    const spin = () => {
        if (isSpinning || participants.length < 2) return;
        setIsSpinning(true);
        setWinner(null);

        const startAngle = rotationRef.current;
        const spinAngle = Math.random() * 10 + 10; // Random number of full rotations
        const totalAngle = startAngle + spinAngle * 2 * Math.PI;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            if (elapsedTime >= spinTime) {
                rotationRef.current = totalAngle;
                drawWheel(totalAngle);
                
                const finalAngle = totalAngle % (2 * Math.PI);
                const pointerAngle = (2 * Math.PI) - finalAngle + (Math.PI / 2);
                const arcSize = 2 * Math.PI / participants.length;
                const winnerIndex = Math.floor((pointerAngle % (2 * Math.PI)) / arcSize);
                
                setWinner(participants[winnerIndex]);
                setIsSpinning(false);
                return;
            }

            const currentAngle = easeOut(elapsedTime, startAngle, totalAngle - startAngle, spinTime);
            rotationRef.current = currentAngle;
            drawWheel(currentAngle);
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    };

    const handleClose = () => setWinner(null);
    const handleDelete = () => {
        if (winner) {
            onDeleteWinner(winner.id);
            setWinner(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center relative">
            <h1 className="text-3xl font-bold text-center mb-6 text-purple-800">{t('spinTheWheel')}</h1>
            <div ref={containerRef} className="relative w-full max-w-[500px] mx-auto aspect-square">
                <canvas ref={canvasRef} className="w-full h-full"></canvas>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2" style={{
                    width: '0', height: '0',
                    borderLeft: '20px solid transparent',
                    borderRight: '20px solid transparent',
                    borderTop: `30px solid ${AppColors.charcoal}`
                }}></div>
            </div>
            <button onClick={spin} disabled={isSpinning || participants.length < 2} className="mt-8 px-12 py-4 text-2xl font-bold text-white bg-purple-600 rounded-lg shadow-lg hover:bg-purple-800 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed">
                {t('spin')}
            </button>
            {winner && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl text-center">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('winnerIs')}</h2>
                        <p className="text-4xl font-bold text-purple-700 mb-6">{winner.name}</p>
                        <div className="flex gap-4">
                            <button onClick={handleClose} className="px-6 py-2 rounded-md font-semibold text-charcoal bg-gray-200 hover:bg-gray-300 transition-colors">{t('close')}</button>
                            <button onClick={handleDelete} className="px-6 py-2 rounded-md font-bold text-white bg-red-600 hover:bg-red-800 transition-colors">{t('deleteAndRespin')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const App = () => {
    const { t } = useTranslation();
    const [page, setPage] = useState<'home' | 'setup' | 'results' | 'teamTournament' | 'individualSetup' | 'individualTournament' | 'rouletteSetup' | 'rouletteSpin'>('home');
    const [players, setPlayers] = useState<Player[]>([]);
    const [participants, setParticipants] = useState<Player[]>([]); // For individual
    const [rouletteParticipants, setRouletteParticipants] = useState<BracketItem[]>([]); // For roulette
    const [teams, setTeams] = useState<Team[]>([]);
    const [sport, setSport] = useState<Sport>('كرة القدم');
    const [teamTournament, setTeamTournament] = useState<Bracket<Team> | null>(null);
    const [individualTournament, setIndividualTournament] = useState<Bracket<Player> | null>(null);

    const handleNavigate = (pageName: typeof page) => {
        setPage(pageName);
    };

    const handleGenerate = (numTeams: number, playersPerTeam: number) => {
        const generatedTeams = generateTeamsLogic(players, numTeams, playersPerTeam, sport, t);
        setTeams(generatedTeams);
        setTeamTournament(null); // Reset tournament on regeneration
        setPage('results');
    };

    const handleRegenerate = () => {
        const totalPlayersInTeams = teams.reduce((acc, team) => acc + getAllStarters(team).length + team.substitutes.length, 0);
        const playersPerTeam = teams.length > 0 ? Math.floor(totalPlayersInTeams / teams.length) : 0;
        handleGenerate(teams.length, playersPerTeam);
    };
    
    const handleUpdateTeamName = (teamId: number, newName: string) => {
        setTeams(prevTeams =>
            prevTeams.map(team =>
                team.id === teamId ? { ...team, name: newName } : team
            )
        );
    };

    const handleStartTournament = () => {
        const bracket = createBracket(teams);
        setTeamTournament(bracket);
        setPage('teamTournament');
    };
    
    const handleStartIndividualCompetition = (currentParticipants: Player[]) => {
        const bracket = createBracket(currentParticipants);
        setIndividualTournament(bracket);
        setPage('individualTournament');
    };

    const handleDeleteRouletteWinner = (winnerId: string | number) => {
        setRouletteParticipants(prev => prev.filter(p => p.id !== winnerId));
    };

    const handleSetWinner = (roundIndex: number, matchIndex: number, winner: Player | Team) => {
        const isIndividual = !!individualTournament;
        const currentBracket = isIndividual ? individualTournament : teamTournament;
        const setBracket = isIndividual ? setIndividualTournament as React.Dispatch<React.SetStateAction<Bracket<Player | Team> | null>> : setTeamTournament;

        if (!currentBracket) return;

        const newBracket = currentBracket.map(r => r.map(m => ({ ...m, participants: [...m.participants] as [any, any] })));

        const currentRound = newBracket[roundIndex];
        const match = { ...currentRound[matchIndex], winner: winner };
        currentRound[matchIndex] = match;

        // Advance winner to the next round
        if (roundIndex < newBracket.length - 1) {
            const nextRound = newBracket[roundIndex + 1];
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const nextMatch = { ...nextRound[nextMatchIndex] };
            const participantIndex = matchIndex % 2;
            nextMatch.participants[participantIndex] = winner;
            nextRound[nextMatchIndex] = nextMatch;
        }

        setBracket(newBracket);
    };

    const handleRedraw = (type: 'team' | 'individual') => {
        if (type === 'team') {
            setTeamTournament(createBracket(teams));
        } else {
            setIndividualTournament(createBracket(participants));
        }
    };
    
    const handleSetGoldenChanceWinner = (winner: Player | Team) => {
        const isIndividual = !!individualTournament;
        const currentBracket = isIndividual ? individualTournament : teamTournament;
        const setBracket = isIndividual ? setIndividualTournament as React.Dispatch<React.SetStateAction<Bracket<Player | Team> | null>> : setTeamTournament;
    
        if (!currentBracket || !currentBracket[0] || !currentBracket[1]) return;
    
        const byeMatch = currentBracket[0].find(m => m.participants[1]?.isBye);
        const byePlayer = byeMatch?.participants[0];
    
        if (!byePlayer || typeof byePlayer === 'string' || !('id' in byePlayer)) return;
    
        const newBracket = currentBracket.map(round =>
            round.map(match => ({
                ...match,
                participants: [...match.participants] as [any, any]
            }))
        );
    
        const round2 = newBracket[1];
        const matchToUpdateIndex = round2.findIndex(match =>
            match.participants.some(p => p?.id === byePlayer.id)
        );
    
        if (matchToUpdateIndex > -1) {
            const matchToUpdate = round2[matchToUpdateIndex];
            const participantIndex = matchToUpdate.participants.findIndex(p => p?.id === byePlayer.id);
    
            if (participantIndex > -1) {
                matchToUpdate.participants[participantIndex] = winner;
            }
        }
        
        setBracket(newBracket);
    };


    const renderPage = () => {
        switch (page) {
            case 'home':
                return <HomePage onNavigate={handleNavigate} />;
            case 'setup':
                return (
                    <div>
                        <PlayerPage players={players} setPlayers={setPlayers} sport={sport} />
                        <SetupPage onGenerate={handleGenerate} players={players} />
                    </div>
                );
            case 'individualSetup':
                return <IndividualSetupPage participants={participants} setParticipants={setParticipants} onStart={handleStartIndividualCompetition} />;
            case 'results':
                return <ResultsPage teams={teams} onRegenerate={handleRegenerate} onBack={() => setPage('setup')} onStartTournament={handleStartTournament} sport={sport} onUpdateTeamName={handleUpdateTeamName}/>;
            case 'teamTournament':
                return teamTournament ? (
                     <BracketPage<Team>
                        bracket={teamTournament}
                        onSetWinner={(r, m, w) => handleSetWinner(r, m, w)}
                        onRedraw={() => handleRedraw('team')}
                        onSetGoldenChanceWinner={handleSetGoldenChanceWinner}
                    />
                ) : null;
             case 'individualTournament':
                return individualTournament ? (
                     <BracketPage<Player>
                        bracket={individualTournament}
                        onSetWinner={(r, m, w) => handleSetWinner(r, m, w)}
                        onRedraw={() => handleRedraw('individual')}
                        onSetGoldenChanceWinner={handleSetGoldenChanceWinner}
                    />
                ) : null;
            case 'rouletteSetup':
                return <RouletteSetupPage participants={rouletteParticipants} setParticipants={setRouletteParticipants} onStart={() => handleNavigate('rouletteSpin')} />;
            case 'rouletteSpin':
                return <RoulettePage participants={rouletteParticipants} onDeleteWinner={handleDeleteRouletteWinner} />;
            default:
                return <HomePage onNavigate={handleNavigate} />;
        }
    };
    
    return (
        <div className={`min-h-screen flex flex-col font-${useTranslation().dir === 'rtl' ? 'cairo' : 'poppins'}`}>
            <Header onNavigate={handleNavigate} currentPage={page} sport={sport} setSport={setSport} teamTournament={!!teamTournament} individualTournament={!!individualTournament}/>
            <main className="flex-grow">
                {renderPage()}
            </main>
            <Footer />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
        <App />
    </LanguageProvider>
  </React.StrictMode>
);
