import type { AstroFormData, AstroReport } from './products'

/**
 * Scriptul care completează formularul raportului cu datele din comandă și pornește calculul.
 * Datele vin din sesiunea Stripe plătită (server), deci clientul nu le poate schimba din URL.
 */
export function prefillScript(r: AstroReport, data: AstroFormData, email: string | null): string {
  const payload = JSON.stringify({ r, data, email }).replace(/</g, '\\u003c')
  return `<script id="astroai-prefill">(function(){
  var P=${payload};
  var cyr=/[\\u0400-\\u04FF]/;
  function $(id){return document.getElementById(id)}
  function set(id,v){var e=$(id); if(!e||v==null) return; e.value=String(v); try{e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}catch(_){}}
  function sel(id,v){var e=$(id); if(!e) return; for(var i=0;i<e.options.length;i++){ if(e.options[i].value===v){ e.value=v; try{e.dispatchEvent(new Event('change',{bubbles:true}))}catch(_){} return } }}
  function gender(boxId,g){var b=$(boxId); if(!b) return; var x=b.querySelector('[data-g="'+g+'"]'); if(x) x.click()}
  function alpha(p){return cyr.test(p.l+p.f)?'ru':'ro'}
  function done(){ try{ window.scrollTo(0,0) }catch(_){} }
  function runCristal(){
    var a=P.data.a;
    sel('nameAlphabetSelect',alpha(a));
    set('lastName',a.l); set('firstName',a.f); set('middleName','');
    set('day',a.d); set('month',a.m); set('year',a.y);
    if(P.email) set('pMail',P.email);
    if(typeof window.setGender==='function') window.setGender(a.g);
    setTimeout(function(){ if(typeof window.calculate==='function') window.calculate(); else { var b=document.querySelector('button.btn'); if(b) b.click() } setTimeout(done,400) },60);
  }
  function runCompat(){
    var a=P.data.a,b=P.data.b; if(!b) return;
    sel('p1_alpha',alpha(a)); sel('p2_alpha',alpha(b));
    set('p1_sur',a.l); set('p1_name',a.f); set('p1_d',a.d); set('p1_m',a.m); set('p1_y',a.y); gender('p1_gender',a.g);
    set('p2_sur',b.l); set('p2_name',b.f); set('p2_d',b.d); set('p2_m',b.m); set('p2_y',b.y); gender('p2_gender',b.g);
    if(P.data.meet){ set('meet_d',P.data.meet.d); set('meet_m',P.data.meet.m); set('meet_y',P.data.meet.y) }
    setTimeout(function(){ var c=$('calcBtn'); if(c) c.click(); setTimeout(done,400) },60);
  }
  function runProg(){
    var a=P.data.a;
    sel('alphabet',alpha(a));
    set('lastName',a.l); set('firstName',a.f); set('middleName','');
    set('bDay',a.d); set('bMonth',a.m); set('bYear',a.y); gender('pGender',a.g);
    setTimeout(function(){ var c=$('calcBtn'); if(c) c.click(); setTimeout(done,400) },60);
  }
  function start(){
    if(P.r==='cristal'){ var n=0; (function wait(){ if(typeof DB!=='undefined'&&DB){ runCristal() } else if(n++<200){ setTimeout(wait,50) } })() }
    else if(P.r==='compat') runCompat(); else runProg();
  }
  if(document.readyState==='complete') setTimeout(start,50); else window.addEventListener('load',function(){ setTimeout(start,50) });
})();</script>`
}

