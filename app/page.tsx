"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculateHealth, projectInsights, Project } from "@/lib/risk";
import {
  ArrowRight, Building2, CheckCircle2, LogOut, Plus, Sparkles,
  TriangleAlert, UploadCloud, WalletCards, X
} from "lucide-react";

const demoProjects: Project[] = [
  {id:"demo-horizon",name:"Horizon Heights",city:"Gurugram",project_type:"Residential",value_cr:120,progress:37,planned_progress:44,budget_planned_l:500,budget_actual_l:541},
  {id:"demo-green",name:"Greenview Towers",city:"Noida",project_type:"Residential",value_cr:88,progress:61,planned_progress:61,budget_planned_l:420,budget_actual_l:409},
  {id:"demo-metro",name:"Metro Square",city:"Delhi",project_type:"Commercial",value_cr:54,progress:29,planned_progress:35,budget_planned_l:310,budget_actual_l:318},
  {id:"demo-lake",name:"Lakeview Villas",city:"Faridabad",project_type:"Villas",value_cr:24,progress:82,planned_progress:80,budget_planned_l:160,budget_actual_l:151}
];

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [aiQ, setAiQ] = useState("");
  const [aiAnswer, setAiAnswer] = useState("Ask what needs your attention today.");

  useEffect(() => {
    supabase.auth.getSession().then(({data}) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session) {
      setProjects([]);
      return;
    }
    loadProjects();
  }, [session]);

  async function loadProjects() {
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (!error && data) setProjects(data as Project[]);
  }

  async function sendMagicLink() {
    setAuthMsg("Sending...");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    setAuthMsg(error ? error.message : "Check your email for the secure login link.");
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const visibleProjects = projects.length ? projects : demoProjects;
  const totalValue = visibleProjects.reduce((sum,p)=>sum+Number(p.value_cr||0),0);
  const exceptionCount = visibleProjects.filter(p=>calculateHealth(p).label!=="Healthy").length;

  function askAI(){
    const p = selectedProject || visibleProjects[0];
    const q = aiQ.toLowerCase();
    if (!p) return;

    if (q.includes("budget") || q.includes("cost")) {
      const gap = Number(p.budget_actual_l)-Number(p.budget_planned_l);
      setAiAnswer(gap>0 ? `${p.name} is currently ₹${gap.toFixed(1)}L above the control budget.` : `${p.name} is not above its current control budget.`);
    } else if (q.includes("delay") || q.includes("risk") || q.includes("late")) {
      setAiAnswer(projectInsights(p).join(" "));
    } else {
      setAiAnswer(`${projectInsights(p).join(" ")} Upload procurement and schedule documents to add deeper material and vendor risk analysis.`);
    }
    setAiQ("");
  }

  if (authLoading) return <div className="centerPage"><div className="loader">BuildGuard AI</div></div>;

  if (!session) {
    return <div className="loginPage">
      <div className="loginLeft">
        <div className="brand"><div>BG</div><span>BuildGuard AI</span></div>
        <div className="loginCopy">
          <span className="eyebrow">AI PROJECT CONTROL ROOM</span>
          <h1>Your construction portfolio, explained in one screen.</h1>
          <p>Connect project data, surface schedule and cost exceptions, and give management a clear daily view of what needs attention.</p>
          <div className="loginBullets">
            <span><CheckCircle2/> Saved project workspaces</span>
            <span><CheckCircle2/> Project document storage</span>
            <span><CheckCircle2/> Schedule and budget risk checks</span>
          </div>
        </div>
      </div>
      <div className="loginRight">
        <div className="loginCard">
          <span className="eyebrow">SECURE WORKSPACE</span>
          <h2>Sign in to BuildGuard</h2>
          <p>Enter your email. We will send you a secure login link.</p>
          <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" onKeyDown={e=>e.key==="Enter"&&sendMagicLink()}/></label>
          <button onClick={sendMagicLink} disabled={!email}>Send login link <ArrowRight size={17}/></button>
          {authMsg && <div className="authMsg">{authMsg}</div>}
          <small>No password required for the pilot.</small>
        </div>
      </div>
    </div>;
  }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand dark"><div>BG</div><span>BuildGuard AI</span></div>
      <nav><b>Overview</b><span>Projects</span><span>Procurement</span><span>Budget</span><span>Risk center</span><span>Documents</span><span>AI analyst</span></nav>
      <div className="sideBottom">
        <small>{session.user.email}</small>
        <button onClick={signOut}><LogOut size={15}/> Sign out</button>
      </div>
    </aside>

    <main className="main">
      <header className="top">
        <div>
          <span className="eyebrow">EXECUTIVE CONTROL ROOM</span>
          <h1>Portfolio overview</h1>
          <p>See which projects need management attention.</p>
        </div>
        <div className="topActions">
          <button className="secondary" onClick={()=>setShowUpload(true)}><UploadCloud size={16}/> Upload document</button>
          <button className="primary" onClick={()=>setShowNew(true)}><Plus size={16}/> New project</button>
        </div>
      </header>

      {!projects.length && <div className="demoNotice">
        <Sparkles size={17}/>
        <div><b>Demo data is shown until you create your first project.</b><span>Your real projects will automatically replace this sample portfolio.</span></div>
      </div>}

      <section className="metrics">
        <div><span>Active projects</span><strong>{visibleProjects.length}</strong><small>Current workspace</small></div>
        <div><span>Total project value</span><strong>₹{totalValue} Cr</strong><small>Across active projects</small></div>
        <div><span>Projects needing attention</span><strong>{exceptionCount}</strong><small>Schedule or budget exception</small></div>
        <div><span>Documents</span><strong>Live</strong><small>Secure project storage enabled</small></div>
      </section>

      <section className="grid">
        <div>
          <div className="panel">
            <div className="panelHead">
              <div><h2>Projects</h2><p>Actual progress against current plan</p></div>
            </div>
            <div className="table">
              <div className="tr th"><span>Project</span><span>Progress</span><span>Schedule</span><span>Value</span><span>Health</span></div>
              {visibleProjects.map(p=>{
                const h=calculateHealth(p);
                const gap=Number(p.planned_progress)-Number(p.progress);
                return <button className="tr projectRow" key={p.id} onClick={()=>setSelectedProject(p)}>
                  <span><b>{p.name}</b><small>{p.city || "—"}</small></span>
                  <span><div className="barLabel"><small>{p.progress}%</small><small>Plan {p.planned_progress}%</small></div><div className="bar"><i style={{width:`${Math.min(100,p.progress)}%`}}/></div></span>
                  <span className={gap>0?"danger":"good"}>{gap>0?`${gap}% behind`:"On track"}</span>
                  <span>₹{p.value_cr} Cr</span>
                  <span><em className={`pill ${h.tone}`}>{h.label}</em></span>
                </button>
              })}
            </div>
          </div>

          <div className="panel riskPanel">
            <div className="panelHead"><div><h2>Management exceptions</h2><p>Generated from current project data</p></div></div>
            <div className="riskList">
              {visibleProjects.flatMap(p=>projectInsights(p).map((i,idx)=>({p,i,idx}))).slice(0,6).map(({p,i,idx})=>{
                const h=calculateHealth(p);
                return <div className="riskItem" key={`${p.id}-${idx}`}>
                  <div className={`riskIcon ${h.tone}`}>{h.label==="Healthy"?<CheckCircle2/>:<TriangleAlert/>}</div>
                  <div><b>{p.name}</b><span>{i}</span></div>
                </div>
              })}
            </div>
          </div>
        </div>

        <aside>
          <div className="aiCard">
            <div className="aiTitle"><Sparkles size={18}/><h3>AI Project Analyst</h3></div>
            <p>{aiAnswer}</p>
            <div className="chips">
              <button onClick={()=>setAiQ("What is the biggest delay risk?")}>Delay risk?</button>
              <button onClick={()=>setAiQ("Where are we over budget?")}>Budget issue?</button>
            </div>
            <div className="ask"><input value={aiQ} onChange={e=>setAiQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askAI()} placeholder="Ask about a project..."/><button onClick={askAI}>↗</button></div>
          </div>

          <div className="panel">
            <h3>Selected project</h3>
            {selectedProject ? <div className="selected">
              <div className="selectedIcon"><Building2/></div>
              <h2>{selectedProject.name}</h2>
              <p>{selectedProject.city} · {selectedProject.project_type}</p>
              <div className="selectedStats">
                <div><span>Actual</span><b>{selectedProject.progress}%</b></div>
                <div><span>Planned</span><b>{selectedProject.planned_progress}%</b></div>
                <div><span>Value</span><b>₹{selectedProject.value_cr} Cr</b></div>
              </div>
            </div> : <p className="muted">Select a project from the table to inspect it.</p>}
          </div>
        </aside>
      </section>
    </main>

    {showNew && <NewProjectModal supabase={supabase} onClose={()=>setShowNew(false)} onSaved={()=>{setShowNew(false);loadProjects();}}/>}
    {showUpload && <UploadModal supabase={supabase} projects={projects} onClose={()=>setShowUpload(false)}/>}
  </div>;
}

