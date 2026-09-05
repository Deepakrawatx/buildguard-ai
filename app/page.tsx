"use client";

import { useState } from "react";
import {
  ArrowRight, Building2, TriangleAlert, CircleDollarSign, Clock3,
  CheckCircle2, Sparkles, Upload, ShieldCheck, Layers3, BarChart3
} from "lucide-react";

const projects = [
  {name:"Horizon Heights", city:"Gurugram", value:"₹120 Cr", actual:37, planned:44, health:"Critical", issue:"Steel shortfall"},
  {name:"Greenview Towers", city:"Noida", value:"₹88 Cr", actual:61, planned:61, health:"Healthy", issue:"No critical issue"},
  {name:"Metro Square", city:"Delhi", value:"₹54 Cr", actual:29, planned:35, health:"Watch", issue:"Electrical RFQ pending"},
  {name:"Lakeview Villas", city:"Faridabad", value:"₹24 Cr", actual:82, planned:80, health:"Healthy", issue:"Finishing package review"},
];

const vendors = [
  {name:"BuildRight Metals", rate:"₹59,800/MT", delivery:"9 days", payment:"30 days credit", score:94, recommended:true},
  {name:"Shree Steel", rate:"₹61,500/MT", delivery:"6 days", payment:"30 days credit", score:86},
  {name:"Metro Metals", rate:"₹57,900/MT", delivery:"16 days", payment:"50% advance", score:68},
];

