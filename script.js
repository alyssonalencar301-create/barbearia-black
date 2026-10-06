const SERVICES = [
  {id:"corte", name:"Corte", description:"Corte tradicional ou moderno", price:30},
  {id:"barba", name:"Barba", description:"Barba completa e acabamento", price:20},
  {id:"combo", name:"Corte + Barba", description:"O combo completo", price:45}
];
const BARBERS=["João","Pedro"];
const OPEN_HOUR=8, CLOSE_HOUR=19, INTERVAL=30;
let state={service:null,barber:null,date:null,time:null};

const $=s=>document.querySelector(s);
const bookings=()=>JSON.parse(localStorage.getItem("blackBookings")||"[]");
const saveBookings=b=>localStorage.setItem("blackBookings",JSON.stringify(b));

function renderServices(){
  $("#servicesGrid").innerHTML=SERVICES.map((s,i)=>`
    <div class="service-card"><span class="number">0${i+1}</span><h3>${s.name}</h3><p>${s.description}</p><div class="price">R$ ${s.price.toFixed(2).replace(".",",")}</div></div>`).join("");
  $("#serviceOptions").innerHTML=SERVICES.map(s=>`
    <button type="button" class="option" data-service="${s.id}">
      <b>${s.name}</b><small>${s.description}</small><strong>R$ ${s.price.toFixed(2).replace(".",",")}</strong>
    </button>`).join("");
  document.querySelectorAll("[data-service]").forEach(btn=>btn.onclick=()=>{
    state.service=SERVICES.find(s=>s.id===btn.dataset.service);
    document.querySelectorAll("[data-service]").forEach(x=>x.classList.remove("selected"));
    btn.classList.add("selected");
  });
}
function isoToday(){
  const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10);
}
function generateTimes(){
  const wrap=$("#times"); wrap.innerHTML="";
  if(!state.barber||!state.date){wrap.innerHTML='<p style="color:#777;font-size:13px">Selecione barbeiro e data para ver os horários.</p>';return;}
  const used=bookings().filter(b=>b.date===state.date&&b.barber===state.barber).map(b=>b.time);
  for(let h=OPEN_HOUR;h<CLOSE_HOUR;h++){
    for(let m=0;m<60;m+=INTERVAL){
      const time=`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
      const disabled=used.includes(time);
      const btn=document.createElement("button"); btn.type="button"; btn.className="time"+(disabled?" disabled":""); btn.textContent=time; btn.disabled=disabled;
      btn.onclick=()=>{state.time=time;document.querySelectorAll(".time").forEach(x=>x.classList.remove("selected"));btn.classList.add("selected");};
      wrap.appendChild(btn);
    }
  }
}
function goStep(n){
  document.querySelectorAll(".form-step").forEach(x=>x.classList.remove("visible"));
  $("#step"+n).classList.add("visible");
  document.querySelectorAll(".step").forEach(x=>x.classList.toggle("active",+x.dataset.step===n));
  if(n===2) generateTimes();
  if(n===3){
    if(!state.service||!state.barber||!state.date||!state.time){alert("Complete o serviço, barbeiro, data e horário.");goStep(2);return;}
    const d=new Date(state.date+"T12:00:00");
    $("#summary").innerHTML=`<strong>${state.service.name}</strong> · R$ ${state.service.price.toFixed(2).replace(".",",")}<br><span class="gold">${d.toLocaleDateString("pt-BR")} às ${state.time}</span> · ${state.barber}`;
  }
}
function refreshAdmin(){
  const date=$("#adminDate").value||isoToday(); $("#adminDate").value=date;
  const list=bookings().filter(b=>b.date===date).sort((a,b)=>a.time.localeCompare(b.time));
  $("#adminList").innerHTML=list.length?list.map(b=>`
    <div class="booking-item"><strong>${b.time} · ${b.service}</strong><small>${b.name} · ${b.phone} · ${b.barber}</small><br>
    <button onclick="cancelBooking('${b.id}')">Cancelar</button></div>`).join(""):'<p style="color:#777">Nenhum agendamento nesta data.</p>';
}
window.cancelBooking=id=>{saveBookings(bookings().filter(b=>b.id!==id));refreshAdmin();generateTimes();};
document.addEventListener("DOMContentLoaded",()=>{
  renderServices();
  $("#date").min=isoToday();
  $("#date").value=isoToday();
  $("#barber").onchange=e=>{state.barber=e.target.value;state.time=null;generateTimes()};
  $("#date").onchange=e=>{state.date=e.target.value;state.time=null;generateTimes()};
  state.date=isoToday();
  document.querySelectorAll(".next-btn").forEach(b=>b.onclick=()=>goStep(+b.dataset.next));
  document.querySelectorAll(".back-btn").forEach(b=>b.onclick=()=>goStep(+b.dataset.back));
  $("#bookingForm").onsubmit=e=>{
    e.preventDefault();
    const booking={id:Date.now().toString(),service:state.service.name,price:state.service.price,barber:state.barber,date:state.date,time:state.time,name:$("#name").value.trim(),phone:$("#phone").value.trim()};
    if(!booking.name||!booking.phone)return;
    const b=bookings();
    if(b.some(x=>x.date===booking.date&&x.time===booking.time&&x.barber===booking.barber)){alert("Esse horário acabou de ser ocupado. Escolha outro.");goStep(2);return;}
    b.push(booking);saveBookings(b);
    const d=new Date(booking.date+"T12:00:00");
    $("#successText").innerHTML=`<strong>${booking.service}</strong><br>${d.toLocaleDateString("pt-BR")} às ${booking.time}<br>${booking.barber} · ${booking.name}`;
    $("#successModal").classList.add("show");
    $("#bookingForm").reset();state={service:null,barber:null,date:isoToday(),time:null};
    document.querySelectorAll(".option").forEach(x=>x.classList.remove("selected"));
    $("#date").min=isoToday();$("#date").value=isoToday();goStep(1);
  };
  $("#closeSuccess").onclick=()=>$("#successModal").classList.remove("show");
  $("#openAdmin").onclick=()=>{$("#adminModal").classList.add("show");refreshAdmin()};
  $("#closeAdmin").onclick=()=>$("#adminModal").classList.remove("show");
  $("#adminDate").onchange=refreshAdmin;
  $("#clearAll").onclick=()=>{if(confirm("Apagar todos os agendamentos salvos neste navegador?")){localStorage.removeItem("blackBookings");refreshAdmin();}};
});