function NewProjectModal({supabase,onClose,onSaved}:{supabase:any,onClose:()=>void,onSaved:()=>void}){
  const [f,setF]=useState({name:"",city:"",project_type:"Residential",value_cr:"",progress:"0",planned_progress:"0",budget_planned_l:"0",budget_actual_l:"0"});
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");

  async function save(){
    setSaving(true); setError("");
    const {data:{user}}=await supabase.auth.getUser();
    const {error}=await supabase.from("projects").insert({
      user_id:user.id,
      name:f.name,
      city:f.city,
      project_type:f.project_type,
      value_cr:Number(f.value_cr||0),
      progress:Number(f.progress||0),
      planned_progress:Number(f.planned_progress||0),
      budget_planned_l:Number(f.budget_planned_l||0),
      budget_actual_l:Number(f.budget_actual_l||0)
    });
    setSaving(false);
    if(error) setError(error.message); else onSaved();
  }

  return <div className="modalBg"><div className="modal">
    <div className="modalTop"><div><span className="eyebrow">PROJECT WORKSPACE</span><h2>Create project</h2></div><button onClick={onClose}><X/></button></div>
    <div className="formGrid">
      <label className="full">Project name<input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label>
      <label>City<input value={f.city} onChange={e=>setF({...f,city:e.target.value})}/></label>
      <label>Type<select value={f.project_type} onChange={e=>setF({...f,project_type:e.target.value})}><option>Residential</option><option>Commercial</option><option>Mixed-use</option><option>Villas</option></select></label>
      <label>Project value (₹ Cr)<input type="number" value={f.value_cr} onChange={e=>setF({...f,value_cr:e.target.value})}/></label>
      <label>Actual progress %<input type="number" value={f.progress} onChange={e=>setF({...f,progress:e.target.value})}/></label>
      <label>Planned progress %<input type="number" value={f.planned_progress} onChange={e=>setF({...f,planned_progress:e.target.value})}/></label>
      <label>Budget planned (₹ L)<input type="number" value={f.budget_planned_l} onChange={e=>setF({...f,budget_planned_l:e.target.value})}/></label>
      <label>Budget actual (₹ L)<input type="number" value={f.budget_actual_l} onChange={e=>setF({...f,budget_actual_l:e.target.value})}/></label>
    </div>
    {error&&<div className="error">{error}</div>}
    <button className="saveBtn" onClick={save} disabled={saving||!f.name}>{saving?"Creating...":"Create project"}</button>
  </div></div>
}

