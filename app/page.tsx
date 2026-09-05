"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  UploadCloud, TriangleAlert, CheckCircle2, Sparkles, FileSpreadsheet,
  CircleDollarSign, PackageSearch, Clock3, Building2
} from "lucide-react";

type Risk = { severity:"critical"|"warning"|"good"; title:string; detail:string; };
type MaterialRisk = { item:string; required:number; inventory:number; ordered:number; shortfall:number; };
type Vendor = { vendor:string; rate:number; delivery:number; payment:string; score:number; };
type Analysis = {
  projectName:string;
  risks:Risk[];
  materials:MaterialRisk[];
  vendors:Vendor[];
  budgetRows:any[];
  scheduleRows:any[];
  summary:{critical:number; warning:number; savings:number;};
};

function rowsFromSheet(wb:XLSX.WorkBook, name:string){
  const target = wb.SheetNames.find(n => n.trim().toLowerCase() === name.toLowerCase());
  if(!target) return [];
  const ws = wb.Sheets[target];
  return XLSX.utils.sheet_to_json<any[]>(ws,{header:1,defval:""});
}

function tableFromRows(rows:any[][]){
  const headerIndex = rows.findIndex(r => r.filter(Boolean).length >= 3);
  if(headerIndex < 0) return [];
  const headers = rows[headerIndex].map((h:any)=>String(h).trim().toLowerCase());
  return rows.slice(headerIndex+1).filter(r=>r.some(Boolean)).map(r=>{
    const obj:any={};
    headers.forEach((h:string,i:number)=>obj[h]=r[i]);
    return obj;
  });
}

function num(v:any){ const n=Number(String(v??"").replace(/[₹,%\s,]/g,"")); return Number.isFinite(n)?n:0; }

function analyzeWorkbook(wb:XLSX.WorkBook):Analysis{
  const boq = tableFromRows(rowsFromSheet(wb,"BOQ"));
  const inv = tableFromRows(rowsFromSheet(wb,"Inventory"));
  const po = tableFromRows(rowsFromSheet(wb,"Purchase Orders"));
  const sched = tableFromRows(rowsFromSheet(wb,"Schedule"));
  const budget = tableFromRows(rowsFromSheet(wb,"Budget"));
  const quotes = tableFromRows(rowsFromSheet(wb,"Vendor Quotes"));

  const risks:Risk[]=[];
  const materials:MaterialRisk[]=[];

  for(const b of boq){
    const item = String(b["item"]||"").trim();
    if(!item) continue;
    const required = num(b["quantity"]);
    const inventoryRow = inv.find((x:any)=>String(x["item"]||"").trim().toLowerCase()===item.toLowerCase());
    const inventory = inventoryRow ? num(inventoryRow["available qty"]) : 0;
    const ordered = po.filter((x:any)=>String(x["item"]||"").trim().toLowerCase()===item.toLowerCase())
      .reduce((s:number,x:any)=>s+num(x["ordered qty"]),0);
    const shortfall = Math.max(0,required-inventory-ordered);
    if(shortfall>0){
      materials.push({item,required,inventory,ordered,shortfall});
      const ratio = required?shortfall/required:0;
      risks.push({
        severity: ratio>=.25 ? "critical":"warning",
        title:`${shortfall} ${String(b["unit"]||"units")} of ${item} are still uncovered`,
        detail:`Required ${required}; inventory ${inventory}; ordered ${ordered}.`
      });
    }
  }

  for(const s of sched){
    const activity=String(s["activity"]||"").trim();
    const planned=num(s["planned progress %"]);
    const actual=num(s["actual progress %"]);
    const gap=planned-actual;
    if(activity && gap>0){
      risks.push({
        severity: gap>=8?"critical":"warning",
        title:`${activity} is ${gap}% behind plan`,
        detail:`Actual progress ${actual}% vs ${planned}% planned.`
      });
    }
  }

  for(const b of budget){
    const pkg=String(b["package"]||"").trim();
    const planned=num(b["planned cost (₹)"]);
    const actual=num(b["actual / projected (₹)"]);
    const variance=actual-planned;
    if(pkg && variance>0){
      const pct=planned?variance/planned*100:0;
      risks.push({
        severity:pct>=8?"critical":"warning",
        title:`${pkg} is ${pct.toFixed(1)}% above budget`,
        detail:`₹${variance.toLocaleString("en-IN")} above the current plan.`
      });
    }
  }

  const qrows = quotes.map((q:any)=>({
    vendor:String(q["vendor"]||""),
    rate:num(q["unit rate (₹/mt)"]),
    delivery:num(q["delivery days"]),
    payment:String(q["payment terms"]||"")
  })).filter((q:any)=>q.vendor && q.rate>0);

  const vendors:Vendor[] = qrows.map((q:any)=>{
    const minRate=Math.min(...qrows.map((x:any)=>x.rate));
    const maxDelivery=Math.max(...qrows.map((x:any)=>x.delivery),1);
    const priceScore=(minRate/q.rate)*100;
    const deliveryScore=Math.max(0,100-(q.delivery/maxDelivery)*60);
    const pay=q.payment.toLowerCase();
    const paymentScore=pay.includes("30 days")?100:pay.includes("advance")?50:70;
    return {...q,score:Math.round(priceScore*.5+deliveryScore*.35+paymentScore*.15)}
  }).sort((a,b)=>b.score-a.score);

  let savings=0;
  if(vendors.length>1){
    const highest=Math.max(...vendors.map(v=>v.rate));
    const best=vendors[0];
    const steel=materials.find(m=>m.item.toLowerCase().includes("steel"));
    if(steel) savings=Math.max(0,(highest-best.rate)*steel.shortfall);
  }

  if(!risks.length){
    risks.push({severity:"good",title:"No major exception detected",detail:"Current workbook data does not show a major schedule, budget or material gap."});
  }

  return {
    projectName:"Uploaded Project",
    risks,
    materials,
    vendors,
    budgetRows:budget,
    scheduleRows:sched,
    summary:{
      critical:risks.filter(r=>r.severity==="critical").length,
      warning:risks.filter(r=>r.severity==="warning").length,
      savings
    }
  };
}

