// ─── IJEBU FORUM ABUJA — FULL STACK REACT APP ────────────────────────────────
// Connect to backend: set REACT_APP_API_URL=https://your-api.render.com/api
// Or use the standalone demo mode (no backend required)

import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || null;
const DEMO_MODE = !API_BASE; // Falls back to demo mode if no backend URL

// ─── INLINE API LAYER (works with or without backend) ────────────────────────
const getToken = () => { try { return localStorage.getItem('ifa_token'); } catch { return null; } };
const setToken = t => { try { localStorage.setItem('ifa_token', t); } catch {} };
const clearToken = () => { try { localStorage.removeItem('ifa_token'); } catch {} };

const apiFetch = async (method, path, body, formData) => {
  if (DEMO_MODE) throw new Error('DEMO_MODE');
  const token = getToken();
  const res = await fetch(API_BASE + path, {
    method,
    headers: formData
      ? (token ? { Authorization: 'Bearer ' + token } : {})
      : { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: formData ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const API = {
  login: (id, pw) => apiFetch('POST', '/auth/login', { identifier: id, password: pw }).then(d => { setToken(d.token); return d; }),
  me: () => apiFetch('GET', '/auth/me'),
  getMembers: () => apiFetch('GET', '/members'),
  createMember: fd => apiFetch('POST', '/members', fd, true),
  updateMember: (id, d) => apiFetch('PUT', '/members/' + id, d),
  uploadPhoto: (id, fd) => apiFetch('POST', '/members/' + id + '/photo', fd, true),
  approveMember: id => apiFetch('POST', '/members/' + id + '/approve'),
  rejectMember: id => apiFetch('POST', '/members/' + id + '/reject'),
  suspendMember: id => apiFetch('POST', '/members/' + id + '/suspend'),
  activateMember: id => apiFetch('POST', '/members/' + id + '/activate'),
  deleteMember: id => apiFetch('DELETE', '/members/' + id),
  markAttendance: (mId, status, method, lat, lng) => apiFetch('POST', '/attendance/mark', { memberId: mId, status, method, lat, lng }),
  getAttReport: () => apiFetch('GET', '/attendance/report'),
  getTasks: () => apiFetch('GET', '/tasks'),
  createTask: d => apiFetch('POST', '/tasks', d),
  completeTask: id => apiFetch('PUT', '/tasks/' + id, { status: 'done' }),
  deleteTask: id => apiFetch('DELETE', '/tasks/' + id),
  getSummary: () => apiFetch('GET', '/finance/summary'),
  getTransactions: () => apiFetch('GET', '/finance/transactions'),
  payDues: () => apiFetch('POST', '/finance/dues'),
  contribute: (amt, purpose) => apiFetch('POST', '/finance/contribute', { amt, purpose }),
  recordTxn: d => apiFetch('POST', '/finance/transactions', d),
  getAnns: () => apiFetch('GET', '/announcements'),
  createAnn: d => apiFetch('POST', '/announcements', d),
  deleteAnn: id => apiFetch('DELETE', '/announcements/' + id),
  getEvents: () => apiFetch('GET', '/events'),
  createEvent: d => apiFetch('POST', '/events', d),
  rsvpEvent: id => apiFetch('POST', '/events/' + id + '/rsvp'),
  deleteEvent: id => apiFetch('DELETE', '/events/' + id),
  getPolls: () => apiFetch('GET', '/polls'),
  createPoll: d => apiFetch('POST', '/polls', d),
  vote: (id, oi) => apiFetch('POST', '/polls/' + id + '/vote', { optionIndex: oi }),
  deletePoll: id => apiFetch('DELETE', '/polls/' + id),
  getChat: ch => apiFetch('GET', '/chat/' + ch),
  sendMsg: (ch, txt) => apiFetch('POST', '/chat/' + ch, { txt }),
  getComplaints: () => apiFetch('GET', '/complaints'),
  fileComplaint: d => apiFetch('POST', '/complaints', d),
  updateComplaint: (id, d) => apiFetch('PUT', '/complaints/' + id, d),
  deleteComplaint: id => apiFetch('DELETE', '/complaints/' + id),
  getNotifs: () => apiFetch('GET', '/notifications'),
  markRead: id => apiFetch('PUT', '/notifications/' + id + '/read'),
  ackBirthday: () => apiFetch('POST', '/notifications/birthday-ack'),
  getTodayBdays: () => apiFetch('GET', '/birthdays/today'),
  getLeaderboard: () => apiFetch('GET', '/leaderboard'),
  register: fd => apiFetch('POST', '/auth/register', fd, true),
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const ROLES = {president:'President','vice-president':'Vice President',secretary:'General Secretary',treasurer:'Treasurer','financial-secretary':'Financial Secretary',welfare:'Welfare Officer','social-welfare':'Social Welfare',pro:'PR Officer','chief-whip':'Chief Whip',exofficio:'Ex-Officio',trustees:'Board of Trustees',member:'Member'};
const rl = r => ROLES[r]||'Member';
const ini = n => (n||'').split(' ').slice(0,2).map(x=>x[0]||'').join('').toUpperCase();
const lvlI = p => p>=1000?{lbl:'Diamond',np:1000,pp:1000,next:null}:p>=500?{lbl:'Gold',np:1000,pp:500,next:'Diamond'}:p>=200?{lbl:'Silver',np:500,pp:200,next:'Gold'}:{lbl:'Bronze',np:200,pp:0,next:'Silver'};
const lvlE = p => p>=1000?'\U0001f48e':p>=500?'\U0001f947':p>=200?'\U0001f948':'\U0001f949';
const today = () => new Date().toISOString().split('T')[0];
const nowT = () => { const n=new Date(); return n.getHours()+':'+String(n.getMinutes()).padStart(2,'0'); };
const fmtD = s => s?new Date(s).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'--';
const daysTo = s => Math.ceil((new Date(s)-new Date())/86400000);
const mkId = n => 'IFA-'+String(n).padStart(4,'0');
const barBits = id => { const c=(id||'').replace(/[^A-Z0-9]/g,'');const b=[];for(let i=0;i<c.length;i++){const v=c.charCodeAt(i);b.push({w:v%2+1,h:28+v%18});b.push({w:1,h:18+v%14});}for(let i=0;i<18;i++)b.push({w:1+i%2,h:22+(i*7)%18});return b;};
const nextSun2 = () => { let d=new Date(),n=new Date(d.getFullYear(),d.getMonth(),1);while(n.getDay()!==0)n.setDate(n.getDate()+1);n.setDate(n.getDate()+7);if(n<d){n=new Date(d.getFullYear(),d.getMonth()+1,1);while(n.getDay()!==0)n.setDate(n.getDate()+1);n.setDate(n.getDate()+7);}return n;};
const PRAYERS = [
  "May this new year of your life overflow with God's abundant blessings, good health, and boundless joy! Amen.",
  "As you clock another year, may doors of greatness open for you that no man can shut. Happy Birthday!",
  "May today mark the beginning of your best season yet. You are loved and celebrated by Ijebu Forum Abuja!",
  "The Lord who brought you this far will never abandon you. Wishing you a wonderful birthday filled with God's goodness!"
];
const GEO = {lat:9.0579,lng:7.4951,name:'Transcorp Hilton, Abuja',radius:50};

const SEED_M = [
  {id:'IFA-0001',name:'Adebayo Kolawole',role:'president',des:'Chief',prof:'Businessman',phone:'08012345678',email:'adebayo@ijebu.ng',addr:'Plot 45 Maitama, Abuja',town:'Ijebu-Ode',dobDay:'15',dobMonth:'March',dobYear:'1968',nok:'Mrs Adebayo',nokP:'08012345679',nokR:'Spouse',pts:780,streak:6,att:['present','present','present','present','present','present'],tdone:12,joined:'2020-01-15',status:'active',photo:null,method:'geo',fn:'Adebayo',ln:'Kolawole',on:''},
  {id:'IFA-0002',name:'Folasade Akinwande',role:'vice-president',des:'Dr.',prof:'Medical Doctor',phone:'08023456789',email:'folasade@ijebu.ng',addr:'7 Garki Area 11, Abuja',town:'Ago-Iwoye',dobDay:'22',dobMonth:'July',dobYear:'1972',nok:'Mr Akinwande',nokP:'08023456780',nokR:'Spouse',pts:650,streak:5,att:['present','present','absent','present','present','present'],tdone:9,joined:'2020-02-10',status:'active',photo:null,method:'geo',fn:'Folasade',ln:'Akinwande',on:''},
  {id:'IFA-0003',name:'Olusegun Bamidele',role:'secretary',des:'Engr.',prof:'Civil Engineer',phone:'08034567890',email:'olusegun@ijebu.ng',addr:'22 Wuse Zone 4, Abuja',town:'Ijebu-Igbo',dobDay:'8',dobMonth:'November',dobYear:'1975',nok:'Cynthia Bamidele',nokP:'08034567891',nokR:'Spouse',pts:590,streak:4,att:['present','excuse','present','present','present','present'],tdone:8,joined:'2020-03-05',status:'active',photo:null,method:'scan',fn:'Olusegun',ln:'Bamidele',on:''},
  {id:'IFA-0004',name:'Taiwo Odusanya',role:'treasurer',des:'',prof:'Accountant',phone:'08045678901',email:'taiwo@ijebu.ng',addr:'5 Lugbe Estate, Abuja',town:'Ijebu-Ode',dobDay:'4',dobMonth:'June',dobYear:'1980',nok:'Kehinde Odusanya',nokP:'08045678902',nokR:'Twin',pts:420,streak:3,att:['present','present','present','absent','present','excuse'],tdone:6,joined:'2020-06-20',status:'active',photo:null,method:'biometric',fn:'Taiwo',ln:'Odusanya',on:''},
  {id:'IFA-0005',name:'Abimbola Fashola',role:'welfare',des:'Mrs.',prof:'Teacher',phone:'08056789012',email:'abimbola@ijebu.ng',addr:'10 Gwarimpa, Abuja',town:'Sagamu',dobDay:'17',dobMonth:'January',dobYear:'1983',nok:'Tunde Fashola',nokP:'08056789013',nokR:'Spouse',pts:380,streak:2,att:['absent','present','present','present','present','absent'],tdone:5,joined:'2020-08-12',status:'active',photo:null,method:'geo',fn:'Abimbola',ln:'Fashola',on:''},
  {id:'IFA-0006',name:'Babatunde Oguns',role:'pro',des:'',prof:'PR Consultant',phone:'08067890123',email:'babatunde@ijebu.ng',addr:'3 Life Camp, Abuja',town:'Ijebu-Mushin',dobDay:'30',dobMonth:'August',dobYear:'1985',nok:'Grace Oguns',nokP:'08067890124',nokR:'Spouse',pts:310,streak:2,att:['present','present','absent','absent','present','present'],tdone:4,joined:'2020-11-03',status:'active',photo:null,method:'scan',fn:'Babatunde',ln:'Oguns',on:''},
  {id:'IFA-0007',name:'Kehinde Afolabi',role:'social-welfare',des:'',prof:'Social Worker',phone:'08078901234',email:'kehinde@ijebu.ng',addr:'8 Kubwa, Abuja',town:'Ijebu-Ode',dobDay:'12',dobMonth:'December',dobYear:'1988',nok:'Taiwo Afolabi',nokP:'08078901235',nokR:'Twin',pts:270,streak:1,att:['present','absent','present','present','absent','present'],tdone:3,joined:'2021-01-08',status:'active',photo:null,method:'geo',fn:'Kehinde',ln:'Afolabi',on:''},
  {id:'IFA-0008',name:'Monsurat Lawal',role:'chief-whip',des:'',prof:'Lawyer',phone:'08089012345',email:'monsurat@ijebu.ng',addr:'12 Asokoro, Abuja',town:'Ago-Iwoye',dobDay:'5',dobMonth:'May',dobYear:'1979',nok:'Alhaji Lawal',nokP:'08089012346',nokR:'Spouse',pts:450,streak:3,att:['present','present','present','present','excuse','present'],tdone:7,joined:'2021-02-15',status:'active',photo:null,method:'biometric',fn:'Monsurat',ln:'Lawal',on:''},
  {id:'IFA-0009',name:'Rotimi Adeyemi',role:'exofficio',des:'Hon.',prof:'Politician',phone:'08090123456',email:'rotimi@ijebu.ng',addr:'Plot 1 Jabi, Abuja',town:'Ijebu-Ode',dobDay:'20',dobMonth:'March',dobYear:'1965',nok:'Chief Mrs Adeyemi',nokP:'08090123457',nokR:'Spouse',pts:520,streak:4,att:['present','present','present','excuse','present','present'],tdone:5,joined:'2020-03-01',status:'active',photo:null,method:'scan',fn:'Rotimi',ln:'Adeyemi',on:''},
  {id:'IFA-0010',name:'Oluwakemi Bello',role:'trustees',des:'Prof.',prof:'Professor',phone:'08001234567',email:'oluwakemi@ijebu.ng',addr:'4 Utako, Abuja',town:'Ijebu-Igbo',dobDay:'10',dobMonth:'October',dobYear:'1960',nok:'Mr Bello',nokP:'08001234568',nokR:'Spouse',pts:890,streak:7,att:['present','present','present','present','present','present'],tdone:15,joined:'2020-01-10',status:'active',photo:null,method:'geo',fn:'Oluwakemi',ln:'Bello',on:''},
  {id:'IFA-0011',name:'Adewale Johnson',role:'member',des:'',prof:'Trader',phone:'08011112222',email:'adewale@ijebu.ng',addr:'22 Nyanya, Abuja',town:'Ijebu-Ode',dobDay:'3',dobMonth:'September',dobYear:'1990',nok:'Shade Johnson',nokP:'08011112223',nokR:'Spouse',pts:180,streak:1,att:['absent','present','present','absent','present','present'],tdone:2,joined:'2022-01-20',status:'active',photo:null,method:'scan',fn:'Adewale',ln:'Johnson',on:''},
  {id:'IFA-0012',name:'Simisola Okafor',role:'member',des:'',prof:'Nurse',phone:'08022223333',email:'simisola@ijebu.ng',addr:'5 Kado Estate, Abuja',town:'Ijebu-Ife',dobDay:'28',dobMonth:'February',dobYear:'1993',nok:'Mr Okafor',nokP:'08022223334',nokR:'Spouse',pts:210,streak:2,att:['present','present','absent','present','present','absent'],tdone:3,joined:'2022-03-15',status:'active',photo:null,method:'biometric',fn:'Simisola',ln:'Okafor',on:''},
];

const SEED_T = [
  {id:1,title:'Coordinate July meeting logistics',desc:'Arrange hall, PA system and refreshments.',assignee:'IFA-0003',priority:'high',due:'2026-07-10',status:'done',by:'IFA-0001'},
  {id:2,title:'Compile welfare list for Q3',desc:'Prepare list of members needing welfare support.',assignee:'IFA-0005',priority:'medium',due:'2026-07-25',status:'pending',by:'IFA-0001'},
  {id:3,title:'Draft mid-year budget review',desc:'Prepare mid-year budget review for 2026.',assignee:'IFA-0004',priority:'high',due:'2026-08-01',status:'inprogress',by:'IFA-0001'},
  {id:4,title:'Update member register',desc:'Update register with new joiners and contact changes.',assignee:'IFA-0003',priority:'medium',due:'2026-07-20',status:'pending',by:'IFA-0001'},
];
const SEED_A = [
  {id:1,title:'Forum Meeting - July 2026',body:'Monthly meeting holds Sunday 12th July 2026 at 2PM. Venue: Transcorp Hilton Conference Room B, Abuja.',priority:'important',author:'Secretary',date:'2026-07-01'},
  {id:2,title:'Annual Thanksgiving Celebration',body:'Annual thanksgiving dinner holds Saturday 28th December 2026 at Nicon Luxury Hotel. Black tie event.',priority:'normal',author:'President',date:'2026-06-20'},
  {id:3,title:'Welfare Appeal - Alhaja Rashidat',body:'Members urged to support Alhaja Rashidat Adeyemi who was recently bereaved. Contribute via Finance page.',priority:'urgent',author:'Welfare Officer',date:'2026-07-01'},
];
const SEED_E = [
  {id:1,title:'Monthly Forum Meeting',date:'2026-07-12',time:'14:00',venue:'Transcorp Hilton, Abuja',desc:'Regular monthly meeting of all members.',upcoming:true},
  {id:2,title:'Annual Thanksgiving Dinner',date:'2026-12-28',time:'18:00',venue:'Nicon Luxury Hotel, Abuja',desc:'Annual celebration. Black tie event.',upcoming:true},
  {id:3,title:'Ijebu Day Celebrations',date:'2026-09-20',time:'10:00',venue:'AICC, Abuja',desc:'Annual Ijebu Day celebration.',upcoming:true},
  {id:4,title:'Forum Meeting - May 2026',date:'2026-05-11',time:'14:00',venue:'Transcorp Hilton, Abuja',desc:'Past meeting.',upcoming:false},
];
const SEED_P = [
  {id:1,q:'Should monthly dues increase to N3,000 from October 2026?',opts:[{t:'Yes - N3,000',v:7},{t:'No - keep N2,000',v:4},{t:'Yes but N2,500',v:3}],end:'2026-07-31',voters:[]},
  {id:2,q:'Should the forum hold bi-monthly instead of monthly meetings?',opts:[{t:'Yes, every 2 months',v:5},{t:'No, keep monthly',v:8}],end:'2026-07-25',voters:[]},
];
const SEED_TX = [
  {id:1,desc:'Registration Fee - Adewale Johnson',type:'cr',amt:10000,date:'2026-01-15',cat:'registration'},
  {id:2,desc:'Monthly Dues - Adebayo Kolawole',type:'cr',amt:2000,date:'2026-07-01',cat:'dues'},
  {id:3,desc:'Monthly Dues - Folasade Akinwande',type:'cr',amt:2000,date:'2026-07-01',cat:'dues'},
  {id:4,desc:'Event Decoration - July Meeting',type:'db',amt:15000,date:'2026-07-05',cat:'event'},
  {id:5,desc:'Welfare Support - Bereaved Member',type:'db',amt:30000,date:'2026-07-02',cat:'welfare'},
  {id:6,desc:'External Sponsorship - Alhaji Muritala',type:'cr',amt:100000,date:'2026-06-20',cat:'donation'},
];
const SEED_CANDS = [
  {id:1,name:'Adebayo Kolawole',pos:'President',bio:'Incumbent president seeking second term. 6 years of dedicated service.'},
  {id:2,name:'Hon. Rotimi Adeyemi',pos:'President',bio:'Ex-officio with 10+ years in Ijebu community leadership.'},
  {id:3,name:'Dr. Folasade Akinwande',pos:'Vice President',bio:'Current VP, medical professional with strong welfare focus.'},
  {id:4,name:'Monsurat Lawal',pos:'Vice President',bio:'Chief Whip with legal background and excellent conflict resolution.'},
  {id:5,name:'Engr. Olusegun Bamidele',pos:'General Secretary',bio:'Current secretary with impeccable record-keeping skills.'},
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.app{font-family:'DM Sans',sans-serif;width:100%;max-width:430px;margin:0 auto;height:100vh;display:flex;flex-direction:column;background:#f0f4f0;position:relative;overflow:hidden}
.scroll{flex:1;overflow-y:auto;padding:12px 12px 80px;scrollbar-width:thin}
.scroll::-webkit-scrollbar{width:3px}.scroll::-webkit-scrollbar-thumb{background:#c8ddc8;border-radius:10px}
.tb{background:#14532d;color:#fff;padding:11px 14px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;box-shadow:0 2px 10px rgba(20,83,45,.35)}
.tbL,.tbR{display:flex;align-items:center;gap:10px}
.mbtn{background:rgba(255,255,255,.15);border:none;color:#fff;width:36px;height:36px;border-radius:8px;cursor:pointer;font-size:1.1rem}
.tbtitle{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700}
.nbell{position:relative;cursor:pointer;font-size:1.2rem;padding:2px}
.ndot{position:absolute;top:-4px;right:-4px;background:#dc2626;color:#fff;border-radius:50%;width:16px;height:16px;font-size:.58rem;font-weight:700;display:flex;align-items:center;justify-content:center}
.uav{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#166534);color:#fff;font-weight:700;font-size:.78rem;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid rgba(255,255,255,.3);flex-shrink:0;overflow:hidden}
.uav img{width:100%;height:100%;object-fit:cover}
.splash{flex:1;background:#14532d;display:flex;align-items:center;justify-content:center;text-align:center;padding:32px 20px;position:relative;overflow:hidden}
.splash::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 30% 20%,#166534,#0f3d20)}
.splZ{position:relative;z-index:1;width:100%}
.lring{width:88px;height:88px;border-radius:50%;border:3px solid rgba(34,197,94,.4);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;animation:pulse 2s ease infinite}
.linner{width:66px;height:66px;background:linear-gradient(135deg,#22c55e,#16a34a);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:0 4px 18px rgba(34,197,94,.5)}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
.stitle{font-family:'Playfair Display',serif;font-size:2.1rem;font-weight:900;color:#fff;margin-bottom:3px}
.ssub{color:#86efac;font-size:.85rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px}
.stag{color:rgba(255,255,255,.5);font-size:.76rem;margin-bottom:28px}
.sbtns{display:flex;gap:10px;justify-content:center}
.btnP{background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none;padding:12px 24px;border-radius:50px;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(34,197,94,.4);transition:transform .2s}
.btnP:hover{transform:translateY(-2px)}.btnP.fw{width:100%;border-radius:11px;padding:12px}
.btnO{background:transparent;color:#22c55e;border:2px solid #22c55e;padding:10px 20px;border-radius:50px;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:600;cursor:pointer}
.btnO.fw{width:100%;border-radius:11px;margin-top:7px}
.btnS{border:none;padding:5px 11px;border-radius:20px;font-size:.72rem;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif}
.btnS.g{background:#dcfce7;color:#166534}.btnS.r{background:#fee2e2;color:#dc2626}.btnS.a{background:#fef3c7;color:#92400e}.btnS.gr{background:#22c55e;color:#fff}.btnS.b{background:#dbeafe;color:#1e40af}
.blogout{background:rgba(220,38,38,.08);color:#dc2626;border:1px solid rgba(220,38,38,.2);width:100%;padding:11px;border-radius:10px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;margin-top:8px}
.fscr{display:flex;flex-direction:column;flex:1;overflow:hidden}
.fhdr{background:#14532d;color:#fff;padding:13px 15px;display:flex;align-items:center;gap:11px;flex-shrink:0}
.fhdr h2{font-family:'Playfair Display',serif;font-size:1.15rem}
.bbtn{background:rgba(255,255,255,.15);border:none;color:#fff;padding:7px 12px;border-radius:7px;cursor:pointer}
.fbody{background:#fff;border-radius:16px;margin:13px;padding:18px;box-shadow:0 2px 12px rgba(20,83,45,.08);overflow-y:auto;flex:1}
.fsec{font-weight:700;color:#14532d;font-size:.74rem;text-transform:uppercase;letter-spacing:1px;margin:16px 0 9px;padding-bottom:5px;border-bottom:2px solid #dcfce7}
.fg{margin-bottom:13px}
.fg label{display:block;font-size:.72rem;font-weight:600;color:#6b7c6b;margin-bottom:5px;text-transform:uppercase;letter-spacing:.4px}
.fg input,.fg select,.fg textarea{width:100%;padding:10px 12px;border:2px solid #e2f0e2;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.88rem;color:#1a2e1a;background:#fafcfa;outline:none;transition:border-color .2s}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:#22c55e}
.fg textarea{resize:vertical;min-height:70px}
.r2{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.r3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px}
.hint{font-size:.74rem;color:#166534;margin:7px 0;background:#dcfce7;padding:8px 12px;border-radius:9px;line-height:1.5}
.flink{text-align:center;color:#166534;font-size:.85rem;cursor:pointer;margin-top:9px;font-weight:500}
.smenu{position:absolute;top:0;left:0;width:265px;height:100%;background:#fff;z-index:300;transform:translateX(-265px);transition:transform .27s ease;box-shadow:4px 0 18px rgba(0,0,0,.1);display:flex;flex-direction:column}
.smenu.open{transform:translateX(0)}
.mov{display:none;position:absolute;inset:0;background:rgba(0,0,0,.35);z-index:299}.mov.show{display:block}
.mhdr{background:linear-gradient(135deg,#14532d,#166534);padding:18px 13px;color:#fff;display:flex;align-items:center;gap:11px;flex-shrink:0}
.mavbig{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.32);color:#fff;font-weight:700;font-size:.95rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
.mavbig img{width:100%;height:100%;object-fit:cover;border-radius:50%}
.mnm{font-weight:700;font-size:.9rem}.mrl{font-size:.7rem;color:rgba(255,255,255,.7);margin-top:2px}.mpts{font-size:.75rem;color:#86efac;margin-top:3px}
.mnav{flex:1;overflow-y:auto;padding:5px 0}
.mi{display:flex;align-items:center;padding:11px 15px;color:#1a2e1a;font-size:.86rem;cursor:pointer;transition:all .2s;border-left:3px solid transparent;gap:9px}
.mi:hover,.mi.on{background:#dcfce7;color:#14532d;border-left-color:#22c55e;font-weight:600}
.mic{width:19px;text-align:center}
.bnav{position:absolute;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e2f0e2;display:flex;z-index:100}
.bn{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border:none;background:transparent;cursor:pointer;color:#6b7c6b;font-size:.58rem;font-family:'DM Sans',sans-serif;font-weight:600}
.bn .bi{font-size:1.2rem}.bn.on{color:#14532d}
.card{background:#fff;border-radius:13px;padding:13px;margin-bottom:9px;box-shadow:0 1px 9px rgba(20,83,45,.07)}
.cardG{background:linear-gradient(135deg,#14532d,#166534);color:#fff;border-radius:13px;padding:15px;margin-bottom:9px}
.cardB{background:linear-gradient(135deg,#1e40af,#1d4ed8);color:#fff;border-radius:13px;padding:15px;margin-bottom:9px}
.cardY{background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:13px;padding:13px;margin-bottom:9px}
.sec{font-weight:700;font-size:.76rem;color:#14532d;text-transform:uppercase;letter-spacing:.7px;margin:13px 0 7px}
.s4{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:9px}
.sc{background:#fff;border-radius:11px;padding:10px 5px;text-align:center;cursor:pointer;box-shadow:0 1px 7px rgba(20,83,45,.07)}
.si{font-size:1.15rem;margin-bottom:2px}.sv{font-size:.9rem;font-weight:700;color:#14532d}.sl{font-size:.56rem;color:#6b7c6b;margin-top:1px}
.xpt{background:#e2f0e2;border-radius:20px;height:9px;overflow:hidden;margin:6px 0}
.xpf{height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);border-radius:20px;transition:width .8s}
.xpr{display:flex;justify-content:space-between;font-size:.7rem;color:#6b7c6b}
.qa{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:4px}
.qab{background:#fff;border:2px solid #e2f0e2;border-radius:12px;padding:11px 5px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;transition:border-color .2s;box-shadow:0 1px 7px rgba(20,83,45,.06)}
.qab:hover{border-color:#22c55e;background:#dcfce7}
.qai{font-size:1.35rem}.qal{font-size:.62rem;font-weight:600;color:#14532d}
.tabs{display:flex;background:#fff;border-radius:11px;padding:3px;margin-bottom:9px;gap:3px;box-shadow:0 1px 7px rgba(20,83,45,.07);flex-wrap:wrap}
.tb2{flex:1;padding:7px 5px;border:none;background:transparent;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.72rem;font-weight:600;color:#6b7c6b;cursor:pointer;white-space:nowrap;min-width:0}
.tb2.on{background:#14532d;color:#fff}
.ac{background:#fff;border-radius:11px;padding:12px;margin-bottom:7px;border-left:4px solid #22c55e;box-shadow:0 1px 7px rgba(20,83,45,.07)}
.ac.important{border-left-color:#d97706}.ac.urgent{border-left-color:#dc2626}.ac.birthday{border-left-color:#ec4899;background:#fdf4ff}
.at{font-weight:700;font-size:.87rem;margin-bottom:3px}.ab{font-size:.78rem;color:#6b7c6b;line-height:1.5}.am{font-size:.65rem;color:#6b7c6b;margin-top:6px;display:flex;justify-content:space-between;align-items:center}
.mgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mc{background:#fff;border-radius:13px;padding:13px;text-align:center;cursor:pointer;transition:transform .2s;box-shadow:0 1px 7px rgba(20,83,45,.07);position:relative}
.mc:hover{transform:translateY(-2px)}
.mav2{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#166534);color:#fff;font-weight:700;font-size:.95rem;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;overflow:hidden;border:2px solid #dcfce7}
.mav2 img{width:100%;height:100%;object-fit:cover}
.mn{font-weight:700;font-size:.8rem;color:#14532d;margin-bottom:2px}.mr2{font-size:.66rem;color:#6b7c6b}.mpt{font-size:.68rem;color:#d97706;font-weight:600;margin-top:3px}
.mbdg{font-size:.62rem;background:#dcfce7;color:#14532d;border-radius:20px;padding:2px 6px;margin-top:4px;display:inline-block}
.sbadge{position:absolute;top:6px;right:6px;background:#fee2e2;color:#dc2626;border-radius:20px;font-size:.6rem;font-weight:700;padding:2px 6px}
.chips{display:flex;gap:6px;margin-bottom:9px;flex-wrap:wrap}
.chip{padding:5px 13px;border-radius:20px;border:2px solid #e2f0e2;background:#fff;font-size:.76rem;font-weight:600;cursor:pointer;color:#6b7c6b}
.chip.on{background:#14532d;color:#fff;border-color:#14532d}
.ai{background:#fff;border-radius:11px;padding:10px 12px;margin-bottom:6px;display:flex;align-items:center;gap:9px;box-shadow:0 1px 7px rgba(20,83,45,.07)}
.aav{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#166534);color:#fff;font-weight:700;font-size:.8rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
.aav img{width:100%;height:100%;object-fit:cover}
.ain{flex:1;min-width:0}.anm{font-weight:600;font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.aid{font-size:.65rem;color:#6b7c6b}
.srch{width:100%;padding:10px 14px;border:2px solid #e2f0e2;border-radius:30px;font-family:'DM Sans',sans-serif;font-size:.86rem;background:#fff;outline:none;margin-bottom:9px}
.tcard{background:#fff;border-radius:11px;padding:12px;margin-bottom:7px;border-left:4px solid #22c55e;box-shadow:0 1px 7px rgba(20,83,45,.07)}
.tcard.high{border-left-color:#dc2626}.tcard.medium{border-left-color:#d97706}
.tt{font-weight:700;font-size:.85rem;margin-bottom:2px}.td{font-size:.76rem;color:#6b7c6b;margin-bottom:6px}
.trow{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.pri{font-size:.64rem;padding:2px 7px;border-radius:20px;font-weight:600}
.pri.high{background:#fee2e2;color:#dc2626}.pri.medium{background:#fef3c7;color:#92400e}.pri.low{background:#dcfce7;color:#166534}
.tdue{font-size:.68rem;color:#6b7c6b;margin-left:auto}
.tdone{background:#dcfce7;color:#166534;padding:3px 8px;border-radius:20px;font-size:.68rem;font-weight:600}
.f3{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:9px}
.fc{border-radius:11px;padding:11px;text-align:center}
.fc.g{background:linear-gradient(135deg,#dcfce7,#bbf7d0)}.fc.r{background:linear-gradient(135deg,#fee2e2,#fecaca)}.fc.b{background:linear-gradient(135deg,#dbeafe,#bfdbfe)}
.fl{font-size:.63rem;font-weight:600;color:#6b7c6b;margin-bottom:3px}.fv{font-size:.88rem;font-weight:700;color:#14532d}
.txn{background:#fff;border-radius:11px;padding:10px 12px;margin-bottom:6px;display:flex;align-items:center;gap:9px;box-shadow:0 1px 7px rgba(20,83,45,.07)}
.ta{font-weight:700;font-size:.84rem}.ta.cr{color:#166534}.ta.db{color:#dc2626}
.chbar{display:flex;gap:5px;overflow-x:auto;padding-bottom:6px;margin-bottom:6px;scrollbar-width:none}
.chbar::-webkit-scrollbar{display:none}
.cbtn{white-space:nowrap;padding:6px 12px;border-radius:20px;border:2px solid #e2f0e2;background:#fff;font-size:.74rem;font-weight:600;cursor:pointer;color:#6b7c6b;flex-shrink:0}
.cbtn.on{background:#14532d;color:#fff;border-color:#14532d}
.cwin{background:#fff;border-radius:13px;padding:13px;height:250px;overflow-y:auto;margin-bottom:9px;box-shadow:0 1px 7px rgba(20,83,45,.07)}
.cm{margin-bottom:9px;display:flex;flex-direction:column}
.cm.me{align-items:flex-end}
.cb{max-width:80%;padding:8px 12px;border-radius:13px;font-size:.82rem;line-height:1.5}
.cm.me .cb{background:linear-gradient(135deg,#22c55e,#166534);color:#fff;border-bottom-right-radius:3px}
.cm.them .cb{background:#f1f5f1;color:#1a2e1a;border-bottom-left-radius:3px}
.cm.sys .cb{background:linear-gradient(135deg,#fdf4ff,#fce7f3);color:#9333ea;border-radius:13px;max-width:95%;white-space:pre-wrap;font-size:.78rem}
.cm-meta{font-size:.62rem;color:#6b7c6b;margin-top:2px}.cm-sn{font-size:.68rem;font-weight:600;color:#166634;margin-bottom:2px}
.cinp{display:flex;gap:7px;background:#fff;border-radius:30px;padding:5px 5px 5px 13px;box-shadow:0 1px 7px rgba(20,83,45,.1)}
.cinp input{flex:1;border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:.86rem;background:transparent}
.csnd{background:linear-gradient(135deg,#22c55e,#166534);color:#fff;border:none;width:37px;height:37px;border-radius:50%;cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center}
.pc{background:#fff;border-radius:13px;padding:13px;margin-bottom:9px;box-shadow:0 1px 7px rgba(20,83,45,.07)}
.pq{font-weight:700;font-size:.87rem;margin-bottom:11px}
.po{background:#f8fdf8;border:2px solid #e2f0e2;border-radius:9px;padding:10px;cursor:pointer;transition:border-color .2s;display:flex;align-items:center;gap:7px;margin-bottom:6px}
.po:hover{border-color:#22c55e}.po.voted{border-color:#22c55e;background:#dcfce7}
.pbb{flex:1;background:#e2f0e2;height:5px;border-radius:10px;overflow:hidden}
.pbf{height:100%;background:#22c55e;border-radius:10px}
.ppc{font-size:.74rem;font-weight:700;color:#166534;min-width:30px;text-align:right}
.lbi{background:#fff;border-radius:11px;padding:10px 12px;margin-bottom:6px;display:flex;align-items:center;gap:9px;box-shadow:0 1px 7px rgba(20,83,45,.07)}
.lbi.me{border:2px solid #22c55e}
.lbr{width:27px;font-weight:700;font-size:.95rem;text-align:center;flex-shrink:0}
.lbav{width:35px;height:35px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#166534);color:#fff;font-weight:700;font-size:.76rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
.lbav img{width:100%;height:100%;object-fit:cover}
.lbp{font-weight:700;font-size:.88rem;color:#d97706}
.ec{background:#fff;border-radius:13px;padding:13px;margin-bottom:8px;box-shadow:0 1px 7px rgba(20,83,45,.07)}
.ebg{background:linear-gradient(135deg,#14532d,#166534);color:#fff;border-radius:8px;padding:6px 9px;text-align:center;float:right;margin-left:9px}
.eday{font-size:1.3rem;font-weight:900;font-family:'Playfair Display',serif;line-height:1}
.emon{font-size:.58rem;text-transform:uppercase;letter-spacing:1px}
.etit{font-weight:700;font-size:.87rem;margin-bottom:2px}.even{font-size:.74rem;color:#6b7c6b}.etim{font-size:.7rem;color:#166534;font-weight:600;margin-top:3px}.edsc{font-size:.74rem;color:#6b7c6b;margin-top:6px;clear:both}
.rsvpb{background:#dcfce7;color:#14532d;border:2px solid #22c55e;padding:5px 12px;border-radius:8px;font-size:.74rem;font-weight:600;cursor:pointer;margin-top:8px}
.ph{background:linear-gradient(135deg,#14532d,#166534);color:#fff;border-radius:13px;padding:20px;text-align:center;margin-bottom:10px}
.pav{width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,.18);border:3px solid rgba(255,255,255,.32);color:#fff;font-weight:700;font-size:1.4rem;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;overflow:hidden}
.pav img{width:100%;height:100%;object-fit:cover}
.pnm{font-family:'Playfair Display',serif;font-size:1.15rem;font-weight:700}.prl{font-size:.76rem;opacity:.8;margin-top:2px}
.pid{display:inline-block;background:rgba(255,255,255,.15);padding:3px 11px;border-radius:20px;font-size:.7rem;margin-top:6px;font-weight:600}
.bcwrap{background:#fff;border-radius:13px;padding:13px;text-align:center;margin-bottom:9px;cursor:pointer;box-shadow:0 1px 7px rgba(20,83,45,.07)}
.bcbars{display:flex;gap:2px;justify-content:center;align-items:flex-end;height:44px;margin:8px 0 5px}
.bar{background:#14532d;border-radius:1px}
.bcid{font-size:.72rem;font-weight:600;color:#6b7c6b;letter-spacing:2px}
.ps4{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:9px}
.psc{background:#fff;border-radius:11px;padding:9px 5px;text-align:center;box-shadow:0 1px 7px rgba(20,83,45,.07)}
.psv{font-size:.88rem;font-weight:700;color:#14532d}.psl{font-size:.58rem;color:#6b7c6b;margin-top:2px}
.dr{display:flex;padding:7px 0;border-bottom:1px solid #e2f0e2;gap:9px}
.dr:last-child{border-bottom:none}
.dl{font-size:.7rem;color:#6b7c6b;font-weight:600;min-width:95px;flex-shrink:0}.dv{font-size:.8rem;color:#1a2e1a}
.brow{display:flex;gap:7px;flex-wrap:wrap}
.bc{background:#fff;border-radius:11px;padding:9px;text-align:center;flex:1;min-width:60px;box-shadow:0 1px 7px rgba(20,83,45,.07)}
.bico{font-size:1.3rem;display:block;margin-bottom:3px}.blbl{font-size:.6rem;color:#6b7c6b;font-weight:600}
.agrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:13px}
.acard{background:#fff;border-radius:13px;padding:13px;text-align:center;cursor:pointer;transition:transform .2s;box-shadow:0 1px 7px rgba(20,83,45,.07);font-size:.76rem;font-weight:600;color:#14532d}
.acard:hover{transform:translateY(-2px);background:#dcfce7}
.aico{font-size:1.5rem;margin-bottom:5px}
.ccc{background:#fff;border-radius:11px;padding:12px;margin-bottom:7px;box-shadow:0 1px 7px rgba(20,83,45,.07)}
.csub{font-weight:700;font-size:.85rem}.ccat{font-size:.68rem;background:#dcfce7;color:#14532d;padding:2px 7px;border-radius:20px;display:inline-block;margin:3px 0}
.cst{font-size:.68rem;font-weight:600;padding:2px 7px;border-radius:20px}
.cst.open{background:#fee2e2;color:#dc2626}.cst.resolved{background:#dcfce7;color:#166534}.cst.inprogress{background:#fef3c7;color:#92400e}
.cdc{background:#fff;border-radius:13px;padding:13px;margin-bottom:8px;display:flex;align-items:center;gap:11px;box-shadow:0 1px 7px rgba(20,83,45,.07)}
.cdav{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#166534);color:#fff;font-weight:700;font-size:.95rem;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pbg{display:none;position:absolute;inset:0;background:rgba(0,0,0,.35);z-index:300}.pbg.show{display:block}
.panel{position:absolute;right:-100%;top:0;width:80%;max-width:300px;height:100%;background:#fff;z-index:400;transition:right .27s ease;box-shadow:-4px 0 18px rgba(0,0,0,.1);display:flex;flex-direction:column}
.panel.show{right:0}
.phdr{padding:13px 15px;background:#14532d;color:#fff;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}
.phdr button{background:rgba(255,255,255,.15);border:none;color:#fff;width:25px;height:25px;border-radius:5px;cursor:pointer}
.pbody2{flex:1;overflow-y:auto}
.ni{padding:11px 13px;border-bottom:1px solid #e2f0e2;cursor:pointer}.ni.unread{background:#f0fdf4}
.nt{font-weight:600;font-size:.82rem;margin-bottom:2px}.nb{font-size:.74rem;color:#6b7c6b}.ntm{font-size:.65rem;color:#6b7c6b;margin-top:2px}
.mbg2{display:none;position:absolute;inset:0;background:rgba(0,0,0,.5);z-index:500;align-items:flex-end;justify-content:center}
.mbg2.show{display:flex}
.mbox{background:#fff;border-radius:20px 20px 0 0;padding:20px;width:100%;max-height:90vh;overflow-y:auto}
.mbox h3{font-family:'Playfair Display',serif;color:#14532d;margin-bottom:13px;font-size:1.1rem}
.bcxl{display:flex;gap:2px;justify-content:center;align-items:flex-end;height:68px;margin:12px 0 6px}
.toast{position:absolute;bottom:82px;left:50%;transform:translateX(-50%) translateY(8px);background:rgba(20,83,45,.95);color:#fff;padding:9px 17px;border-radius:28px;font-size:.82rem;font-weight:600;opacity:0;transition:all .3s;pointer-events:none;z-index:999;white-space:pre-wrap;max-width:86%;text-align:center}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.ppop{position:absolute;top:38%;left:50%;transform:translate(-50%,-50%) scale(0);background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;font-size:1.3rem;font-weight:900;padding:16px 26px;border-radius:16px;z-index:998;opacity:0;transition:all .3s;pointer-events:none;text-align:center}
.ppop.show{opacity:1;transform:translate(-50%,-50%) scale(1)}
.mcard{background:linear-gradient(135deg,#14532d,#166534);color:#fff;border-radius:12px;padding:13px;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.bopen{background:#22c55e;color:#fff;padding:3px 9px;border-radius:20px;font-size:.7rem;font-weight:700}
.bwarn{background:#fef3c7;color:#92400e;padding:3px 9px;border-radius:20px;font-size:.7rem;font-weight:600}
.scanbox{background:#f8fdf8;border:2px dashed #22c55e;border-radius:13px;padding:20px;text-align:center;cursor:pointer;margin-bottom:11px}
.inote{background:#fef3c7;border:1px solid #fde68a;border-radius:9px;padding:10px;font-size:.76rem;color:#92400e;margin-bottom:11px;line-height:1.5}
.inote.blue{background:#dbeafe;border-color:#93c5fd;color:#1e40af}
.empty{text-align:center;padding:34px 14px;color:#6b7c6b}
.empty .ei{font-size:2.4rem;display:block;margin-bottom:9px}
.geobox{border:2px solid #22c55e;border-radius:13px;padding:14px;text-align:center;margin-bottom:12px;background:#f0fdf4}
.geobox.err{border-color:#dc2626;background:#fff5f5}
.biobox{background:linear-gradient(135deg,#1e40af,#1d4ed8);color:#fff;border-radius:13px;padding:18px;text-align:center;margin-bottom:12px}
@keyframes bfpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(.95)}}
.biofing{font-size:3rem;margin-bottom:8px;animation:bfpulse 1.5s ease infinite}
.photo-area{border:2px dashed #22c55e;border-radius:12px;padding:16px;text-align:center;cursor:pointer;background:#f8fdf8;position:relative}
.photo-area input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.photo-prev{width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #22c55e;margin:0 auto 8px;display:block}
.idc{background:linear-gradient(135deg,#14532d 0%,#166534 40%,#1a7a40 100%);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(20,83,45,.4);margin-bottom:14px;width:100%;max-width:340px;margin-left:auto;margin-right:auto}
.idc-head{padding:12px 14px 10px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,.15)}
.idc-logo{width:32px;height:32px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.idc-org .on{font-family:'Playfair Display',serif;font-size:.9rem;font-weight:700;color:#fff;line-height:1.1}
.idc-org .os{font-size:.58rem;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:1px}
.idc-body{padding:14px;display:flex;gap:12px;align-items:flex-start}
.idc-photo{width:66px;height:76px;border-radius:8px;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.3);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1.3rem}
.idc-photo img{width:100%;height:100%;object-fit:cover}
.idc-info{flex:1;color:#fff}
.idc-name{font-family:'Playfair Display',serif;font-size:.95rem;font-weight:700;margin-bottom:2px;line-height:1.2}
.idc-role{font-size:.64rem;background:rgba(255,255,255,.2);padding:2px 7px;border-radius:20px;display:inline-block;margin-bottom:7px}
.idc-det{font-size:.67rem;opacity:.85;margin-bottom:2px;display:flex;gap:4px}
.idc-det span:first-child{opacity:.7;min-width:50px;flex-shrink:0}
.idc-foot{background:rgba(0,0,0,.2);padding:10px 14px;display:flex;align-items:center;justify-content:space-between}
.idc-bc{display:flex;gap:1px;align-items:flex-end;height:28px}
.idc-bc .bar{background:rgba(255,255,255,.8);border-radius:.5px}
.idc-idnum{color:#86efac;font-size:.68rem;font-weight:700;letter-spacing:1.5px}
.idc-issued{color:rgba(255,255,255,.55);font-size:.58rem;margin-top:2px}
.bday-ov{position:absolute;inset:0;background:rgba(0,0,0,.85);z-index:600;display:flex;align-items:center;justify-content:center;padding:16px}
@keyframes bdayIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}
.bday-card{background:linear-gradient(135deg,#7c3aed,#ec4899,#f59e0b);border-radius:20px;padding:24px;text-align:center;max-width:340px;width:100%;box-shadow:0 12px 40px rgba(0,0,0,.4);animation:bdayIn .5s ease}
@keyframes spin3{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.bday-conf{font-size:1.8rem;animation:spin3 3s linear infinite;display:inline-block;margin-bottom:8px}
.bday-pav{width:80px;height:80px;border-radius:50%;border:4px solid rgba(255,255,255,.4);margin:0 auto 12px;overflow:hidden;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.6rem;font-weight:700}
.bday-pav img{width:100%;height:100%;object-fit:cover}
.bday-name{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:900;color:#fff;margin-bottom:3px}
.bday-sub{font-size:.82rem;color:rgba(255,255,255,.85);margin-bottom:12px}
.bday-prayer{background:rgba(255,255,255,.15);border-radius:12px;padding:13px;color:#fff;font-size:.8rem;line-height:1.6;margin-bottom:14px;text-align:left}
.bday-ack{background:#fff;color:#7c3aed;border:none;padding:12px 28px;border-radius:50px;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer}
.bday-wall{background:linear-gradient(135deg,#fdf4ff,#fce7f3);border-radius:13px;padding:14px;margin-bottom:9px;border-left:4px solid #ec4899}
.arow{display:flex;gap:5px;flex-wrap:wrap;margin-top:9px}
`;

export default function App() {
  const [members, setMembers] = useState(() => SEED_M.map(m => ({...m})));
  const [tasks, setTasks] = useState(() => SEED_T.map(t => ({...t})));
  const [anns, setAnns] = useState(() => SEED_A.map(a => ({...a})));
  const [events, setEvents] = useState(() => SEED_E.map(e => ({...e})));
  const [polls, setPolls] = useState(() => SEED_P.map(p => ({...p})));
  const [txns, setTxns] = useState(() => SEED_TX.map(t => ({...t})));
  const [chats, setChats] = useState({general:[
    {id:1,sid:'IFA-0001',sn:'Chief Adebayo',txt:'Aborò! Welcome to our forum chat. Ẹ káàárọ̀ fellow Ijebu people in Abuja!',t:'08:30'},
    {id:2,sid:'IFA-0002',sn:'Dr. Folasade',txt:"Good morning! Looking forward to today's meeting. Please be on time.",t:'08:45'},
    {id:3,sid:'IFA-0010',sn:'Prof. Oluwakemi',txt:'Alaafia! Venue confirmed - Transcorp Hilton. Dress code: Ankara.',t:'09:00'},
  ],exco:[{id:1,sid:'IFA-0001',sn:'President',txt:"Exco members, please review today's agenda before arrival.",t:'07:00'}],welfare:[{id:1,sid:'IFA-0005',sn:'Mrs. Abimbola',txt:'Welfare update: 3 members supported this quarter.',t:'10:00'}],events:[],birthdays:[]});
  const [notifs, setNotifs] = useState([
    {id:1,title:'Meeting This Sunday!',body:'Monthly forum meeting holds Sunday 12th July at 2PM at Transcorp Hilton.',unread:true,time:'Today'},
    {id:2,title:'Task Assigned',body:'You have been assigned: Compile welfare list for Q3',unread:true,time:'Yesterday'},
    {id:3,title:'Streak Bonus!',body:'You earned 25 bonus points for your meeting streak!',unread:false,time:'2 days ago'},
  ]);
  const [complaints, setComplaints] = useState([
    {id:1,sub:'Meeting venue too far',cat:'General Complaint',det:'Transcorp Hilton is too far for members from Lugbe and Nyanya. Please alternate venues.',by:'Anonymous',date:'2026-06-20',status:'inprogress'},
  ]);
  const [paidDues, setPaidDues] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [pending, setPending] = useState([]);
  const [bdayAcks, setBdayAcks] = useState([]);
  const [settings, setSettings] = useState({
    forumName:'Ijebu Forum Abuja',
    tagline:'Unity · Progress · Welfare',
    description:'A community of Ijebu indigenes resident in Abuja, meeting every 2nd Sunday monthly.',
    phone:'',
    email:'',
    address:'Abuja, Nigeria',
    country:'Nigeria',
    state:'FCT Abuja',
    currency:'Naira',
    currencySymbol:'₦',
    currencyRate:'1',
    monthlyDues:'2000',
    memberCardFee:'1000',
    contributionMin:'500',
    themeColor:'#14532d',
    logo:null,
    rules:[
      'Members must attend at least 75% of monthly meetings.',
      'Monthly dues must be paid on or before the meeting day.',
      'Members must dress decently in Ankara/native attire on meeting days.',
      'Respect and courtesy must be shown to all members at all times.',
      'No member shall engage in conduct unbecoming of a Forum member.',
    ],
    penalties:[
      'Absence without excuse: ₦500 fine.',
      'Late payment of dues: ₦200 surcharge per month.',
      'Misconduct: Warning, suspension or expulsion as determined by Exco.',
    ],
    settingsPin:'0000',
    pinLocked:true,
  });
  const [settingsPinInput, setSettingsPinInput] = useState('');
  const [settingsUnlocked, setSettingsUnlocked] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetPin, setResetPin] = useState('');
  const [bdayModal, setBdayModal] = useState(null);
  const [scr, setScr] = useState('splash');
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState(null);
  const [modal, setModal] = useState(null);
  const [mdata, setMdata] = useState(null);
  const [tab, setTabS] = useState({});
  const [chan, setChan] = useState('general');
  const [mf, setMf] = useState('all');
  const [srch, setSrch] = useState('');
  const [chatInp, setChatInp] = useState('');
  const [toast, setToast] = useState({m:'',s:false});
  const [ppop, setPpop] = useState({m:'',s:false});
  const [geoSt, setGeoSt] = useState(null);
  const [bioStep, setBioStep] = useState(0);
  const chatRef = useRef(null);
  const [lid, setLid] = useState('admin@ijebu.ng');
  const [lpw, setLpw] = useState('admin123');
  const blank = {fn:'',ln:'',on:'',email:'',phone:'',addr:'',town:'',hAddr:'',dobDay:'',dobMonth:'',dobYear:'',prof:'',des:'',role:'member',nok:'',nokP:'',nokR:'',pw:'',photo:null,method:'geo'};
  const [reg, setReg] = useState({...blank});
  const [tform, setTform] = useState({title:'',desc:'',assignee:'IFA-0001',priority:'medium',due:''});
  const [aform, setAform] = useState({title:'',body:'',priority:'normal'});
  const [eform, setEform] = useState({title:'',date:'',time:'',venue:'',desc:''});
  const [cform, setCform] = useState({cat:'General Complaint',sub:'',det:'',anon:false});
  const [pform, setPform] = useState({q:'',type:'Yes / No',end:''});
  const [cfAmt, setCfAmt] = useState('');
  const [cfPur, setCfPur] = useState('');

  useEffect(() => {
    const id = 'ifacss4';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chats, chan, page]);

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const tm = MONTHS[now.getMonth()];
    const td = String(now.getDate());
    members.forEach(m => {
      if (m.dobMonth !== tm || String(m.dobDay) !== td) return;
      const ck = 'bdaychat-' + m.id + '-' + now.getFullYear();
      const bk = 'bday-' + m.id + '-' + now.getFullYear();
      if (!chats.general.find(c => c.id === ck)) {
        const prayer = PRAYERS[Math.floor(Math.random() * PRAYERS.length)];
        const msg = {id:ck,sid:'SYSTEM',sn:'Birthday Bot',txt:'Happy Birthday to ' + (m.des ? m.des + ' ' : '') + m.name + '!\n\n' + prayer + '\n\nFrom all of us at Ijebu Forum Abuja.',t:'06:00'};
        setChats(c => ({...c, general:[...c.general,msg], birthdays:[...c.birthdays,msg]}));
        setAnns(as => {
          if (as.find(a => a.id === bk)) return as;
          return [{id:bk,title:'Happy Birthday - '+m.name+'!',body:'Today is the birthday of '+(m.des?m.des+' ':'')+m.name+' from '+m.town+'. The entire Ijebu Forum Abuja family celebrates you! May God bless you with long life, good health and abundant prosperity.',priority:'birthday',author:'Forum Bot',date:today()},...as];
        });
      }
      if (m.id === user.id && !bdayAcks.includes(bk)) {
        setTimeout(() => setBdayModal({member:m, key:bk}), 2000);
      }
    });
  }, [user, members]);

  const T = m => { setToast({m,s:true}); setTimeout(() => setToast(x => ({...x,s:false})), 3000); };
  const PP = m => { setPpop({m,s:true}); setTimeout(() => setPpop(x => ({...x,s:false})), 2000); };
  const G = p => tab[p] || 0;
  const ST = (p, i) => setTabS(t => ({...t,[p]:i}));
  const navTo = pg => { setPage(pg); setMenuOpen(false); setSrch(''); };
  const openM = (name, data) => { setModal(name); setMdata(data); };
  const closeM = () => { setModal(null); setMdata(null); };

  const isAdmin = user && user.isAdmin;
  const isFinance = user && ['treasurer','financial-secretary'].includes(user.role);
  const myM = user ? (members.find(m => m.id === user.id) || user) : null;
  const myPts = myM ? myM.pts : 0;
  const myAtt = myM ? myM.att : [];
  const attPct = myAtt.length ? Math.round(myAtt.filter(a => a === 'present').length / myAtt.length * 100) : 0;
  const myDone = user ? tasks.filter(t => t.assignee === user.id && t.status === 'done').length : 0;
  const sortedM = [...members].filter(m => m.status !== 'suspended').sort((a, b) => b.pts - a.pts);
  const myRank = user ? sortedM.findIndex(m => m.id === user.id) + 1 : '-';
  const lvl = lvlI(myPts);
  const xpPct = Math.min(100, lvl.np === lvl.pp ? 100 : Math.round((myPts - lvl.pp) / (lvl.np - lvl.pp) * 100));
  const income = txns.filter(t => t.type === 'cr').reduce((s, t) => s + t.amt, 0);
  const expense = txns.filter(t => t.type === 'db').reduce((s, t) => s + t.amt, 0);
  const unread = notifs.filter(n => n.unread).length;
  const nm = nextSun2();
  const nextId = () => mkId(members.length + pending.length + 1);
  const filtM = members.filter(m => {
    const rok = mf==='all'||(mf==='exco'&&['president','vice-president','secretary','treasurer','financial-secretary','welfare','social-welfare','pro','chief-whip','exofficio'].includes(m.role))||(mf==='trustees'&&m.role==='trustees')||(mf==='member'&&m.role==='member')||(mf==='suspended'&&m.status==='suspended');
    const q = srch.toLowerCase();
    return rok && (!q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.phone.includes(q) || (m.town||'').toLowerCase().includes(q));
  });

  const doLogin = async () => {
    if (!lid.trim() || !lpw) { T('Enter your credentials'); return; }
    if (!DEMO_MODE) {
      try {
        const data = await API.login(lid.trim(), lpw);
        const u = {...data.member, isAdmin: data.member.isAdmin || data.member.role==='president'};
        setUser(u); setScr('app'); setPage('dashboard'); T('Welcome back, '+u.name.split(' ')[0]+'!'); return;
      } catch (e) { T(e.message || 'Login failed'); return; }
    }
    // Demo mode fallback
    if ((lid==='admin@ijebu.ng'||lid==='admin'||lid==='IFA-0001') && lpw==='admin123') {
      const u = {...members[0], isAdmin:true};
      setUser(u); setScr('app'); setPage('dashboard'); T('Welcome back, '+u.name.split(' ')[0]+'!'); return;
    }
    const f = members.find(m => m.email===lid || m.phone===lid || m.id===lid);
    if (!f) { T('Member not found'); return; }
    if (f.status === 'suspended') { T('Account suspended. Contact the admin.'); return; }
    if (lpw === 'member123') { setUser({...f,isAdmin:false}); setScr('app'); setPage('dashboard'); T('Welcome, '+f.name.split(' ')[0]+'!'); return; }
    T('Wrong password.\nAdmin: admin@ijebu.ng / admin123\nMember password: member123');
  };
  const doLogout = () => { setUser(null); setScr('splash'); setMenuOpen(false); };

  const doSystemReset = () => {
    if (resetPin !== settings.settingsPin) { T('Wrong PIN. System reset cancelled.'); return; }
    setMembers([{...members[0], pts:0, streak:0, att:[], tdone:0}]);
    setTasks([]); setAnns([]); setEvents([]); setPolls([]);
    setTxns([]); setComplaints([]);
    setChats({general:[],exco:[],welfare:[],events:[],birthdays:[]});
    setNotifs([]); setPaidDues([]); setRsvps([]); setPending([]);
    setBdayAcks([]); setBdayModal(null);
    setShowReset(false); setResetPin('');
    T('System reset complete. All data cleared. Only admin account retained.');
    setModal(null);
  };

  const saveSettings = () => {
    T('Settings saved successfully!');
    setSettingsUnlocked(false);
    setSettingsPinInput('');
  };

  const unlockSettings = () => {
    if (settingsPinInput === settings.settingsPin) {
      setSettingsUnlocked(true); setSettingsPinInput('');
      T('Settings unlocked!');
    } else {
      T('Wrong PIN. Access denied.');
    }
  };

  const doReg = adminMode => {
    const name = [reg.fn, reg.ln, reg.on].filter(Boolean).join(' ');
    if (!reg.fn || !reg.ln || !reg.phone) { T('Fill all required fields'); return; }
    const id = nextId();
    const m = {id,name,role:reg.role||'member',des:reg.des,prof:reg.prof,phone:reg.phone,email:reg.email,addr:reg.addr,town:reg.town,hAddr:reg.hAddr,dobDay:reg.dobDay,dobMonth:reg.dobMonth,dobYear:reg.dobYear,nok:reg.nok,nokP:reg.nokP,nokR:reg.nokR,pts:50,streak:0,att:[],tdone:0,joined:today(),status:adminMode?'active':'pending',photo:reg.photo,method:reg.method,fn:reg.fn,ln:reg.ln,on:reg.on};
    if (adminMode) { setMembers(ms => [...ms,m]); setReg({...blank}); closeM(); T('Member registered! ID: '+id); }
    else { setPending(p => [...p,m]); T('Application submitted! Your ID will be '+id); setScr('login'); }
  };

  const markAtt = async (mid, status, method, lat, lng) => {
    if (!DEMO_MODE) {
      try {
        const data = await API.markAttendance(mid, status, method, lat, lng);
        setMembers(ms => ms.map(m => m.id === mid ? {...m, ...data.member} : m));
        if (user && mid === user.id) { setUser(u => ({...u, pts: data.pts, streak: data.streak})); PP('+10 pts! Attendance'); }
        const m = members.find(x => x.id===mid);
        T((m?m.name.split(' ')[0]:mid)+' marked '+status+' via '+method); return;
      } catch (e) { T(e.message); return; }
    }
    setMembers(ms => ms.map(m => {
      if (m.id !== mid) return m;
      const a = [...m.att]; const l = a[a.length-1];
      if (l==='present'||l==='absent'||l==='excuse') a[a.length-1]=status; else a.push(status);
      let p=m.pts, s=m.streak;
      if (status==='present') { p+=10; s+=1; if (s===3) p+=25; }
      return {...m,att:a,pts:p,streak:s};
    }));
    if (user && mid===user.id && status==='present') { setUser(u => ({...u,pts:(u.pts||0)+10,streak:(u.streak||0)+1})); PP('+10 pts! Attendance'); }
    const m = members.find(x => x.id===mid);
    T((m?m.name.split(' ')[0]:mid)+' marked '+status+(method?' via '+method:''));
  };
  const startBio = mid => {
    setBioStep(1);
    setTimeout(() => { setBioStep(2); setTimeout(() => { markAtt(mid,'present','biometric'); setBioStep(0); }, 600); }, 2000);
  };
  const completeTask = id => {
    const task = tasks.find(t => t.id===id); if (!task||task.status==='done') return;
    setTasks(ts => ts.map(t => t.id===id ? {...t,status:'done'} : t));
    setMembers(ms => ms.map(m => m.id===task.assignee ? {...m,pts:m.pts+20,tdone:m.tdone+1} : m));
    if (user && task.assignee===user.id) { setUser(u => ({...u,pts:(u.pts||0)+20})); PP('+20 pts! Task Done'); }
    T('Task completed! +20 pts');
  };
  const castVote = (pid, oi) => {
    if (!user) return;
    setPolls(ps => ps.map(p => {
      if (p.id!==pid || p.voters.includes(user.id)) return p;
      const opts = p.opts.map((o, i) => i===oi ? {...o,v:o.v+1} : o);
      return {...p,opts,voters:[...p.voters,user.id]};
    }));
    setMembers(ms => ms.map(m => m.id===user.id ? {...m,pts:m.pts+5} : m));
    setUser(u => ({...u,pts:(u.pts||0)+5}));
    PP('+5 pts! Vote Cast'); T('Vote submitted! +5 pts');
  };
  const payDues = () => {
    if (paidDues.includes(user.id)) { T('Already paid this month!'); return; }
    setPaidDues(p => [...p,user.id]);
    setTxns(ts => [{id:Date.now(),desc:'Monthly Dues - '+user.name,type:'cr',amt:2000,date:today(),cat:'dues'},...ts]);
    setMembers(ms => ms.map(m => m.id===user.id ? {...m,pts:m.pts+5} : m));
    setUser(u => ({...u,pts:(u.pts||0)+5}));
    PP('+5 pts! Dues Paid'); T('Dues paid! +5 pts');
  };
  const sendMsg = () => {
    if (!chatInp.trim()) return;
    const sn = (user.des?user.des+' ':'')+user.name.split(' ')[0];
    const msg = {id:Date.now(),sid:user.id,sn,txt:chatInp.trim(),t:nowT()};
    setChats(c => ({...c,[chan]:[...(c[chan]||[]),msg]}));
    setMembers(ms => ms.map(m => m.id===user.id ? {...m,pts:m.pts+2} : m));
    setUser(u => ({...u,pts:(u.pts||0)+2}));
    setChatInp('');
  };
  const handlePhoto = (e, setter) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => setter(ev.target.result); r.readAsDataURL(f);
  };

  const IDCard = ({m}) => {
    const bars = barBits(m.id);
    const dname = [m.fn||m.name.split(' ')[0], m.ln||m.name.split(' ')[1]||'', m.on||''].filter(Boolean).join(' ');
    return (
      <div className="idc">
        <div className="idc-head">
          <div className="idc-logo">{"🌿"}</div>
          <div className="idc-org"><div className="on">Ijebu Forum Abuja</div><div className="os">Unity · Progress · Welfare</div></div>
        </div>
        <div className="idc-body">
          <div className="idc-photo">{m.photo ? <img src={m.photo} alt={m.name}/> : ini(m.name)}</div>
          <div className="idc-info">
            <div className="idc-name">{m.des?m.des+' ':''}{dname}</div>
            <div className="idc-role">{rl(m.role)}</div>
            <div className="idc-det"><span>ID:</span><span style={{fontWeight:700}}>{m.id}</span></div>
            <div className="idc-det"><span>Since:</span><span>{fmtD(m.joined)}</span></div>
            <div className="idc-det"><span>Town:</span><span>{m.town||'--'}</span></div>
            <div className="idc-det"><span>Phone:</span><span>{m.phone}</span></div>
          </div>
        </div>
        <div className="idc-foot">
          <div>
            <div className="idc-bc">{bars.slice(0,28).map((b,i) => <div key={i} className="bar" style={{width:b.w*1.4,height:b.h*0.75}}/>)}</div>
            <div className="idc-issued">Issued: {fmtD(m.joined)}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="idc-idnum">{m.id}</div>
            <div style={{color:'rgba(255,255,255,.5)',fontSize:'.58rem',marginTop:2}}>{lvlE(m.pts)} {lvlI(m.pts).lbl}</div>
          </div>
        </div>
      </div>
    );
  };

  const RegForm = ({adminMode}) => (
    <div>
      <div className="fsec">Photo (for ID Card)</div>
      <div className="photo-area" style={{marginBottom:13}}>
        <input type="file" accept="image/*" onChange={e => handlePhoto(e, v => setReg(r => ({...r,photo:v})))}/>
        {reg.photo ? <img src={reg.photo} alt="preview" className="photo-prev"/> : <div><div style={{fontSize:'2rem',marginBottom:6}}>{"📷"}</div><div style={{fontSize:'.8rem',color:'#166534',fontWeight:500}}>Tap to upload passport photo</div></div>}
      </div>
      <div className="fsec">Personal Information</div>
      <div className="r3">
        <div className="fg"><label>First Name *</label><input value={reg.fn} onChange={e=>{const v=e.target.value;setReg(r=>({...r,fn:v}))}} placeholder="First"/></div>
        <div className="fg"><label>Last Name *</label><input value={reg.ln} onChange={e=>{const v=e.target.value;setReg(r=>({...r,ln:v}))}} placeholder="Last"/></div>
        <div className="fg"><label>Other Name</label><input value={reg.on} onChange={e=>{const v=e.target.value;setReg(r=>({...r,on:v}))}} placeholder="Other"/></div>
      </div>
      <div className="r2">
        <div className="fg"><label>Phone *</label><input type="tel" value={reg.phone} onChange={e=>{const v=e.target.value;setReg(r=>({...r,phone:v}))}} placeholder="+234..."/></div>
        <div className="fg"><label>Email</label><input type="email" value={reg.email} onChange={e=>{const v=e.target.value;setReg(r=>({...r,email:v}))}} placeholder="email@..."/></div>
      </div>
      <div className="fg"><label>Abuja Address</label><input value={reg.addr} onChange={e=>{const v=e.target.value;setReg(r=>({...r,addr:v}))}} placeholder="House, Street, Area Council"/></div>
      <div className="r2">
        <div className="fg"><label>Home Town</label><input value={reg.town} onChange={e=>{const v=e.target.value;setReg(r=>({...r,town:v}))}} placeholder="e.g. Ijebu-Ode"/></div>
        <div className="fg"><label>Hometown Address</label><input value={reg.hAddr} onChange={e=>{const v=e.target.value;setReg(r=>({...r,hAddr:v}))}} placeholder="Home address"/></div>
      </div>
      <div className="fg"><label>Date of Birth</label>
        <div className="r3">
          <input type="number" value={reg.dobDay} onChange={e=>{const v=e.target.value;setReg(r=>({...r,dobDay:v}))}} placeholder="Day" min="1" max="31"/>
          <select value={reg.dobMonth} onChange={e=>{const v=e.target.value;setReg(r=>({...r,dobMonth:v}))}}>
            <option value="">Month</option>{MONTHS.map(m=><option key={m}>{m}</option>)}
          </select>
          <input type="number" value={reg.dobYear} onChange={e=>{const v=e.target.value;setReg(r=>({...r,dobYear:v}))}} placeholder="Year" min="1940" max="2006"/>
        </div>
      </div>
      <div className="r2">
        <div className="fg"><label>Profession</label><input value={reg.prof} onChange={e=>{const v=e.target.value;setReg(r=>({...r,prof:v}))}} placeholder="e.g. Engineer"/></div>
        <div className="fg"><label>Designation</label><input value={reg.des} onChange={e=>{const v=e.target.value;setReg(r=>({...r,des:v}))}} placeholder="Dr., Engr."/></div>
      </div>
      {adminMode && <div className="fg"><label>Role</label>
        <select value={reg.role} onChange={e=>{const v=e.target.value;setReg(r=>({...r,role:v}))}}>
          {Object.entries(ROLES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>}
      <div className="fsec">Next of Kin</div>
      <div className="r3">
        <div className="fg"><label>Name *</label><input value={reg.nok} onChange={e=>{const v=e.target.value;setReg(r=>({...r,nok:v}))}} placeholder="Full name"/></div>
        <div className="fg"><label>Phone</label><input type="tel" value={reg.nokP} onChange={e=>{const v=e.target.value;setReg(r=>({...r,nokP:v}))}} placeholder="Phone"/></div>
        <div className="fg"><label>Relationship</label><input value={reg.nokR} onChange={e=>{const v=e.target.value;setReg(r=>({...r,nokR:v}))}} placeholder="Spouse"/></div>
      </div>
      <div className="fg"><label>Attendance Method</label>
        <select value={reg.method} onChange={e=>{const v=e.target.value;setReg(r=>({...r,method:v}))}}>
          <option value="geo">GPS Geolocation</option>
          <option value="scan">QR/Barcode Scan</option>
          <option value="biometric">Biometric Fingerprint</option>
        </select>
      </div>
      {!adminMode && <div className="fg"><label>Password *</label><input type="password" value={reg.pw} onChange={e=>{const v=e.target.value;setReg(r=>({...r,pw:v}))}} placeholder="Create password"/></div>}
      <div className="hint">Auto-assigned Member ID: <strong>{nextId()}</strong></div>
      <button className="btnP fw" style={{marginTop:11}} onClick={() => doReg(adminMode)}>
        {adminMode ? 'Register Member & Assign ID' : 'Submit Application'}
      </button>
    </div>
  );

  if (scr === 'splash') return (
    <div className="app">
      <div className="splash">
        <div className="splZ">
          <div className="lring"><div className="linner">{"🌿"}</div></div>
          <div className="stitle">Ijebu Forum</div>
          <div className="ssub">Abuja Chapter</div>
          <div className="stag">Unity · Progress · Welfare</div>
          {DEMO_MODE && <div style={{background:"rgba(255,255,255,.15)",borderRadius:9,padding:"6px 12px",fontSize:".72rem",color:"rgba(255,255,255,.8)",marginBottom:8}}>Demo Mode — Connect backend for live data</div>}
          <div className="sbtns">
            <button className="btnP" onClick={() => setScr('login')}>Sign In</button>
            <button className="btnO" onClick={() => setScr('register')}>New Member</button>
          </div>
        </div>
      </div>
      <div className={'toast' + (toast.s ? ' show' : '')}>{toast.m}</div>
    </div>
  );

  if (scr === 'login') return (
    <div className="app">
      <div className="fscr">
        <div className="fhdr"><button className="bbtn" onClick={() => setScr('splash')}>Back</button><h2>Member Login</h2></div>
        <div className="fbody">
          <div style={{fontSize:'3rem',textAlign:'center',marginBottom:14}}>{"🔐"}</div>
          <div className="fg"><label>ID / Email / Phone</label><input value={lid} onChange={e => setLid(e.target.value)} placeholder="admin@ijebu.ng" onKeyDown={e => e.key==='Enter'&&doLogin()}/></div>
          <div className="fg"><label>Password</label><input type="password" value={lpw} onChange={e => setLpw(e.target.value)} placeholder="password" onKeyDown={e => e.key==='Enter'&&doLogin()}/></div>
          <button className="btnP fw" onClick={doLogin}>Sign In</button>
          <div className="hint" style={{marginTop:10,whiteSpace:'pre-wrap'}}>{"Admin: admin@ijebu.ng / admin123\nMember: folasade@ijebu.ng / member123"}</div>
          <div className="flink" onClick={() => setScr('register')}>New Member? Register here</div>
        </div>
      </div>
      <div className={'toast' + (toast.s ? ' show' : '')}>{toast.m}</div>
    </div>
  );

  if (scr === 'register') return (
    <div className="app">
      <div className="fscr">
        <div className="fhdr"><button className="bbtn" onClick={() => setScr('splash')}>Back</button><h2>Join the Forum</h2></div>
        <div className="fbody"><RegForm adminMode={false}/></div>
      </div>
      <div className={'toast' + (toast.s ? ' show' : '')}>{toast.m}</div>
    </div>
  );

  const PG = {};

  PG.dashboard = (
    <div>
      {/* PENDING MEMBERS ALERT */}
      {isAdmin && pending.length > 0 && (
        <div style={{background:'linear-gradient(135deg,#dc2626,#b91c1c)',color:'#fff',borderRadius:13,padding:14,marginBottom:10,cursor:'pointer',boxShadow:'0 4px 14px rgba(220,38,38,.35)'}} onClick={()=>navTo('admin')}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:'1.8rem'}}>{"🔔"}</span>
            <div>
              <div style={{fontWeight:700,fontSize:'.95rem'}}>{"⚠️"} {pending.length} Pending Registration{pending.length>1?'s':''} Awaiting Approval</div>
              <div style={{fontSize:'.76rem',opacity:.9,marginTop:2}}>Tap here to review and approve or deny new member applications</div>
            </div>
            <span style={{fontSize:'1.3rem',marginLeft:'auto'}}>{"›"}</span>
          </div>
          <div style={{marginTop:10,display:'flex',gap:7,flexWrap:'wrap'}}>
            {pending.slice(0,3).map(m=>(
              <div key={m.id} style={{background:'rgba(255,255,255,.2)',borderRadius:20,padding:'3px 10px',fontSize:'.72rem',fontWeight:600}}>{m.name}</div>
            ))}
            {pending.length>3&&<div style={{background:'rgba(255,255,255,.2)',borderRadius:20,padding:'3px 10px',fontSize:'.72rem',fontWeight:600}}>+{pending.length-3} more</div>}
          </div>
        </div>
      )}

      <div className="cardG">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700}}>Good day, {user.name.split(' ')[0]}!</div>
            <div style={{fontSize:'.74rem',opacity:.8,marginTop:3}}>Next meeting: <strong>{nm.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'long'})}</strong></div>
          </div>
          <div style={{fontSize:'1.5rem'}}>{lvlE(myPts)} {lvl.lbl}</div>
        </div>
      </div>
      <div className="s4">
        {[['📅',attPct+'%','Attend.','attendance'],['✅',myDone,'Tasks','tasks'],['⭐',myPts,'Points','leaderboard'],['🏅','#'+myRank,'Rank','leaderboard']].map(([ic,v,l,p]) => (
          <div className="sc" key={l} onClick={() => navTo(p)}><div className="si">{ic}</div><div className="sv">{v}</div><div className="sl">{l}</div></div>
        ))}
      </div>
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
          <span style={{fontWeight:600,fontSize:'.8rem',color:'#14532d'}}>XP Progress</span>
          <span style={{fontSize:'.7rem',color:'#6b7c6b'}}>Next: {lvl.next || 'Max Level'}</span>
        </div>
        <div className="xpt"><div className="xpf" style={{width:xpPct+'%'}}/></div>
        <div className="xpr"><span>{myPts} pts</span><span>{lvl.np} pts</span></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:9}}>
        <div className="cardY" style={{display:'flex',alignItems:'center',gap:8,padding:12}}>
          <span style={{fontSize:'1.5rem'}}>{"🔥"}</span>
          <div><div style={{fontWeight:700,fontSize:'.85rem',color:'#92400e'}}>{myM ? myM.streak : 0} Streak</div><div style={{fontSize:'.66rem',color:'#b45309'}}>meeting attendance</div></div>
        </div>
        <div className="card" style={{background:'linear-gradient(135deg,#eff6ff,#dbeafe)',display:'flex',alignItems:'center',gap:8,padding:12,marginBottom:0}}>
          <span style={{fontSize:'1.3rem'}}>{"💳"}</span>
          <div>
            <div style={{fontWeight:600,fontSize:'.78rem',color:'#1e40af'}}>{paidDues.includes(user.id) ? 'Dues Paid ✅' : 'Dues Pending ⚠️'}</div>
            <div style={{fontSize:'.66rem',color:'#3b82f6'}}>Monthly · ₦2,000</div>
          </div>
        </div>
      </div>
      <div className="sec">Quick Actions</div>
      <div className="qa">
        {[['📋','Check In','attendance'],['💬','Chat','chat'],['✅','Tasks','tasks'],['🗳️','Vote','voting'],['💰','Dues','finance'],['🎂','Birthdays','birthdays'],['🪪','ID Card','idcard'],['🏆','Ranks','leaderboard'],['📢','News','announcements']].map(([ic,l,p]) => (
          <button className="qab" key={l} onClick={() => navTo(p)}><span className="qai">{ic}</span><span className="qal">{l}</span></button>
        ))}
      </div>
      <div className="sec">Latest Announcements</div>
      {anns.filter(a => a.priority !== 'birthday').slice(0,2).map(a => (
        <div className={'ac ' + (a.priority||'')} key={a.id}><div className="at">{a.title}</div><div className="ab">{a.body.slice(0,90)}...</div><div className="am"><span>By {a.author} · {a.date}</span></div></div>
      ))}
      <div className="sec">{"🎂"} Today's Birthdays</div>
      {(() => {
        const now = new Date();
        const bd = members.filter(m => m.dobMonth===MONTHS[now.getMonth()] && String(m.dobDay)===String(now.getDate()));
        if (!bd.length) return <div style={{color:'#6b7c6b',fontSize:'.8rem',padding:'6px 0'}}>No birthdays today {"🌿"}</div>;
        return bd.map(m => (
          <div key={m.id} className="bday-wall" style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#f59e0b,#ec4899)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,flexShrink:0,overflow:'hidden'}}>
              {m.photo ? <img src={m.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : ini(m.name)}
            </div>
            <div><div style={{fontWeight:700,fontSize:'.88rem',color:'#92400e'}}>{"🎂"} {m.des?m.des+' ':''}{m.name}</div><div style={{fontSize:'.72rem',color:'#b45309'}}>Today is their birthday! {"🎊"}</div></div>
          </div>
        ));
      })()}
    </div>
    </div>
  );

  PG.attendance = (
    <div>
      <div className="inote blue">{"🔒"} Strict attendance: GPS verification, barcode scan, or biometric fingerprint required at {GEO.name}.</div>
      <input className="srch" placeholder="Search by name, ID or phone..." value={srch} onChange={e => setSrch(e.target.value)}/>
      <div className="tabs">{['Check In','History','Report'].map((t,i) => <button key={t} className={'tb2'+(G('att')===i?' on':'')} onClick={() => ST('att',i)}>{t}</button>)}</div>
      {G('att')===0 && (
        <div>
          <div className="mcard">
            <div style={{fontWeight:600,fontSize:'.84rem'}}>{"📅"} {nm.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
            <span className="bopen">Open</span>
          </div>
          <div className={'geobox' + (geoSt && geoSt.ok===false ? ' err' : '')}>
            <div style={{fontSize:'1.5rem',marginBottom:5}}>{geoSt && geoSt.ok ? '✅' : geoSt && geoSt.checking ? '⏳' : '📍'}</div>
            <div style={{fontSize:'.82rem',fontWeight:600,color:geoSt && geoSt.ok ? '#166534' : '#14532d'}}>{geoSt ? geoSt.msg : 'Verify your GPS location at meeting venue'}</div>
            {!geoSt && (
              <button className="btnP fw" style={{marginTop:9,padding:'9px'}} onClick={() => {
                setGeoSt({checking:true,msg:'Getting your GPS location...'});
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    pos => {
                      const dlat = (pos.coords.latitude - GEO.lat) * 111000;
                      const dlng = (pos.coords.longitude - GEO.lng) * 111000;
                      const dist = Math.round(Math.sqrt(dlat*dlat + dlng*dlng));
                      const acc = Math.round(pos.coords.accuracy);
                      if (dist <= GEO.radius) {
                        setGeoSt({ok:true, dist, msg:'Location verified at '+GEO.name+'. You are '+dist+'m from the entrance. GPS accuracy: '+acc+'m.'});
                      } else {
                        setGeoSt({ok:false, dist, msg:'CHECK-IN DENIED. You are '+dist+'m from '+GEO.name+'. You must be physically present at the meeting venue. Remote or proxy check-in is strictly not allowed.'});
                      }
                    },
                    err => {
                      const msgs = {1:'Location permission denied. Enable GPS in your phone settings and try again.',2:'GPS signal unavailable. Please go outdoors and retry.',3:'GPS request timed out. Please try again.'};
                      setGeoSt({ok:false, msg:msgs[err.code]||'GPS error. Please try again.'});
                    },
                    {enableHighAccuracy:true, timeout:15000, maximumAge:0}
                  );
                } else {
                  setGeoSt({ok:false, msg:'GPS not supported on this device. Please use a mobile phone.'});
                }
              }}>{"📍"} Verify My Location</button>
            )}
            {geoSt && !geoSt.checking && geoSt.ok && (
              <button className="btnS gr" style={{marginTop:8}} onClick={() => { markAtt(user.id,'present','geo'); setGeoSt(null); }}>{"✅"} Confirm My Attendance</button>
            )}
            {geoSt && !geoSt.checking && <button className="btnS a" style={{marginTop:6}} onClick={() => setGeoSt(null)}>Reset</button>}
          </div>
          {bioStep > 0 && (
            <div className="biobox">
              <div className="biofing">{"👆"}</div>
              <div style={{fontWeight:700}}>{bioStep===1 ? 'Place finger on sensor...' : 'Fingerprint Verified!'}</div>
            </div>
          )}
          <div className="scanbox" onClick={() => T('Camera opens on mobile to scan member QR/barcode.\nAdmin can verify scan at this device.')}>
            <div style={{fontSize:'2rem',marginBottom:5}}>{"📷"}</div>
            <div style={{fontSize:'.8rem',color:'#166534',fontWeight:500}}>Scan Member Barcode</div>
            <div style={{fontSize:'.68rem',color:'#6b7c6b',marginTop:2}}>Admin use — tap to open camera</div>
          </div>
          {filtM.map(m => {
            const cur = (m.att || [])[m.att.length-1] || '';
            const icons = {geo:'📍',scan:'📷',biometric:'👆'};
            return (
              <div className="ai" key={m.id}>
                <div className="aav">{m.photo ? <img src={m.photo} alt=""/> : ini(m.name)}</div>
                <div className="ain">
                  <div className="anm">{m.des?m.des+' ':''}{m.name}</div>
                  <div className="aid">{m.id} · {icons[m.method]||'✓'} {m.method}</div>
                </div>
                {m.status === 'suspended'
                  ? <span style={{fontSize:'.68rem',color:'#dc2626',fontWeight:600}}>Suspended</span>
                  : cur === 'present'
                    ? <span className="bopen" style={{fontSize:'.65rem'}}>Present</span>
                    : <div style={{display:'flex',gap:4}}>
                        <button className="btnS gr" title={icons[m.method]||''} onClick={() => {
                          if (m.method==='biometric') startBio(m.id);
                          else if (m.method==='geo') { T('GPS verified for '+m.name.split(' ')[0]); markAtt(m.id,'present','geo'); }
                          else { T('Barcode scanned for '+m.name.split(' ')[0]); markAtt(m.id,'present','scan'); }
                        }}>{icons[m.method]||'✓'}</button>
                        <button className="btnS r" onClick={() => markAtt(m.id,'absent')}>✗</button>
                        <button className="btnS a" onClick={() => markAtt(m.id,'excuse')}>E</button>
                      </div>
                }
              </div>
            );
          })}
        </div>
      )}
      {G('att')===1 && (
        <div className="card">
          <div style={{fontWeight:700,color:'#14532d',marginBottom:9}}>My Attendance History</div>
          {myAtt.length===0 ? <div style={{textAlign:'center',color:'#6b7c6b',padding:'20px 0'}}>No records yet</div> : myAtt.slice(-8).map((a,i) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #e2f0e2',fontSize:'.8rem'}}>
              <span>Meeting {i+1}</span>
              <span style={{fontWeight:600,color:a==='present'?'#166534':a==='absent'?'#dc2626':'#92400e'}}>{a==='present'?'Present':a==='absent'?'Absent':'Excused'}</span>
            </div>
          ))}
          <div style={{marginTop:9,textAlign:'center',color:'#6b7c6b',fontSize:'.76rem'}}>{attPct}% rate · {myAtt.filter(a=>a==='present').length}/{myAtt.length} meetings</div>
        </div>
      )}
      {G('att')===2 && (
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:11}}>
            {[['Present',members.filter(m=>m.att[m.att.length-1]==='present').length,'#dcfce7','#166534'],['Absent',members.filter(m=>m.att[m.att.length-1]==='absent').length,'#fee2e2','#dc2626'],['Excused',members.filter(m=>m.att[m.att.length-1]==='excuse').length,'#fef3c7','#92400e']].map(([l,n,bg,c]) => (
              <div key={l} style={{background:bg,borderRadius:11,padding:11,textAlign:'center'}}><div style={{fontSize:'1.5rem',fontWeight:900,color:c}}>{n}</div><div style={{fontSize:'.65rem',color:c}}>{l}</div></div>
            ))}
          </div>
          {members.map(m => {
            const s = m.att[m.att.length-1] || 'none';
            const bg = s==='present'?'#dcfce7':s==='absent'?'#fee2e2':s==='excuse'?'#fef3c7':'#f1f5f1';
            const c = s==='present'?'#166534':s==='absent'?'#dc2626':s==='excuse'?'#92400e':'#6b7c6b';
            return (
              <div key={m.id} style={{background:'#fff',borderRadius:10,padding:'9px 11px',marginBottom:5,display:'flex',alignItems:'center',gap:9,boxShadow:'0 1px 6px rgba(0,0,0,.05)'}}>
                <div style={{width:29,height:29,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#166534)',color:'#fff',fontWeight:700,fontSize:'.68rem',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden'}}>
                  {m.photo ? <img src={m.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : ini(m.name)}
                </div>
                <div style={{flex:1,fontSize:'.8rem',fontWeight:500}}>{m.name}</div>
                <span style={{background:bg,color:c,padding:'2px 8px',borderRadius:20,fontSize:'.65rem',fontWeight:600}}>{s}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  PG.members = (
    <div>
      <input className="srch" placeholder="Search by name, ID, town..." value={srch} onChange={e => setSrch(e.target.value)}/>
      <div className="chips">
        {[['all','All'],['exco','Exco'],['trustees','Trustees'],['member','Members'],['suspended','Suspended']].map(([r,l]) => (
          <button key={r} className={'chip'+(mf===r?' on':'')} onClick={() => setMf(r)}>{l}</button>
        ))}
      </div>
      <div className="mgrid">
        {filtM.map(m => (
          <div className="mc" key={m.id} onClick={() => openM('memberdetail', m)}>
            {m.status==='suspended' && <span className="sbadge">Suspended</span>}
            <div className="mav2">{m.photo ? <img src={m.photo} alt=""/> : ini(m.name)}</div>
            <div className="mn">{m.des?m.des+' ':''}{m.name.split(' ')[0]}</div>
            <div className="mr2">{rl(m.role)}</div>
            <div className="mpt">{"⭐"} {m.pts} pts</div>
            <span className="mbdg">{lvlE(m.pts)} {lvlI(m.pts).lbl}</span>
          </div>
        ))}
        {!filtM.length && <div className="empty" style={{gridColumn:'span 2'}}><span className="ei">{"👥"}</span><p>No members found</p></div>}
      </div>
    </div>
  );

  PG.tasks = (
    <div>
      <div className="tabs">{['My Tasks','All Tasks',...(isAdmin?['+Create']:[])].map((t,i) => <button key={t} className={'tb2'+(G('tasks')===i?' on':'')} onClick={() => ST('tasks',i)}>{t}</button>)}</div>
      {G('tasks')===0 && (() => {
        const mt = tasks.filter(t => t.assignee===user.id);
        if (!mt.length) return <div className="empty"><span className="ei">{"✅"}</span><p>No tasks assigned to you</p></div>;
        return mt.map(t => (
          <div className={'tcard '+(t.priority||'')} key={t.id}>
            <div className="tt">{t.title}</div><div className="td">{t.desc}</div>
            <div className="trow"><span className={'pri '+(t.priority||'')}>{(t.priority||'').toUpperCase()}</span><span className="tdue">{"📅"} {t.due}</span></div>
            <div style={{marginTop:8,display:'flex',alignItems:'center',gap:7}}>
              {t.status!=='done' ? <button className="btnS gr" onClick={() => completeTask(t.id)}>Mark Done</button> : <span className="tdone">Done ✅</span>}
            </div>
          </div>
        ));
      })()}
      {G('tasks')===1 && (tasks.length ? tasks.map(t => {
        const a = members.find(m => m.id===t.assignee);
        return (
          <div className={'tcard '+(t.priority||'')} key={t.id}>
            <div className="tt">{t.title}</div><div className="td">{t.desc}</div>
            <div className="trow">{a && <span style={{fontSize:'.7rem',color:'#6b7c6b'}}>{"👤"} {a.name.split(' ')[0]}</span>}<span className={'pri '+(t.priority||'')}>{(t.priority||'').toUpperCase()}</span><span className="tdue">{"📅"} {t.due}</span></div>
            <div style={{marginTop:8,display:'flex',gap:6}}>
              {t.status!=='done' ? <button className="btnS gr" onClick={() => completeTask(t.id)}>Done</button> : <span className="tdone">Done ✅</span>}
              {isAdmin && <button className="btnS r" style={{marginLeft:'auto'}} onClick={() => setTasks(ts => ts.filter(x => x.id!==t.id))}>{"🗑️"}</button>}
            </div>
          </div>
        );
      }) : <div className="empty"><span className="ei">{"✅"}</span><p>No tasks yet</p></div>)}
      {G('tasks')===2 && isAdmin && (
        <div className="card">
          <div className="fg"><label>Task Title *</label><input value={tform.title} onChange={e=>{const v=e.target.value;setTform(f=>({...f,title:v}))}} placeholder="Task title"/></div>
          <div className="fg"><label>Description</label><textarea value={tform.desc} onChange={e=>{const v=e.target.value;setTform(f=>({...f,desc:v}))}} rows={3} placeholder="Describe the task..."/></div>
          <div className="fg"><label>Assign To *</label>
            <select value={tform.assignee} onChange={e=>{const v=e.target.value;setTform(f=>({...f,assignee:v}))}}>
              {members.filter(m=>m.status==='active').map(m => <option key={m.id} value={m.id}>{m.name} ({rl(m.role)})</option>)}
            </select>
          </div>
          <div className="r2">
            <div className="fg"><label>Priority</label><select value={tform.priority} onChange={e=>{const v=e.target.value;setTform(f=>({...f,priority:v}))}}>{['low','medium','high'].map(p=><option key={p}>{p}</option>)}</select></div>
            <div className="fg"><label>Due Date *</label><input type="date" value={tform.due} onChange={e=>{const v=e.target.value;setTform(f=>({...f,due:v}))}}/></div>
          </div>
          <button className="btnP fw" onClick={() => { if(!tform.title||!tform.due){T('Fill title and due date');return;} setTasks(ts=>[{id:Date.now(),...tform,status:'pending',by:user.id},...ts]); setTform(f=>({...f,title:'',desc:''})); T('Task assigned!'); }}>Assign Task</button>
        </div>
      )}
    </div>
  );

  PG.finance = (
    <div>
      {!isFinance && !isAdmin && <div className="inote">Finance is managed by the Treasurer and Financial Secretary. Pay your dues and make contributions here.</div>}
      <div className="f3">
        {[['Income','g','₦'+income.toLocaleString()],['Expenses','r','₦'+expense.toLocaleString()],['Balance','b','₦'+(income-expense).toLocaleString()]].map(([l,cl,v]) => (
          <div className={'fc '+cl} key={l}><div className="fl">{l}</div><div className="fv">{v}</div></div>
        ))}
      </div>
      <div className="tabs">{['My Dues','Contributions',...((isFinance||isAdmin)?['Transactions']:[])].map((t,i) => <button key={t} className={'tb2'+(G('fin')===i?' on':'')} onClick={() => ST('fin',i)}>{t}</button>)}</div>
      {G('fin')===0 && (
        <div>
          <div className="cardG" style={{textAlign:'center'}}>
            <div>{paidDues.includes(user.id) ? <span className="bopen">Paid ✅</span> : <span className="bwarn">Pending ⚠️</span>}</div>
            <div style={{margin:'9px 0',fontSize:'.88rem',opacity:.9}}>Monthly Dues: <strong>₦2,000</strong></div>
            <button className="btnP" onClick={payDues}>Pay Now 💳</button>
          </div>
          <div className="card">
            <div style={{fontWeight:700,color:'#14532d',marginBottom:8}}>All Members Dues Status</div>
            {members.filter(m=>m.status==='active').map(m => {
              const paid = paidDues.includes(m.id);
              return (
                <div key={m.id} style={{display:'flex',alignItems:'center',padding:'6px 0',borderBottom:'1px solid #f0f4f0',gap:9}}>
                  <div style={{flex:1,fontSize:'.8rem'}}>{m.name}</div>
                  <span style={{fontSize:'.68rem',fontWeight:600,padding:'2px 8px',borderRadius:20,background:paid?'#dcfce7':'#fee2e2',color:paid?'#166534':'#dc2626'}}>{paid?'Paid':'Pending'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {G('fin')===1 && (
        <div>
          <div className="card">
            <div className="fg"><label>Amount (₦)</label><input type="number" value={cfAmt} onChange={e=>setCfAmt(e.target.value)} placeholder="0"/></div>
            <div className="fg"><label>Purpose</label><input value={cfPur} onChange={e=>setCfPur(e.target.value)} placeholder="e.g. Event support, Welfare fund"/></div>
            <button className="btnP fw" onClick={() => { if(!cfAmt||!cfPur){T('Fill amount and purpose');return;} setTxns(ts=>[{id:Date.now(),desc:'Contribution - '+user.name+': '+cfPur,type:'cr',amt:parseFloat(cfAmt),date:today(),cat:'contribution'},...ts]); setCfAmt(''); setCfPur(''); T('Contribution recorded! Thank you.'); }}>Submit Contribution</button>
          </div>
        </div>
      )}
      {G('fin')===2 && (isFinance||isAdmin) && txns.map(t => (
        <div className="txn" key={t.id}>
          <div style={{fontSize:'1.1rem'}}>{t.type==='cr'?'💰':'💸'}</div>
          <div style={{flex:1}}><div style={{fontWeight:600,fontSize:'.8rem'}}>{t.desc}</div><div style={{fontSize:'.66rem',color:'#6b7c6b'}}>{t.date} · {t.cat}</div></div>
          <div className={'ta '+t.type}>{t.type==='cr'?'+':'-'}₦{t.amt.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );

  PG.chat = (
    <div style={{display:'flex',flexDirection:'column'}}>
      <div className="chbar">{[['general','📢 General'],['exco','👔 Exco'],['welfare','❤️ Welfare'],['events','📅 Events'],['birthdays','🎂 Birthdays']].map(([c,l]) => (
        <button key={c} className={'cbtn'+(chan===c?' on':'')} onClick={() => setChan(c)}>{l}</button>
      ))}</div>
      <div className="cwin" ref={chatRef}>
        {!(chats[chan]||[]).length && <div className="empty"><span className="ei">{"💬"}</span><p>No messages yet</p></div>}
        {(chats[chan]||[]).map(m => {
          const me = m.sid===user.id;
          const sys = m.sid==='SYSTEM';
          return (
            <div className={'cm '+(sys?'sys':me?'me':'them')} key={m.id}>
              {!me && !sys && <div className="cm-sn">{m.sn}</div>}
              {sys && <div className="cm-sn" style={{textAlign:'center',color:'#9333ea'}}>{"🎂"} {m.sn}</div>}
              <div className="cb">{m.txt}</div>
              <div className="cm-meta">{m.t}</div>
            </div>
          );
        })}
      </div>
      <div className="cinp">
        <input value={chatInp} onChange={e => setChatInp(e.target.value)} placeholder="Type a message..." onKeyDown={e => e.key==='Enter'&&sendMsg()}/>
        <button className="csnd" onClick={sendMsg}>{"➤"}</button>
      </div>
    </div>
  );

  PG.complaints = (
    <div>
      <div className="tabs">{['Submit','Mine',...(isAdmin?['All']:[])].map((t,i) => <button key={t} className={'tb2'+(G('comp')===i?' on':'')} onClick={() => ST('comp',i)}>{t}</button>)}</div>
      {G('comp')===0 && (
        <div>
          <div className="inote">{"🔒"} Complaints are treated confidentially by the Exco.</div>
          <div className="card">
            <div className="fg"><label>Category</label><select value={cform.cat} onChange={e=>{const v=e.target.value;setCform(f=>({...f,cat:v}))}}>{['General Complaint','Welfare Issue','Financial Concern','Member Conduct','Exco Concern','Suggestion','Other'].map(c=><option key={c}>{c}</option>)}</select></div>
            <div className="fg"><label>Subject</label><input value={cform.sub} onChange={e=>{const v=e.target.value;setCform(f=>({...f,sub:v}))}} placeholder="Brief subject"/></div>
            <div className="fg"><label>Details</label><textarea rows={4} value={cform.det} onChange={e=>{const v=e.target.value;setCform(f=>({...f,det:v}))}} placeholder="Describe in detail..."/></div>
            <div className="fg"><label>Submit As</label><select value={cform.anon?'anon':'named'} onChange={e=>setCform(f=>({...f,anon:e.target.value==='anon'}))}><option value="named">Named</option><option value="anon">Anonymous</option></select></div>
            <button className="btnP fw" onClick={() => { if(!cform.sub||!cform.det){T('Fill subject and details');return;} setComplaints(cs=>[{id:Date.now(),sub:cform.sub,cat:cform.cat,det:cform.det,by:cform.anon?'Anonymous':user.name,date:today(),status:'open'},...cs]); setCform(f=>({...f,sub:'',det:''})); T('Complaint submitted.'); }}>Submit Complaint</button>
          </div>
        </div>
      )}
      {G('comp')===1 && (() => {
        const mine = complaints.filter(c => c.by===user.name||c.by===user.id);
        if (!mine.length) return <div className="empty"><span className="ei">{"📣"}</span><p>No complaints yet</p></div>;
        return mine.map(c => (
          <div className="ccc" key={c.id}><div className="csub">{c.sub}</div><span className="ccat">{c.cat}</span>
            <p style={{fontSize:'.76rem',color:'#6b7c6b',marginTop:6,lineHeight:1.5}}>{c.det.slice(0,110)}...</p>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}><span style={{fontSize:'.65rem',color:'#6b7c6b'}}>{c.date}</span><span className={'cst '+c.status}>{c.status}</span></div>
          </div>
        ));
      })()}
      {G('comp')===2 && isAdmin && complaints.map(c => (
        <div className="ccc" key={c.id}><div className="csub">{c.sub}</div><span className="ccat">{c.cat}</span>
          <p style={{fontSize:'.76rem',color:'#6b7c6b',marginTop:6,lineHeight:1.5}}>{c.det.slice(0,100)}...</p>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:6,flexWrap:'wrap',gap:5}}><span style={{fontSize:'.65rem',color:'#6b7c6b'}}>By {c.by} · {c.date}</span><span className={'cst '+c.status}>{c.status}</span></div>
          <div className="arow">
            <button className="btnS a" onClick={()=>setComplaints(cs=>cs.map(x=>x.id===c.id?{...x,status:'inprogress'}:x))}>In Progress</button>
            <button className="btnS g" onClick={()=>setComplaints(cs=>cs.map(x=>x.id===c.id?{...x,status:'resolved'}:x))}>Resolved</button>
            <button className="btnS r" onClick={()=>setComplaints(cs=>cs.filter(x=>x.id!==c.id))}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );

  PG.voting = (
    <div>
      <div className="cardB" style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{fontSize:'2.4rem'}}>{"🗳️"}</div>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700}}>2026 Exco Elections</div>
          <div style={{fontSize:'.72rem',opacity:.8,marginTop:2}}>2-Year Tenure · All Members Vote</div>
          <div style={{fontSize:'.72rem',color:'#93c5fd',marginTop:4,fontWeight:600}}>{daysTo('2026-09-13')>0 ? daysTo('2026-09-13')+' days to election' : 'Voting is OPEN!'}</div>
        </div>
      </div>
      <div className="tabs">{['Polls','Results','Candidates',...(isAdmin?['Manage']:[])].map((t,i) => <button key={t} className={'tb2'+(G('vote')===i?' on':'')} onClick={() => ST('vote',i)}>{t}</button>)}</div>
      {G('vote')===0 && polls.map(p => {
        const tot = p.opts.reduce((s,o)=>s+o.v,0)||1;
        const voted = p.voters.includes(user.id);
        return (
          <div className="pc" key={p.id}>
            <div className="pq">{p.q}</div>
            {p.opts.map((o,i) => (
              <div key={i} className={'po'+(voted?' voted':'')} onClick={() => !voted && castVote(p.id,i)}>
                <div style={{flex:1}}>
                  <div style={{fontSize:'.82rem',fontWeight:500,marginBottom:voted?5:0}}>{o.t}</div>
                  {voted && <div className="pbb"><div className="pbf" style={{width:Math.round(o.v/tot*100)+'%'}}/></div>}
                </div>
                {voted && <div className="ppc">{Math.round(o.v/tot*100)}%</div>}
              </div>
            ))}
            <div style={{fontSize:'.68rem',color:'#6b7c6b',marginTop:5}}>Ends: {p.end} · {tot} votes</div>
            {voted ? <div style={{fontSize:'.72rem',color:'#166534',fontWeight:600,marginTop:6}}>You voted ✅</div> : <div style={{fontSize:'.72rem',color:'#22c55e',fontWeight:600,marginTop:6}}>Tap to vote</div>}
          </div>
        );
      })}
      {G('vote')===1 && polls.map(p => {
        const tot = p.opts.reduce((s,o)=>s+o.v,0)||1;
        return (
          <div className="pc" key={p.id}><div className="pq">{p.q}</div>
            {p.opts.map((o,i) => (
              <div key={i} style={{marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'.8rem',marginBottom:4}}><span>{o.t}</span><strong>{Math.round(o.v/tot*100)}% ({o.v})</strong></div>
                <div className="pbb"><div className="pbf" style={{width:Math.round(o.v/tot*100)+'%'}}/></div>
              </div>
            ))}
          </div>
        );
      })}
      {G('vote')===2 && (() => {
        const gp = {};
        SEED_CANDS.forEach(c => { if (!gp[c.pos]) gp[c.pos]=[]; gp[c.pos].push(c); });
        return Object.entries(gp).map(([pos,cands]) => (
          <div key={pos}>
            <div style={{fontWeight:700,color:'#14532d',fontSize:'.76rem',textTransform:'uppercase',letterSpacing:'.7px',margin:'13px 0 7px'}}>{pos}</div>
            {cands.map(c => (
              <div className="cdc" key={c.id}><div className="cdav">{ini(c.name)}</div>
                <div><div style={{fontWeight:700,fontSize:'.86rem'}}>{c.name}</div><div style={{fontSize:'.7rem',color:'#166534',fontWeight:600}}>{c.pos}</div><div style={{fontSize:'.72rem',color:'#6b7c6b',marginTop:3}}>{c.bio}</div></div>
              </div>
            ))}
          </div>
        ));
      })()}
      {G('vote')===3 && isAdmin && (
        <div className="card">
          <div className="fg"><label>Poll Question</label><input value={pform.q} onChange={e=>{const v=e.target.value;setPform(f=>({...f,q:v}))}} placeholder="e.g. Should we..."/></div>
          <div className="r2">
            <div className="fg"><label>Type</label><select value={pform.type} onChange={e=>{const v=e.target.value;setPform(f=>({...f,type:v}))}}>{['Yes / No','Multiple Choice','Election'].map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="fg"><label>End Date</label><input type="date" value={pform.end} onChange={e=>{const v=e.target.value;setPform(f=>({...f,end:v}))}}/></div>
          </div>
          <button className="btnP fw" onClick={() => { if(!pform.q){T('Enter a question');return;} const opts=pform.type==='Yes / No'?[{t:'Yes',v:0},{t:'No',v:0}]:[{t:'Option 1',v:0},{t:'Option 2',v:0},{t:'Option 3',v:0}]; setPolls(ps=>[...ps,{id:Date.now(),q:pform.q,opts,end:pform.end,voters:[]}]); setPform({q:'',type:'Yes / No',end:''}); T('Poll created!'); }}>Create Poll</button>
          <div style={{marginTop:12}}>{polls.map(p => (
            <div key={p.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #e2f0e2'}}>
              <span style={{fontSize:'.76rem',flex:1}}>{p.q.slice(0,45)}...</span>
              <button className="btnS r" onClick={() => setPolls(ps=>ps.filter(x=>x.id!==p.id))}>{"🗑️"}</button>
            </div>
          ))}</div>
        </div>
      )}
    </div>
  );

  PG.leaderboard = (
    <div>
      <div style={{textAlign:'center',marginBottom:11}}>
        <div style={{fontFamily:"'Playfair Display',serif",color:'#14532d',fontSize:'1.15rem',fontWeight:700}}>{"🏆"} Members Leaderboard</div>
        <p style={{color:'#6b7c6b',fontSize:'.76rem',marginTop:3}}>Points for attendance, tasks and engagement</p>
      </div>
      <div className="cardG" style={{marginBottom:11}}>
        <div style={{fontWeight:700,fontSize:'.76rem',marginBottom:8,textTransform:'uppercase',letterSpacing:'.5px'}}>How to Earn Points</div>
        {[['📍 GPS check-in','+10'],['📷 Scan check-in','+10'],['👆 Biometric check-in','+10'],['📋 Task completed','+20'],['💬 Chat message','+2'],['💰 Dues on time','+5'],['🔥 3-meeting streak','+25'],['🎉 Event RSVP','+8']].map(([a,b]) => (
          <div key={a} style={{display:'flex',justifyContent:'space-between',fontSize:'.75rem',marginBottom:4}}><span>{a}</span><strong style={{color:'#86efac'}}>{b}</strong></div>
        ))}
      </div>
      {sortedM.map((m,i) => {
        const r=i+1; const tr=r===1?'🥇':r===2?'🥈':r===3?'🥉':''; const me=m.id===user.id;
        return (
          <div className={'lbi'+(me?' me':'')} key={m.id}>
            <div className="lbr" style={{color:r===1?'gold':r===2?'silver':r===3?'#cd7f32':'inherit'}}>{tr||r}</div>
            <div className="lbav">{m.photo?<img src={m.photo} alt=""/>:ini(m.name)}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:'.82rem'}}>{m.des?m.des+' ':''}{m.name}{me?' (You)':''}</div><div style={{fontSize:'.67rem',color:'#6b7c6b'}}>{rl(m.role)}</div></div>
            <div style={{textAlign:'right'}}><div className="lbp">{m.pts}</div><div style={{fontSize:'.62rem',color:'#6b7c6b'}}>pts</div></div>
          </div>
        );
      })}
    </div>
  );

  PG.events = (
    <div>
      <div className="tabs">{['Upcoming','Past',...(isAdmin?['+Create']:[])].map((t,i) => <button key={t} className={'tb2'+(G('evts')===i?' on':'')} onClick={() => ST('evts',i)}>{t}</button>)}</div>
      {G('evts')<=1 && (() => {
        const evts = events.filter(e => G('evts')===0 ? e.upcoming : !e.upcoming);
        if (!evts.length) return <div className="empty"><span className="ei">{"📅"}</span><p>No events</p></div>;
        return evts.map(e => {
          const d = new Date(e.date); const dy = daysTo(e.date);
          return (
            <div className="ec" key={e.id}>
              <div style={{overflow:'hidden'}}>
                <div className="ebg"><div className="eday">{d.getDate()}</div><div className="emon">{d.toLocaleString('en',{month:'short'})}</div></div>
                <div className="etit">{e.title}</div>
                <div className="even">{"📍"} {e.venue}</div>
                <div className="etim">{"⏰"} {e.time}{e.upcoming&&dy>=0?' · '+(dy===0?'Today':dy===1?'Tomorrow':'In '+dy+' days'):''}</div>
                <div className="edsc">{e.desc}</div>
              </div>
              <div style={{display:'flex',gap:7,marginTop:8,flexWrap:'wrap'}}>
                {e.upcoming && <button className="rsvpb" onClick={() => { if(rsvps.includes(e.id)){T("Already RSVP'd!");return;} setRsvps(r=>[...r,e.id]); setMembers(ms=>ms.map(m=>m.id===user.id?{...m,pts:m.pts+8}:m)); setUser(u=>({...u,pts:(u.pts||0)+8})); PP('+8 pts! Event RSVP'); T("RSVP confirmed! +8 pts"); }}>{rsvps.includes(e.id)?"RSVP'd ✅":'RSVP / Attend'}</button>}
                {isAdmin && <button className="btnS r" onClick={() => setEvents(es=>es.filter(x=>x.id!==e.id))}>Delete</button>}
              </div>
            </div>
          );
        });
      })()}
      {G('evts')===2 && isAdmin && (
        <div className="card">
          <div className="fg"><label>Event Title *</label><input value={eform.title} onChange={e=>{const v=e.target.value;setEform(f=>({...f,title:v}))}} placeholder="Event name"/></div>
          <div className="r2">
            <div className="fg"><label>Date *</label><input type="date" value={eform.date} onChange={e=>{const v=e.target.value;setEform(f=>({...f,date:v}))}}/></div>
            <div className="fg"><label>Time</label><input type="time" value={eform.time} onChange={e=>{const v=e.target.value;setEform(f=>({...f,time:v}))}}/></div>
          </div>
          <div className="fg"><label>Venue</label><input value={eform.venue} onChange={e=>{const v=e.target.value;setEform(f=>({...f,venue:v}))}} placeholder="Location"/></div>
          <div className="fg"><label>Description</label><textarea value={eform.desc} onChange={e=>{const v=e.target.value;setEform(f=>({...f,desc:v}))}} placeholder="Details..."/></div>
          <button className="btnP fw" onClick={() => { if(!eform.title||!eform.date){T('Fill title and date');return;} setEvents(es=>[{id:Date.now(),...eform,upcoming:true},...es]); setEform({title:'',date:'',time:'',venue:'',desc:''}); T('Event created!'); }}>Create Event</button>
        </div>
      )}
    </div>
  );

  PG.announcements = (
    <div>
      <div className="tabs">{['All',...(isAdmin?['+Post']:[])].map((t,i) => <button key={t} className={'tb2'+(G('ann')===i?' on':'')} onClick={() => ST('ann',i)}>{t}</button>)}</div>
      {G('ann')===0 && anns.map(a => (
        <div className={'ac '+(a.priority||'')} key={a.id}>
          <div className="at">{a.title}</div>
          <div className="ab">{a.body}</div>
          <div className="am">
            <span>By {a.author} · {a.date}</span>
            {isAdmin && <button className="btnS r" style={{fontSize:'.6rem',padding:'2px 6px'}} onClick={() => setAnns(as=>as.filter(x=>x.id!==a.id))}>Delete</button>}
          </div>
        </div>
      ))}
      {G('ann')===1 && isAdmin && (
        <div className="card">
          <div className="fg"><label>Title</label><input value={aform.title} onChange={e=>{const v=e.target.value;setAform(f=>({...f,title:v}))}} placeholder="Title"/></div>
          <div className="fg"><label>Message</label><textarea rows={4} value={aform.body} onChange={e=>{const v=e.target.value;setAform(f=>({...f,body:v}))}} placeholder="Write announcement..."/></div>
          <div className="fg"><label>Priority</label><select value={aform.priority} onChange={e=>{const v=e.target.value;setAform(f=>({...f,priority:v}))}}><option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option></select></div>
          <button className="btnP fw" onClick={() => { if(!aform.title||!aform.body){T('Fill title and body');return;} setAnns(as=>[{id:Date.now(),...aform,author:user.name,date:today()},...as]); setAform({title:'',body:'',priority:'normal'}); T('Announcement posted!'); }}>Post Announcement</button>
        </div>
      )}
    </div>
  );

  PG.profile = (() => {
    const u = myM || user;
    const bars = barBits(u.id);
    const now = new Date();
    const isBday = u.dobMonth===MONTHS[now.getMonth()] && String(u.dobDay)===String(now.getDate());
    return (
      <div>
        <div className="ph">
          <div className="pav">{u.photo ? <img src={u.photo} alt=""/> : ini(u.name)}</div>
          <div className="pnm">{u.des?u.des+' ':''}{u.name}</div>
          <div className="prl">{rl(u.role)}</div>
          <div className="pid">{u.id}</div>
          {isBday && <div style={{marginTop:8,background:'rgba(255,255,255,.2)',borderRadius:20,padding:'4px 14px',fontSize:'.78rem',fontWeight:600}}>{"🎂"} Today is your Birthday!</div>}
        </div>
        <div className="bcwrap" onClick={() => openM('barcode', u)}>
          <div style={{fontWeight:600,fontSize:'.76rem',color:'#6b7c6b',marginBottom:2}}>My Check-In Barcode</div>
          <div className="bcbars">{bars.map((b,i) => <div key={i} className="bar" style={{width:b.w*2,height:b.h}}/>)}</div>
          <div className="bcid">{u.id}</div>
          <div style={{fontSize:'.65rem',color:'#6b7c6b',marginTop:2}}>Tap to enlarge · {u.method==='geo'?'📍 GPS':u.method==='scan'?'📷 Scan':'👆 Biometric'}</div>
        </div>
        <div className="ps4">{[[attPct+'%','Attendance'],[myPts,'Points'],[myDone,'Tasks'],[myM?myM.streak:0,'Streak']].map(([v,l]) => (
          <div className="psc" key={l}><div className="psv">{v}</div><div className="psl">{l}</div></div>
        ))}</div>
        <div className="card">
          {[['Phone',u.phone],['Email',u.email],['Address',u.addr],['Home Town',u.town],['Profession',u.prof],['Birthday',u.dobDay&&u.dobMonth?u.dobDay+' '+u.dobMonth+(u.dobYear?' '+u.dobYear:''):'--'],['Next of Kin',u.nok],['Member Since',fmtD(u.joined)],['Check-in',u.method==='geo'?'GPS':u.method==='scan'?'Scan':'Biometric'],['Level',lvlE(myPts)+' '+lvl.lbl]].map(([l,v]) => (
            <div className="dr" key={l}><span className="dl">{l}</span><span className="dv">{v||'--'}</span></div>
          ))}
        </div>
        <div className="sec">Badges</div>
        <div className="brow">
          {[{i:'🌱',l:'Member',e:true},{i:'🔥',l:'Streak x3',e:(myM?myM.streak:0)>=3},{i:'⭐',l:'200 pts',e:myPts>=200},{i:'🥇',l:'Gold',e:myPts>=500},{i:'💰',l:'Dues',e:paidDues.includes(u.id)},{i:'✅',l:'5 Tasks',e:myDone>=5},{i:'🏆',l:'Top 3',e:myRank<=3},{i:'🎂',l:'B-day',e:isBday}].map(b => (
            <div className="bc" key={b.l} style={{opacity:b.e?1:.3}}><span className="bico">{b.i}</span><div className="blbl">{b.l}</div></div>
          ))}
        </div>
        <div style={{display:'flex',gap:8,marginTop:9}}>
          <button className="btnO fw" onClick={() => openM('editprofile', {...u})}>Edit Profile</button>
          <button className="btnP fw" onClick={() => navTo('idcard')}>{"🪪"} ID Card</button>
        </div>
      </div>
    );
  })();

  PG.idcard = (() => {
    const m = members.find(x => x.id===user.id) || user;
    return (
      <div>
        <div style={{textAlign:'center',marginBottom:12}}>
          <div style={{fontFamily:"'Playfair Display',serif",color:'#14532d',fontSize:'1.15rem',fontWeight:700}}>{"🪪"} My Membership ID Card</div>
          <p style={{color:'#6b7c6b',fontSize:'.76rem',marginTop:4}}>Present this card at all forum events</p>
        </div>
        <IDCard m={m}/>
        <button className="btnP fw" onClick={() => T('Screenshot to save your ID card. PDF export available in production build.')}>Download / Save Card</button>
        <div className="inote blue" style={{marginTop:12}}>Your ID card is auto-generated from your registered profile information. Update your photo in Profile to refresh it.</div>
        {isAdmin && (
          <div style={{marginTop:14}}>
            <div className="sec">Generate ID for Any Member</div>
            <div className="fg"><label>Select Member</label>
              <select onChange={e => { const found=members.find(x=>x.id===e.target.value); if(found) openM('memberidcard',found); }}>
                <option value="">-- Select member --</option>
                {members.map(m2 => <option key={m2.id} value={m2.id}>{m2.name} ({m2.id})</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
    );
  })();

  PG.birthdays = (
    <div>
      <div className="cardG" style={{textAlign:'center'}}>
        <div style={{fontSize:'2rem',marginBottom:6}}>{"🎂"}</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',fontWeight:700}}>Birthday Celebrations</div>
        <div style={{fontSize:'.76rem',opacity:.8,marginTop:4}}>Auto birthday post at 6:00 AM · Pop-up greeting at 1:00 AM</div>
      </div>
      <div className="sec">Today's Birthdays</div>
      {(() => {
        const now = new Date();
        const bd = members.filter(m => m.dobMonth===MONTHS[now.getMonth()] && String(m.dobDay)===String(now.getDate()));
        if (!bd.length) return <div className="empty"><span className="ei">{"🌿"}</span><p>No birthdays today</p></div>;
        return bd.map(m => (
          <div key={m.id} style={{background:'linear-gradient(135deg,#fef3c7,#fde68a)',borderRadius:13,padding:14,marginBottom:9,boxShadow:'0 1px 7px rgba(217,119,6,.15)'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
              <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#f59e0b,#ec4899)',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'1.1rem',flexShrink:0}}>
                {m.photo ? <img src={m.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : ini(m.name)}
              </div>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1rem',color:'#92400e'}}>{"🎂"} {m.des?m.des+' ':''}{m.name}</div>
                <div style={{fontSize:'.72rem',color:'#b45309'}}>{rl(m.role)} · {m.town}</div>
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,.5)',borderRadius:9,padding:'10px 12px',fontSize:'.78rem',color:'#78350f',lineHeight:1.6,marginBottom:10}}>{PRAYERS[0]}</div>
            <button className="btnP fw" style={{background:'linear-gradient(135deg,#f59e0b,#d97706)'}} onClick={() => setBdayModal({member:m,key:'bday-'+m.id+'-'+now.getFullYear()})}>Send Birthday Greeting {"🎉"}</button>
          </div>
        ));
      })()}
      <div className="sec">Upcoming Birthdays (Next 30 Days)</div>
      {(() => {
        const now = new Date();
        const up = members.filter(m => {
          if (!m.dobMonth||!m.dobDay) return false;
          const mi = MONTHS.indexOf(m.dobMonth); if (mi<0) return false;
          const d = new Date(now.getFullYear(),mi,parseInt(m.dobDay));
          const diff = (d-now)/86400000;
          return diff>0 && diff<=30;
        }).sort((a,b) => {
          const ai = new Date(new Date().getFullYear(),MONTHS.indexOf(a.dobMonth),parseInt(a.dobDay));
          const bi = new Date(new Date().getFullYear(),MONTHS.indexOf(b.dobMonth),parseInt(b.dobDay));
          return ai-bi;
        });
        if (!up.length) return <div style={{color:'#6b7c6b',fontSize:'.8rem',padding:'6px 0'}}>No birthdays in next 30 days</div>;
        return up.map(m => {
          const d = new Date(new Date().getFullYear(),MONTHS.indexOf(m.dobMonth),parseInt(m.dobDay));
          const dy = Math.ceil((d-new Date())/86400000);
          return (
            <div key={m.id} style={{background:'#fff',borderRadius:11,padding:'11px 13px',marginBottom:7,display:'flex',alignItems:'center',gap:10,boxShadow:'0 1px 7px rgba(20,83,45,.07)'}}>
              <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#f59e0b,#ec4899)',color:'#fff',fontWeight:700,fontSize:'.78rem',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden'}}>
                {m.photo ? <img src={m.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : ini(m.name)}
              </div>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:'.84rem'}}>{m.des?m.des+' ':''}{m.name}</div><div style={{fontSize:'.68rem',color:'#6b7c6b'}}>{m.dobDay} {m.dobMonth}</div></div>
              <div style={{textAlign:'right'}}><div style={{fontSize:'.78rem',fontWeight:700,color:'#d97706'}}>In {dy} day{dy!==1?'s':''}</div></div>
            </div>
          );
        });
      })()}
      <div className="sec">All Members Birthdays</div>
      {[...members].sort((a,b) => (MONTHS.indexOf(a.dobMonth)*31+(parseInt(a.dobDay)||0))-(MONTHS.indexOf(b.dobMonth)*31+(parseInt(b.dobDay)||0))).map(m => (
        <div key={m.id} style={{background:'#fff',borderRadius:11,padding:'9px 12px',marginBottom:5,display:'flex',alignItems:'center',gap:9,boxShadow:'0 1px 6px rgba(0,0,0,.05)'}}>
          <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#f59e0b,#ec4899)',color:'#fff',fontWeight:700,fontSize:'.68rem',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden'}}>
            {m.photo ? <img src={m.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : ini(m.name)}
          </div>
          <div style={{flex:1,fontSize:'.8rem',fontWeight:600}}>{m.name}</div>
          <div style={{fontSize:'.72rem',color:'#6b7c6b',fontWeight:600}}>{m.dobDay&&m.dobMonth ? m.dobDay+' '+m.dobMonth.slice(0,3) : '--'}</div>
        </div>
      ))}
    </div>
  );

  PG.admin = (
    <div>
      <div className="agrid">
        {[['👥','Members','members'],['📋','Attend.','attendance'],['💰','Finance','finance'],['✅','Tasks','tasks'],['🗳️','Elections','voting'],['📢','Announce','announcements'],['📅','Events','events'],['🎂','Birthdays','birthdays'],['🪪','ID Cards','idcard'],['⚙️','Settings','settings']].map(([ic,l,p]) => (
          <div className="acard" key={l} onClick={() => navTo(p)}><div className="aico">{ic}</div><div>{l}</div></div>
        ))}
      </div>
      <button className="btnP fw" style={{marginBottom:12}} onClick={() => { setReg({...blank}); openM('adminreg',null); }}>{"➕"} Register New Member</button>
      <div className="sec">Forum Statistics</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:13}}>
        {[[members.filter(m=>m.status==='active').length,'Active Members','#14532d'],['₦'+income.toLocaleString(),'Total Income','#166534'],[paidDues.length,'Dues Paid','#d97706'],[tasks.filter(t=>t.status==='done').length,'Tasks Done','#22c55e'],[pending.length,'Pending Regs','#dc2626'],[members.filter(m=>m.status==='suspended').length,'Suspended','#6b7c6b']].map(([v,l,c]) => (
          <div key={l} style={{background:'#fff',borderRadius:11,padding:13,textAlign:'center',boxShadow:'0 1px 7px rgba(20,83,45,.07)'}}>
            <div style={{fontSize:String(v).length>5?'.9rem':'1.5rem',fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:'.67rem',color:'#6b7c6b',marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>
      <div className="sec">Pending Registrations ({pending.length})</div>
      {!pending.length ? <div className="empty"><span className="ei">{"✅"}</span><p>No pending registrations</p></div> : pending.map(m => (
        <div key={m.id} style={{background:'#fff',borderRadius:11,padding:12,marginBottom:7,boxShadow:'0 1px 7px rgba(20,83,45,.07)'}}>
          <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:7}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#166534)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,overflow:'hidden',flexShrink:0}}>
              {m.photo ? <img src={m.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : ini(m.name)}
            </div>
            <div><div style={{fontWeight:600,fontSize:'.85rem'}}>{m.name}</div><div style={{fontSize:'.72rem',color:'#6b7c6b'}}>{m.id} · {m.phone}</div><div style={{fontSize:'.72rem',color:'#6b7c6b'}}>{m.prof} · {m.town}</div></div>
          </div>
          <div className="arow">
            <button className="btnS g" onClick={() => { setMembers(ms=>[...ms,{...m,status:'active'}]); setPending(ps=>ps.filter(x=>x.id!==m.id)); T(m.name+' approved! ID: '+m.id); }}>Approve ✅</button>
            <button className="btnS r" onClick={() => { setPending(ps=>ps.filter(x=>x.id!==m.id)); T('Application rejected.'); }}>Reject ❌</button>
            <button className="btnS b" onClick={() => openM('memberidcard',m)}>Preview ID 🪪</button>
          </div>
        </div>
      ))}
      <div className="sec">All Members</div>
      {members.map(m => (
        <div key={m.id} style={{background:'#fff',borderRadius:10,padding:'9px 11px',marginBottom:5,display:'flex',alignItems:'center',gap:9,boxShadow:'0 1px 6px rgba(0,0,0,.04)'}}>
          <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#166534)',color:'#fff',fontWeight:700,fontSize:'.7rem',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden'}}>
            {m.photo ? <img src={m.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : ini(m.name)}
          </div>
          <div style={{flex:1}}><div style={{fontWeight:600,fontSize:'.8rem'}}>{m.des?m.des+' ':''}{m.name}</div><div style={{fontSize:'.65rem',color:'#6b7c6b'}}>{m.id} · {rl(m.role)} · {m.status==='suspended'?'Suspended':'Active'}</div></div>
          <div style={{display:'flex',gap:4}}>
            <button className="btnS b" style={{padding:'3px 7px',fontSize:'.62rem'}} onClick={() => openM('editmember',{...m})}>Edit</button>
            {m.status!=='suspended'
              ? <button className="btnS r" style={{padding:'3px 7px',fontSize:'.62rem'}} onClick={() => { setMembers(ms=>ms.map(x=>x.id===m.id?{...x,status:'suspended'}:x)); T('Member suspended'); }}>Suspend</button>
              : <button className="btnS g" style={{padding:'3px 7px',fontSize:'.62rem'}} onClick={() => { setMembers(ms=>ms.map(x=>x.id===m.id?{...x,status:'active'}:x)); T('Member activated'); }}>Activate</button>
            }
          </div>
        </div>
      ))}
    </div>
  );


  // ── SETTINGS PAGE ─────────────────────────────────────────────────────────
  PG.settings = (
    <div>
      <div className="cardG" style={{textAlign:'center',marginBottom:12}}>
        <div style={{fontSize:'2rem',marginBottom:6}}>{"⚙️"}</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',fontWeight:700}}>Forum App Settings</div>
        <div style={{fontSize:'.76rem',opacity:.8,marginTop:4}}>Locked with admin PIN code</div>
      </div>

      {!settingsUnlocked ? (
        <div className="card" style={{textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:10}}>{"🔒"}</div>
          <div style={{fontWeight:700,fontSize:'.95rem',color:'#14532d',marginBottom:5}}>Settings are PIN Protected</div>
          <div style={{fontSize:'.78rem',color:'#6b7c6b',marginBottom:16}}>Enter your 4-digit admin PIN to access and modify settings</div>
          <div className="fg"><label>Enter PIN</label>
            <input type="password" maxLength={4} value={settingsPinInput}
              onChange={e=>{const v=e.target.value;setSettingsPinInput(v);}}
              placeholder="Enter 4-digit PIN" style={{textAlign:'center',fontSize:'1.5rem',letterSpacing:8}}
              onKeyDown={e=>e.key==='Enter'&&unlockSettings()}/>
          </div>
          <button className="btnP fw" onClick={unlockSettings}>{"🔓"} Unlock Settings</button>
          <div style={{marginTop:9,fontSize:'.72rem',color:'#6b7c6b'}}>Default PIN: 0000 (change after first login)</div>
        </div>
      ) : (
        <div>
          <div style={{background:'#dcfce7',borderRadius:11,padding:'9px 13px',marginBottom:11,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'.8rem',color:'#166534',fontWeight:600}}>{"🔓"} Settings Unlocked</span>
            <button className="btnS r" onClick={()=>{setSettingsUnlocked(false);setSettingsPinInput('');}}>Lock</button>
          </div>

          <div className="sec">Forum Identity</div>
          <div className="card">
            <div className="fg"><label>Forum Name</label>
              <input value={settings.forumName} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,forumName:v}));}}/>
            </div>
            <div className="fg"><label>Tagline / Slogan</label>
              <input value={settings.tagline} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,tagline:v}));}}/>
            </div>
            <div className="fg"><label>Description</label>
              <textarea rows={3} value={settings.description} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,description:v}));}}/>
            </div>
            <div className="fg"><label>Upload Forum Logo</label>
              <div className="photo-area">
                <input type="file" accept="image/*" onChange={e=>handlePhoto(e,v=>setSettings(s=>({...s,logo:v})))}/>
                {settings.logo
                  ? <img src={settings.logo} style={{width:80,height:80,objectFit:'contain',display:'block',margin:'0 auto'}} alt="logo"/>
                  : <div><div style={{fontSize:'2rem'}}>{"🖼️"}</div><div style={{fontSize:'.78rem',color:'#166534'}}>Tap to upload logo</div></div>
                }
              </div>
            </div>
            <div className="fg"><label>Theme Color</label>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <input type="color" value={settings.themeColor} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,themeColor:v}));}} style={{width:50,height:40,padding:2,border:'2px solid #e2f0e2',borderRadius:8}}/>
                <span style={{fontSize:'.8rem',color:'#6b7c6b'}}>{settings.themeColor}</span>
              </div>
            </div>
          </div>

          <div className="sec">Contact Information</div>
          <div className="card">
            <div className="r2">
              <div className="fg"><label>Phone Number</label><input type="tel" value={settings.phone} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,phone:v}));}}/></div>
              <div className="fg"><label>Email Address</label><input type="email" value={settings.email} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,email:v}));}}/></div>
            </div>
            <div className="fg"><label>Office Address</label>
              <input value={settings.address} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,address:v}));}}/>
            </div>
            <div className="r2">
              <div className="fg"><label>Country</label><input value={settings.country} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,country:v}));}}/></div>
              <div className="fg"><label>State</label><input value={settings.state} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,state:v}));}}/></div>
            </div>
          </div>

          <div className="sec">Financial Settings</div>
          <div className="card">
            <div className="r2">
              <div className="fg"><label>Currency Name</label><input value={settings.currency} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,currency:v}));}}/></div>
              <div className="fg"><label>Currency Symbol</label><input value={settings.currencySymbol} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,currencySymbol:v}));}}/></div>
            </div>
            <div className="r2">
              <div className="fg"><label>Exchange Rate (to USD)</label><input type="number" value={settings.currencyRate} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,currencyRate:v}));}}/></div>
              <div className="fg"><label>Monthly Dues Amount</label><input type="number" value={settings.monthlyDues} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,monthlyDues:v}));}}/></div>
            </div>
            <div className="r2">
              <div className="fg"><label>Member Card Fee</label><input type="number" value={settings.memberCardFee} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,memberCardFee:v}));}}/></div>
              <div className="fg"><label>Min. Contribution</label><input type="number" value={settings.contributionMin} onChange={e=>{const v=e.target.value;setSettings(s=>({...s,contributionMin:v}));}}/></div>
            </div>
          </div>

          <div className="sec">Rules & Regulations</div>
          <div className="card">
            <div style={{fontSize:'.76rem',color:'#6b7c6b',marginBottom:9}}>Dos and Don'ts — displayed to all members</div>
            {settings.rules.map((rule,i) => (
              <div key={i} style={{display:'flex',gap:7,marginBottom:7,alignItems:'flex-start'}}>
                <span style={{fontWeight:700,color:'#166534',fontSize:'.8rem',flexShrink:0}}>{"✅"} {i+1}.</span>
                <input value={rule} style={{flex:1,padding:'7px 10px',border:'2px solid #e2f0e2',borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:'.8rem',outline:'none'}}
                  onChange={e=>{const v=e.target.value;setSettings(s=>({...s,rules:s.rules.map((r,j)=>j===i?v:r)}));}}/>
                <button className="btnS r" style={{flexShrink:0}} onClick={()=>setSettings(s=>({...s,rules:s.rules.filter((_,j)=>j!==i)}))}>✕</button>
              </div>
            ))}
            <button className="btnS g" onClick={()=>setSettings(s=>({...s,rules:[...s.rules,'']}))}>{"+"} Add Rule</button>
          </div>

          <div className="sec">Penalties</div>
          <div className="card">
            {settings.penalties.map((pen,i) => (
              <div key={i} style={{display:'flex',gap:7,marginBottom:7,alignItems:'flex-start'}}>
                <span style={{fontWeight:700,color:'#dc2626',fontSize:'.8rem',flexShrink:0}}>{"⚠️"} {i+1}.</span>
                <input value={pen} style={{flex:1,padding:'7px 10px',border:'2px solid #e2f0e2',borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:'.8rem',outline:'none'}}
                  onChange={e=>{const v=e.target.value;setSettings(s=>({...s,penalties:s.penalties.map((p,j)=>j===i?v:p)}));}}/>
                <button className="btnS r" style={{flexShrink:0}} onClick={()=>setSettings(s=>({...s,penalties:s.penalties.filter((_,j)=>j!==i)}))}>✕</button>
              </div>
            ))}
            <button className="btnS g" onClick={()=>setSettings(s=>({...s,penalties:[...s.penalties,'']}))}>{"+"} Add Penalty</button>
          </div>

          <div className="sec">Authority & Permissions</div>
          <div className="card">
            <div style={{fontSize:'.78rem',color:'#6b7c6b',marginBottom:9,lineHeight:1.6}}>
              <strong>Admin (President):</strong> Full access — register, edit, delete, suspend members, manage all content, approve registrations, view all finance records, reset system.<br/><br/>
              <strong>Finance (Treasurer/Financial Secretary):</strong> Record income, expenses, view all transactions.<br/><br/>
              <strong>Exco Members:</strong> Manage tasks, events, announcements, complaints.<br/><br/>
              <strong>Regular Members:</strong> View content, chat, vote, pay dues, RSVP events, update own profile.
            </div>
          </div>

          <div className="sec">Change Settings PIN</div>
          <div className="card">
            <div className="fg"><label>New PIN (4 digits)</label>
              <input type="password" maxLength={4} placeholder="Enter new 4-digit PIN"
                id="newpin" style={{textAlign:'center',fontSize:'1.3rem',letterSpacing:8}}/>
            </div>
            <div className="fg"><label>Confirm PIN</label>
              <input type="password" maxLength={4} placeholder="Confirm PIN"
                id="confirmpin" style={{textAlign:'center',fontSize:'1.3rem',letterSpacing:8}}/>
            </div>
            <button className="btnP fw" onClick={()=>{
              const np=document.getElementById('newpin').value;
              const cp=document.getElementById('confirmpin').value;
              if(np.length!==4){T('PIN must be exactly 4 digits');return;}
              if(np!==cp){T('PINs do not match');return;}
              setSettings(s=>({...s,settingsPin:np}));
              document.getElementById('newpin').value='';
              document.getElementById('confirmpin').value='';
              T('Settings PIN changed successfully!');
            }}>{"🔐"} Save New PIN</button>
          </div>

          <button className="btnP fw" style={{marginBottom:9}} onClick={saveSettings}>{"💾"} Save All Settings</button>
          <button className="btnO fw" onClick={()=>{setSettingsUnlocked(false);setSettingsPinInput('');}}>{"🔒"} Lock Settings</button>

          <div className="sec" style={{color:'#dc2626'}}>Danger Zone</div>
          <div className="card" style={{border:'2px solid #fee2e2'}}>
            <div style={{fontWeight:700,color:'#dc2626',marginBottom:5}}>{"⚠️"} System Reset</div>
            <div style={{fontSize:'.76rem',color:'#6b7c6b',marginBottom:11,lineHeight:1.6}}>This will permanently wipe ALL data including members (except admin), chats, tasks, finance records, announcements, events, polls, and complaints. This action cannot be undone.</div>
            {!showReset
              ? <button className="btnLg" onClick={()=>setShowReset(true)}>{"🗑️"} Reset Entire System</button>
              : <div>
                  <div className="inote red">You are about to delete ALL forum data. This CANNOT be undone!</div>
                  <div className="fg"><label>Enter PIN to Confirm Reset</label>
                    <input type="password" maxLength={4} value={resetPin}
                      onChange={e=>{const v=e.target.value;setResetPin(v);}}
                      placeholder="Enter your admin PIN" style={{textAlign:'center',fontSize:'1.3rem',letterSpacing:8}}/>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btnP fw" style={{background:'#dc2626',boxShadow:'none'}} onClick={doSystemReset}>{"🗑️"} CONFIRM RESET</button>
                    <button className="btnO fw" onClick={()=>{setShowReset(false);setResetPin('');}}>Cancel</button>
                  </div>
                </div>
            }
          </div>
        </div>
      )}
    </div>
  );

  const pageNames = {dashboard:'Dashboard',attendance:'Attendance',members:'Members',tasks:'Tasks',finance:'Finance',chat:'Forum Chat',complaints:'Complaints',voting:'Elections & Voting',leaderboard:'Leaderboard',events:'Events',announcements:'Announcements',profile:'My Profile',idcard:'My ID Card',birthdays:'Birthdays',admin:'Admin Panel',settings:'App Settings'};

  return (
    <div className={'app'+(isAdmin?' is-admin':'')}>
      <div className="tb">
        <div className="tbL">
          <button className="mbtn" onClick={() => setMenuOpen(o=>!o)}>{"☰"}</button>
          <span className="tbtitle">{pageNames[page]||page}</span>
        </div>
        <div className="tbR">
          <div className="nbell" onClick={() => setPanel(p=>p==='notif'?null:'notif')}>
            {"🔔"}{unread>0 && <div className="ndot">{unread}</div>}
          </div>
          <div className="uav" onClick={() => setPanel(p=>p==='qp'?null:'qp')}>
            {user.photo ? <img src={user.photo} alt=""/> : ini(user.name)}
          </div>
        </div>
      </div>

      <div className={'smenu'+(menuOpen?' open':'')}>
        <div className="mhdr">
          <div className="mavbig">{user.photo ? <img src={user.photo} alt=""/> : ini(user.name)}</div>
          <div>
            <div className="mnm">{user.des?user.des+' ':''}{user.name}</div>
            <div className="mrl">{rl(user.role)}</div>
            <div className="mpts">{"⭐"} {myPts} pts · {lvlE(myPts)} {lvl.lbl}</div>
          </div>
        </div>
        <div className="mnav">
          {[['🏠','Dashboard','dashboard'],['📋','Attendance','attendance'],['👥','Members','members'],['✅','Tasks','tasks'],['💰','Finance','finance'],['💬','Forum Chat','chat'],['📣','Complaints','complaints'],['🗳️','Elections','voting'],['🏆','Leaderboard','leaderboard'],['📅','Events','events'],['📢','Announcements','announcements'],['🎂','Birthdays','birthdays'],['🪪','My ID Card','idcard'],['👤','My Profile','profile'],['⚙️','App Settings','settings']].map(([ic,lb,pg]) => (
            <div key={pg} className={'mi'+(page===pg?' on':'')} onClick={() => navTo(pg)}><span className="mic">{ic}</span>{lb}</div>
          ))}
          {isAdmin && <div className={'mi'+(page==='admin'?' on':'')} onClick={() => navTo('admin')}><span className="mic">{"🛠️"}</span>Admin Panel</div>}
          {isAdmin && <div className={'mi'+(page==='settings'?' on':'')} onClick={() => navTo('settings')}><span className="mic">{"⚙️"}</span>App Settings</div>}
        </div>
        <div style={{padding:13,borderTop:'1px solid #e2f0e2'}}>
          <button className="blogout" onClick={doLogout}>{"🚪"} Sign Out</button>
        </div>
      </div>
      <div className={'mov'+(menuOpen?' show':'')} onClick={() => setMenuOpen(false)}/>

      <div className="scroll">{PG[page] || <div className="empty"><span className="ei">{"🔍"}</span><p>Page not found</p></div>}</div>

      <nav className="bnav">
        {[['🏠','Home','dashboard'],['📋','Attend','attendance'],['💬','Chat','chat'],['🎂','B-days','birthdays'],['👤','Profile','profile']].map(([ic,l,p]) => (
          <button key={p} className={'bn'+(page===p?' on':'')} onClick={() => navTo(p)}><span className="bi">{ic}</span><span>{l}</span></button>
        ))}
      </nav>

      <div className={'pbg'+(panel?' show':'')} onClick={() => setPanel(null)}/>
      <div className={'panel'+(panel==='notif'?' show':'')}>
        <div className="phdr"><strong>Notifications</strong><button onClick={() => setPanel(null)}>✕</button></div>
        <div className="pbody2">{notifs.map(n => (
          <div key={n.id} className={'ni'+(n.unread?' unread':'')} onClick={() => setNotifs(ns=>ns.map(x=>x.id===n.id?{...x,unread:false}:x))}>
            <div className="nt">{n.title}</div><div className="nb">{n.body}</div><div className="ntm">{n.time}</div>
          </div>
        ))}</div>
      </div>
      <div className={'panel'+(panel==='qp'?' show':'')}>
        <div className="phdr"><strong>My Profile</strong><button onClick={() => setPanel(null)}>✕</button></div>
        <div className="pbody2" style={{padding:18,textAlign:'center'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#166534)',color:'#fff',fontWeight:700,fontSize:'1.3rem',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 11px',overflow:'hidden',border:'3px solid #dcfce7'}}>
            {user.photo ? <img src={user.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : ini(user.name)}
          </div>
          <div style={{fontWeight:700,fontSize:'.95rem'}}>{user.des?user.des+' ':''}{user.name}</div>
          <div style={{color:'#6b7c6b',fontSize:'.76rem',marginTop:3}}>{rl(user.role)}</div>
          <div style={{color:'#d97706',fontWeight:700,margin:'7px 0'}}>{myPts} pts · {lvlE(myPts)} {lvl.lbl}</div>
          <div style={{fontSize:'.74rem',color:'#6b7c6b',marginBottom:13}}>{user.id}</div>
          <button className="btnP fw" onClick={() => { navTo('profile'); setPanel(null); }}>View Full Profile</button>
          <button className="btnO fw" onClick={() => { navTo('idcard'); setPanel(null); }}>{"🪪"} My ID Card</button>
        </div>
      </div>

      <div className={'mbg2'+(modal?' show':'')} onClick={closeM}>
        <div className="mbox" onClick={e => e.stopPropagation()}>
          {modal==='barcode' && mdata && (
            <div>
              <h3>My Member Barcode</h3>
              <div className="bcxl">{barBits(mdata.id).map((b,i) => <div key={i} className="bar" style={{width:b.w*2.5,height:b.h*1.4}}/>)}</div>
              <div style={{textAlign:'center',fontSize:'.95rem',fontWeight:700,letterSpacing:3,margin:'0 0 7px',color:'#14532d'}}>{mdata.id}</div>
              <p style={{textAlign:'center',color:'#6b7c6b',fontSize:'.76rem',marginBottom:14}}>Show to Attendance Officer at meeting venue</p>
              <button className="btnO fw" onClick={closeM}>Close</button>
            </div>
          )}
          {modal==='memberdetail' && mdata && (
            <div>
              <h3>Member Profile</h3>
              <div style={{textAlign:'center',marginBottom:14}}>
                <div style={{width:70,height:70,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#166534)',color:'#fff',fontWeight:700,fontSize:'1.4rem',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 9px',overflow:'hidden',border:'3px solid #dcfce7'}}>
                  {mdata.photo ? <img src={mdata.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : ini(mdata.name)}
                </div>
                <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:'1.05rem'}}>{mdata.des?mdata.des+' ':''}{mdata.name}</div>
                <div style={{color:'#166534',fontSize:'.76rem',fontWeight:600}}>{rl(mdata.role)}</div>
                <div style={{fontSize:'.72rem',color:'#6b7c6b',marginTop:3}}>{mdata.id}</div>
              </div>
              {[['Phone',mdata.phone],['Email',mdata.email],['Address',mdata.addr],['Home Town',mdata.town],['Profession',mdata.prof],['Birthday',mdata.dobDay&&mdata.dobMonth?mdata.dobDay+' '+mdata.dobMonth:'--'],['Check-in',mdata.method],['Since',fmtD(mdata.joined)],['Points',mdata.pts+' pts']].map(([l,v]) => (
                <div className="dr" key={l}><span className="dl">{l}</span><span className="dv">{v||'--'}</span></div>
              ))}
              {isAdmin && (
                <div className="arow" style={{marginTop:12}}>
                  <button className="btnS b" onClick={() => openM('editmember',{...mdata})}>Edit</button>
                  <button className="btnS b" onClick={() => openM('memberidcard',mdata)}>ID Card</button>
                  {mdata.status!=='suspended'
                    ? <button className="btnS r" onClick={() => { setMembers(ms=>ms.map(x=>x.id===mdata.id?{...x,status:'suspended'}:x)); closeM(); T('Member suspended'); }}>Suspend</button>
                    : <button className="btnS g" onClick={() => { setMembers(ms=>ms.map(x=>x.id===mdata.id?{...x,status:'active'}:x)); closeM(); T('Member activated'); }}>Activate</button>
                  }
                  <select style={{fontSize:'.72rem',padding:'4px 7px',borderRadius:8,border:'1px solid #e2f0e2'}} onChange={e => { if(e.target.value) { setMembers(ms=>ms.map(x=>x.id===mdata.id?{...x,role:e.target.value}:x)); T('Role updated to '+rl(e.target.value)); } }}>
                    <option value="">Change Role</option>
                    {Object.entries(ROLES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              )}
              <button className="btnO fw" style={{marginTop:12}} onClick={closeM}>Close</button>
            </div>
          )}
          {modal==='memberidcard' && mdata && (
            <div>
              <h3>Member ID Card</h3>
              <IDCard m={mdata}/>
              <button className="btnP fw" onClick={() => T('Screenshot to save. PDF export in production.')}>Download Card</button>
              <button className="btnO fw" onClick={closeM}>Close</button>
            </div>
          )}
          {modal==='editmember' && mdata && (
            <div>
              <h3>Edit Member Profile</h3>
              <div className="photo-area" style={{marginBottom:12}}>
                <input type="file" accept="image/*" onChange={e => handlePhoto(e, v => setMdata(m => ({...m,photo:v})))}/>
                {mdata.photo ? <img src={mdata.photo} alt="preview" className="photo-prev"/> : <div><div style={{fontSize:'1.8rem',marginBottom:5}}>{"📷"}</div><div style={{fontSize:'.76rem',color:'#166534'}}>Tap to update photo</div></div>}
              </div>
              {[['Full Name','name','text'],['Phone','phone','tel'],['Email','email','email'],['Address','addr','text'],['Home Town','town','text'],['Profession','prof','text'],['Designation','des','text']].map(([l,k,t]) => (
                <div className="fg" key={k}><label>{l}</label><input type={t} value={mdata[k]||''} onChange={e => setMdata(m => ({...m,[k]:e.target.value}))}/></div>
              ))}
              <div className="fg"><label>Role</label><select value={mdata.role||'member'} onChange={e => setMdata(m=>({...m,role:e.target.value}))}>{Object.entries(ROLES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div className="fg"><label>Status</label><select value={mdata.status||'active'} onChange={e => setMdata(m=>({...m,status:e.target.value}))}><option value="active">Active</option><option value="suspended">Suspended</option></select></div>
              <div className="fg"><label>Check-in Method</label><select value={mdata.method||'geo'} onChange={e => setMdata(m=>({...m,method:e.target.value}))}><option value="geo">GPS Geolocation</option><option value="scan">QR/Barcode Scan</option><option value="biometric">Biometric Fingerprint</option></select></div>
              <button className="btnP fw" onClick={() => { setMembers(ms=>ms.map(x=>x.id===mdata.id?{...mdata}:x)); if(user.id===mdata.id)setUser({...mdata,isAdmin:user.isAdmin}); closeM(); T('Profile updated!'); }}>Save Changes</button>
              <button className="btnO fw" onClick={closeM}>Cancel</button>
            </div>
          )}
          {modal==='editprofile' && mdata && (
            <div>
              <h3>Edit My Profile</h3>
              <div className="photo-area" style={{marginBottom:12}}>
                <input type="file" accept="image/*" onChange={e => handlePhoto(e, v => setMdata(m => ({...m,photo:v})))}/>
                {mdata.photo ? <img src={mdata.photo} alt="preview" className="photo-prev"/> : <div><div style={{fontSize:'1.8rem',marginBottom:5}}>{"📷"}</div><div style={{fontSize:'.76rem',color:'#166534'}}>Tap to update photo</div></div>}
              </div>
              {[['Full Name','name','text'],['Phone','phone','tel'],['Address','addr','text'],['Profession','prof','text'],['Designation','des','text']].map(([l,k,t]) => (
                <div className="fg" key={k}><label>{l}</label><input type={t} value={mdata[k]||''} onChange={e => setMdata(m => ({...m,[k]:e.target.value}))}/></div>
              ))}
              <button className="btnP fw" onClick={() => { setMembers(ms=>ms.map(x=>x.id===mdata.id?{...x,...mdata}:x)); setUser(u=>({...u,...mdata})); closeM(); T('Profile updated!'); }}>Save Changes</button>
              <button className="btnO fw" onClick={closeM}>Cancel</button>
            </div>
          )}
          {modal==='adminreg' && (
            <div>
              <h3>{"➕"} Register New Member</h3>
              <RegForm adminMode={true}/>
              <button className="btnO fw" style={{marginTop:9}} onClick={closeM}>Cancel</button>
            </div>
          )}
        </div>
      </div>

      {bdayModal && (
        <div className="bday-ov">
          <div className="bday-card">
            <div className="bday-conf">{"🎊"}</div>
            <div className="bday-pav">{bdayModal.member.photo ? <img src={bdayModal.member.photo} alt=""/> : ini(bdayModal.member.name)}</div>
            <div className="bday-name">{bdayModal.member.des?bdayModal.member.des+' ':''}{bdayModal.member.name}</div>
            <div className="bday-sub">{"🎂"} Happy Birthday! {"🎂"}</div>
            <div className="bday-prayer">{PRAYERS[Math.floor(Math.random()*PRAYERS.length)]}</div>
            <div style={{fontSize:'.76rem',color:'rgba(255,255,255,.75)',marginBottom:13,lineHeight:1.5}}>
              From all of us at <strong>Ijebu Forum Abuja</strong> {"🌿"}<br/>
              <span style={{fontSize:'.68rem',opacity:.7}}>Auto-generated at 1:00 AM today</span>
            </div>
            <button className="bday-ack" onClick={() => {
              setBdayAcks(a => [...a, bdayModal.key]);
              setBdayModal(null);
              setNotifs(ns => [{id:Date.now(),title:'Birthday Acknowledged!',body:'Admin notified: '+bdayModal.member.name+' acknowledged their birthday greeting.',unread:true,time:'Just now'},...ns]);
              T('Thank you! Admin has been notified.');
            }}>I Acknowledge with Joy! {"🙏"}</button>
            <div style={{fontSize:'.68rem',color:'rgba(255,255,255,.55)',marginTop:9}}>Admin will be notified of your acknowledgement</div>
          </div>
        </div>
      )}

      <div className={'toast'+(toast.s?' show':'')}>{toast.m}</div>
      <div className={'ppop'+(ppop.s?' show':'')}>{ppop.m}</div>
    </div>
  );
}