export default function Home(){
  const [view,setView] = useState<"landing"|"dashboard">("landing");
  const [answer,setAnswer] = useState("Ask what needs your attention today.");
  const [q,setQ] = useState("");

  function ask(){
    const x=q.toLowerCase();
    if(!x.trim()) return;
    if(x.includes("delay") || x.includes("risk")){
      setAnswer("Horizon Heights has the highest current risk. 40 MT of steel is still uncovered for upcoming structural work, and the material window is tightening.");
    } else if(x.includes("vendor") || x.includes("steel")){
      setAnswer("BuildRight Metals is the strongest overall choice. It is not the cheapest, but its delivery window and payment terms create lower schedule risk.");
    } else if(x.includes("budget") || x.includes("cost")){
      setAnswer("The electrical package is currently projected ₹4.1L above plan. This is the clearest budget exception requiring review.");
    } else {
      setAnswer("I found 6 issues across 4 projects. The most important are steel coverage, electrical RFQ delay, and one package running above budget.");
    }
    setQ("");
  }

  if(view==="landing"){
    return <div className="site">
      <nav className="nav">
        <div className="logo"><div>BG</div><span>BuildGuard AI</span></div>
        <div className="navLinks"><span>Product</span><span>How it works</span><span>For developers</span></div>
        <button onClick={()=>setView("dashboard")} className="navBtn">Open live demo <ArrowRight size={16}/></button>
      </nav>

      <main>
        <section className="hero">
          <div className="heroCopy">
            <div className="kicker"><Sparkles size={15}/> AI PROJECT CONTROL ROOM</div>
            <h1>Know where your project may lose time or money before it becomes expensive.</h1>
            <p>BuildGuard connects BOQ, schedules, budgets, purchase orders and vendor quotes to surface procurement, schedule and cost risks for real-estate developers.</p>
            <div className="heroActions">
              <button className="primary" onClick={()=>setView("dashboard")}>View live product demo <ArrowRight size={18}/></button>
              <button className="ghost">See how it works</button>
            </div>
            <div className="trustRow">
              <span><ShieldCheck size={16}/> Human-approved actions</span>
              <span><Layers3 size={16}/> Works with existing Excel/PDF workflow</span>
              <span><BarChart3 size={16}/> Portfolio-level visibility</span>
            </div>
          </div>

          <div className="heroPanel">
            <div className="windowTop"><span></span><span></span><span></span><b>Horizon Developers · Executive View</b></div>
            <div className="miniMetrics">
              <div><span>Active projects</span><strong>4</strong></div>
              <div><span>Portfolio value</span><strong>₹286 Cr</strong></div>
              <div><span>Critical issues</span><strong className="redText">2</strong></div>
            </div>
            <div className="alertCard">
              <div className="alertBadge"><TriangleAlert size={15}/> Critical risk</div>
              <h3>40 MT steel shortfall may affect Tower B structural work</h3>
              <p>Required 110 MT · Inventory 32 MT · Ordered 38 MT</p>
              <div className="alertMeta"><span>Required by 24 Sep</span><span>Potential impact 4–7 days</span></div>
            </div>
            <div className="miniTable">
              <div className="row head"><span>Project</span><span>Actual</span><span>Plan</span><span>Status</span></div>
              {projects.slice(0,3).map(p=><div className="row" key={p.name}><span>{p.name}</span><span>{p.actual}%</span><span>{p.planned}%</span><span className={p.health==="Healthy"?"ok":"warn"}>{p.health}</span></div>)}
            </div>
          </div>
        </section>

        <section className="problem">
          <div className="sectionTag">ONE CONTROL ROOM</div>
          <h2>Stop checking 20 files to understand one project.</h2>
          <p className="sectionIntro">BuildGuard turns fragmented construction data into a simple answer: what needs attention now?</p>
          <div className="flow">
            <div className="flowCard"><Upload/><b>Project data</b><span>BOQ, schedules, budgets, vendor quotes, POs</span></div>
            <div className="arrow">→</div>
            <div className="flowCard accent"><Sparkles/><b>BuildGuard AI</b><span>Connects data, checks gaps and ranks risks</span></div>
            <div className="arrow">→</div>
            <div className="flowCard"><Building2/><b>Owner dashboard</b><span>What is late, expensive, missing or blocked</span></div>
          </div>
        </section>

        <section className="features">
          <div className="feature"><TriangleAlert/><h3>Procurement risk</h3><p>Know which material shortfall could delay an upcoming work package.</p></div>
          <div className="feature"><CircleDollarSign/><h3>Vendor intelligence</h3><p>Compare price, lead time and payment terms instead of choosing only the cheapest quote.</p></div>
          <div className="feature"><Clock3/><h3>Schedule control</h3><p>See actual progress vs planned progress and surface projects slipping behind.</p></div>
          <div className="feature"><CheckCircle2/><h3>Budget exceptions</h3><p>Highlight packages running above plan so management can act early.</p></div>
        </section>

        <section className="cta">
          <div><span>BUILT FOR REAL-ESTATE DEVELOPERS</span><h2>See what BuildGuard would show an owner every morning.</h2></div>
          <button onClick={()=>setView("dashboard")}>Open demo dashboard <ArrowRight size={18}/></button>
        </section>
      </main>
    </div>
  }

  return <div className="dashShell">
    <aside className="side">
      <div className="logo dark"><div>BG</div><span>BuildGuard AI</span></div>
      <div className="sideNav">
        <b>Overview</b><span>Projects</span><span>Procurement</span><span>Budget</span><span>Risk center</span><span>Documents</span><span>AI analyst</span>
      </div>
      <button onClick={()=>setView("landing")} className="backBtn">← Back to website</button>
    </aside>

    <main className="dashboard">
      <header className="dashTop">
        <div><span className="sectionTag">EXECUTIVE CONTROL ROOM</span><h1>Good morning, Mr. Shah</h1><p>Here is what needs your attention across all active projects.</p></div>
        <button className="primary">+ New project</button>
      </header>

      <div className="cards4">
        <div className="metric"><span>Active projects</span><strong>4</strong><small>Across 4 NCR locations</small></div>
        <div className="metric"><span>Total project value</span><strong>₹286 Cr</strong><small>Current portfolio</small></div>
        <div className="metric"><span>Issues needing attention</span><strong>6</strong><small>2 are critical</small></div>
        <div className="metric"><span>Potential savings found</span><strong>₹6.8L</strong><small>Current procurement cycle</small></div>
      </div>

      <div className="dashGrid">
        <div>
          <div className="bigRisk">
            <div className="riskHeader"><span className="alertBadge"><TriangleAlert size={14}/> Critical procurement risk</span><span>Horizon Heights</span></div>
            <h2>40 MT steel shortfall may delay Tower B structural work</h2>
            <p>110 MT is required. Current inventory covers 32 MT and existing POs cover 38 MT. The remaining 40 MT is not yet covered.</p>
            <div className="riskStats"><div><span>Required by</span><strong>24 Sep</strong></div><div><span>Lead time</span><strong>6–16 days</strong></div><div><span>Risk level</span><strong>High</strong></div></div>
          </div>

          <div className="panel">
            <div className="panelTitle"><div><h3>Project overview</h3><p>Actual progress against current plan</p></div><span className="pill">Updated today</span></div>
            <div className="projectTable">
              <div className="trow thead"><span>Project</span><span>Progress</span><span>Schedule</span><span>Value</span><span>Health</span></div>
              {projects.map(p=><div className="trow" key={p.name}>
                <span><b>{p.name}</b><small>{p.city}</small></span>
                <span><div className="barLabel"><small>{p.actual}%</small><small>Plan {p.planned}%</small></div><div className="bar"><i style={{width:`${p.actual}%`}}></i></div></span>
                <span className={p.actual<p.planned?"bad":"good"}>{p.actual<p.planned?`${p.planned-p.actual}% behind`:"On track"}</span>
                <span>{p.value}</span>
                <span><em className={p.health==="Healthy"?"health goodH":p.health==="Critical"?"health badH":"health watchH"}>{p.health}</em></span>
              </div>)}
            </div>
          </div>

          <div className="panel">
            <div className="panelTitle"><div><h3>Steel vendor decision</h3><p>Price + delivery + payment terms</p></div><span className="health goodH">Recommendation ready</span></div>
            <div className="vendorTable">
              <div className="vrow vhead"><span>Vendor</span><span>Rate</span><span>Delivery</span><span>Payment</span><span>AI score</span></div>
              {vendors.map(v=><div className={`vrow ${v.recommended?"rec":""}`} key={v.name}><span><b>{v.name}</b>{v.recommended&&<small>Recommended</small>}</span><span>{v.rate}</span><span>{v.delivery}</span><span>{v.payment}</span><span><b>{v.score}/100</b></span></div>)}
            </div>
          </div>
        </div>

        <div>
          <div className="aiPanel">
            <div className="aiTitle"><Sparkles size={18}/><h3>AI Project Analyst</h3></div>
            <p>{answer}</p>
            <div className="chips"><button onClick={()=>setQ("What is the biggest delay risk?")}>Biggest delay risk?</button><button onClick={()=>setQ("Which steel vendor is best?")}>Best steel vendor?</button><button onClick={()=>setQ("Where are we over budget?")}>Budget issue?</button></div>
            <div className="ask"><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ask about your projects..."/><button onClick={ask}>↗</button></div>
          </div>

          <div className="panel budget">
            <span className="health watchH">Budget alert</span>
            <h3>Electrical package is 8.2% above plan</h3>
            <p>The current control budget is ₹50.0L against ₹54.1L projected.</p>
            <div className="budgetStats"><div><span>Variance</span><b>+₹4.1L</b></div><div><span>Status</span><b>Review</b></div></div>
          </div>

          <div className="panel">
            <div className="panelTitle"><div><h3>Today's priorities</h3><p>Ranked by potential impact</p></div></div>
            <div className="priorities">
              <div><i>1</i><span><b>Steel purchase decision</b><small>40 MT still uncovered before upcoming work.</small></span></div>
              <div><i>2</i><span><b>Electrical RFQ pending</b><small>Three quotations are ready for review.</small></span></div>
              <div><i>3</i><span><b>Budget variance</b><small>Electrical package is ₹4.1L above plan.</small></span></div>
              <div><i>4</i><span><b>Vendor approval</b><small>BuildRight Metals currently ranks highest.</small></span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
}