export default function Home(){
  const [analysis,setAnalysis]=useState<Analysis|null>(null);
  const [fileName,setFileName]=useState("");
  const [busy,setBusy]=useState(false);
  const [question,setQuestion]=useState("");
  const [answer,setAnswer]=useState("Upload a project Excel workbook to start.");

  async function handleFile(file:File){
    setBusy(true);
    const buf=await file.arrayBuffer();
    const wb=XLSX.read(buf,{type:"array",cellDates:true});
    const result=analyzeWorkbook(wb);
    setAnalysis(result);
    setFileName(file.name);
    setAnswer(`I analyzed ${file.name}. I found ${result.summary.critical} critical and ${result.summary.warning} warning-level issues.`);
    setBusy(false);
  }

  function ask(){
    if(!analysis || !question.trim()) return;
    const q=question.toLowerCase();
    const critical=analysis.risks.filter(r=>r.severity==="critical");
    if(q.includes("biggest")||q.includes("risk")||q.includes("delay")){
      const r=critical[0]||analysis.risks[0];
      setAnswer(`${r.title}. ${r.detail}`);
    }else if(q.includes("vendor")||q.includes("steel")){
      const v=analysis.vendors[0];
      setAnswer(v?`${v.vendor} currently ranks highest at ${v.score}/100, with ₹${v.rate.toLocaleString("en-IN")}/MT and ${v.delivery}-day delivery.`:"No vendor quote data was found.");
    }else if(q.includes("budget")||q.includes("cost")){
      const r=analysis.risks.find(r=>r.title.toLowerCase().includes("budget"));
      setAnswer(r?`${r.title}. ${r.detail}`:"No budget overrun was detected.");
    }else{
      setAnswer(`I found ${analysis.summary.critical} critical issues and ${analysis.summary.warning} warnings. Ask about risk, budget, steel, or vendor choice.`);
    }
    setQuestion("");
  }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div>BG</div><span>BuildGuard AI</span></div>
      <nav><b>Overview</b><span>Projects</span><span>Procurement</span><span>Budget</span><span>Risk center</span><span>Documents</span><span>AI analyst</span></nav>
      <div className="sideNote"><small>V4 intelligence engine</small><span>Excel → risks → decisions</span></div>
    </aside>

    <main className="main">
      <header className="top">
        <div><span className="eyebrow">REAL EXCEL ANALYSIS</span><h1>Project Control Room</h1><p>Upload one workbook and BuildGuard will connect the sheets automatically.</p></div>
        <label className="uploadBtn"><UploadCloud size={17}/>{busy?"Analyzing...":"Upload Excel"}<input type="file" accept=".xlsx,.xls" hidden onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/></label>
      </header>

      {!analysis ? <section className="empty">
        <div className="emptyIcon"><FileSpreadsheet/></div>
        <h2>Upload the Horizon Heights test workbook</h2>
        <p>BuildGuard will read BOQ, Inventory, Purchase Orders, Schedule, Budget and Vendor Quotes.</p>
        <label className="primaryUpload"><UploadCloud/> Choose Excel file<input type="file" accept=".xlsx,.xls" hidden onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/></label>
      </section> :
      <>
        <div className="fileBanner"><CheckCircle2/><div><b>{fileName}</b><span>Workbook analyzed successfully</span></div></div>

        <section className="metrics">
          <div><span>Critical issues</span><strong>{analysis.summary.critical}</strong><small>Needs management attention</small></div>
          <div><span>Warnings</span><strong>{analysis.summary.warning}</strong><small>Review soon</small></div>
          <div><span>Material gaps</span><strong>{analysis.materials.length}</strong><small>BOQ vs inventory + PO</small></div>
          <div><span>Potential quote saving</span><strong>₹{Math.round(analysis.summary.savings).toLocaleString("en-IN")}</strong><small>On uncovered steel quantity</small></div>
        </section>

        <section className="grid">
          <div>
            <div className="panel">
              <div className="panelHead"><div><h2>Detected project risks</h2><p>Generated from the uploaded workbook</p></div></div>
              <div className="riskList">
                {analysis.risks.map((r,i)=><div className="riskItem" key={i}>
                  <div className={`riskIcon ${r.severity}`}>{r.severity==="good"?<CheckCircle2/>:<TriangleAlert/>}</div>
                  <div><b>{r.title}</b><span>{r.detail}</span></div>
                </div>)}
              </div>
            </div>

            <div className="panel">
              <div className="panelHead"><div><h2>Material coverage</h2><p>BOQ requirement vs inventory and purchase orders</p></div></div>
              <div className="table">
                <div className="tr th"><span>Material</span><span>Required</span><span>Inventory</span><span>Ordered</span><span>Shortfall</span></div>
                {analysis.materials.map((m,i)=><div className="tr" key={i}><span><b>{m.item}</b></span><span>{m.required}</span><span>{m.inventory}</span><span>{m.ordered}</span><span className="danger"><b>{m.shortfall}</b></span></div>)}
              </div>
            </div>

            <div className="panel">
              <div className="panelHead"><div><h2>Vendor intelligence</h2><p>Rate + delivery + payment terms</p></div></div>
              <div className="table">
                <div className="tr vendors th"><span>Vendor</span><span>Rate</span><span>Delivery</span><span>Payment</span><span>Score</span></div>
                {analysis.vendors.map((v,i)=><div className={`tr vendors ${i===0?"recommended":""}`} key={v.vendor}>
                  <span><b>{v.vendor}</b>{i===0&&<small>Recommended</small>}</span>
                  <span>₹{v.rate.toLocaleString("en-IN")}/MT</span><span>{v.delivery} days</span><span>{v.payment}</span><span><b>{v.score}/100</b></span>
                </div>)}
              </div>
            </div>
          </div>

          <aside>
            <div className="aiCard">
              <div className="aiTitle"><Sparkles/><h3>Project Analyst</h3></div>
              <p>{answer}</p>
              <div className="chips">
                <button onClick={()=>setQuestion("What is the biggest risk?")}>Biggest risk?</button>
                <button onClick={()=>setQuestion("Which steel vendor is best?")}>Best vendor?</button>
                <button onClick={()=>setQuestion("Where are we over budget?")}>Budget?</button>
              </div>
              <div className="ask"><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ask about uploaded data..."/><button onClick={ask}>↗</button></div>
            </div>

            <div className="panel">
              <h3>What V4 is doing</h3>
              <div className="logic">
                <div><PackageSearch/><span><b>Material coverage</b><small>BOQ − inventory − POs</small></span></div>
                <div><Clock3/><span><b>Schedule variance</b><small>Planned % − actual %</small></span></div>
                <div><CircleDollarSign/><span><b>Budget variance</b><small>Actual/projected − plan</small></span></div>
                <div><Building2/><span><b>Vendor ranking</b><small>Price + lead time + terms</small></span></div>
              </div>
            </div>
          </aside>
        </section>
      </>}
    </main>
  </div>
}