function UploadModal({supabase,projects,onClose}:{supabase:any,projects:Project[],onClose:()=>void}){
  const [projectId,setProjectId]=useState(projects[0]?.id||"");
  const [file,setFile]=useState<File|null>(null);
  const [category,setCategory]=useState("BOQ");
  const [status,setStatus]=useState("");

  async function upload(){
    if(!file||!projectId) return;
    setStatus("Uploading...");
    const {data:{user}}=await supabase.auth.getUser();
    const path=`${user.id}/${projectId}/${Date.now()}-${file.name}`;
    const {error:storageError}=await supabase.storage.from("project-documents").upload(path,file,{upsert:false});
    if(storageError){setStatus(storageError.message);return;}
    const {error}=await supabase.from("project_documents").insert({
      user_id:user.id,project_id:projectId,file_name:file.name,file_path:path,category
    });
    setStatus(error?error.message:"Uploaded successfully.");
  }

  return <div className="modalBg"><div className="modal uploadModal">
    <div className="modalTop"><div><span className="eyebrow">PROJECT DOCUMENTS</span><h2>Upload document</h2></div><button onClick={onClose}><X/></button></div>
    {!projects.length ? <div className="emptyBox">Create your first real project before uploading documents.</div> : <>
      <label>Project<select value={projectId} onChange={e=>setProjectId(e.target.value)}>{projects.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
      <label>Document type<select value={category} onChange={e=>setCategory(e.target.value)}><option>BOQ</option><option>Schedule</option><option>Budget</option><option>Vendor Quote</option><option>Purchase Order</option><option>Invoice</option><option>Progress Report</option><option>Other</option></select></label>
      <label className="fileDrop"><UploadCloud/><b>{file?file.name:"Choose Excel, PDF, image or document"}</b><input type="file" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
      {status&&<div className="authMsg">{status}</div>}
      <button className="saveBtn" disabled={!file||!projectId} onClick={upload}>Upload to project</button>
    </>}
  </div></div>
}
