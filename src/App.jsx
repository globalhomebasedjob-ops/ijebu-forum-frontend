// ─── IJEBU FORUM ABUJA — FULL STACK REACT APP ────────────────────────────────
// Connect to backend: set REACT_APP_API_URL=https://your-api.render.com/api
// Or use the standalone demo mode (no backend required)

import { useState, useEffect, useRef } from "react";


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

  const doLogin = () => {
    if (!lid.trim() || !lpw) { T('Enter your credentials'); return; }
    if ((lid==='admin@ijebu.ng'||lid==='admin'||lid==='IFA-0001') && lpw==='admin123') {
      const u = {...members[0], isAdmin:true};
      setUser(u); setScr('app'); setPage('dashboard'); T('Welcome back, '+u.name.split(' ')[0]+'!'); return;
    }
    const f = members.find(m => m.email===lid || m.phone===lid || m.id===lid);
    if (!f) { T('Member not found'); return; }
    if (f.status === 'suspended') { T('Account suspended. Contact the admin.'); return; }
    if (lpw === 'member123') { setUser({...f,isAdmin:false}); setScr('app'); setPage('dashboard'); T('Welcome, '+f.name.split(' ')[0]+'!'); return; }
    T('Wrong password.\nAdmin: admin@ijebu.ng / admin123\nMember: member123');
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

  const markAtt = (mid, status, method, lat, lng) => {
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
    </div>
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
