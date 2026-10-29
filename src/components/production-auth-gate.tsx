"use client";

import { FormEvent, useEffect, useState } from "react";
import { LockKeyhole, LogIn, ShieldCheck } from "lucide-react";
import { hasSupabaseConfig, supabase } from "@/lib/supabase-browser";
import { ProductionAppV2 } from "./production-app-v2";

type Screen = "loading" | "login" | "recovery" | "app";

export function ProductionAuthGate() {
  const [screen, setScreen] = useState<Screen>(hasSupabaseConfig ? "loading" : "app");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    // Supabase puts `type=recovery` in the URL when the user arrives from a
    // password-reset email.  `getSession()` can resolve before the recovery
    // event listener, so keep the recovery form visible whenever that marker
    // is present instead of routing a valid temporary session into the app.
    const recoveryParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const isRecoveryLink = recoveryParams.get("type") === "recovery" || new URLSearchParams(window.location.search).get("type") === "recovery";
    if (isRecoveryLink) {
      setScreen("recovery");
      setMessage("Crea una contraseña nueva para acceder al portal.");
    }
    supabase.auth.getSession().then(({ data }) => {
      if (active && !isRecoveryLink) setScreen(data.session ? "app" : "login");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY") {
        setScreen("recovery");
        setMessage("Crea una contraseña nueva para acceder al portal.");
      } else if (session && !isRecoveryLink) setScreen("app");
      else setScreen("login");
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setMessage("No pudimos ingresar. Revisa el correo y la contraseña.");
  };

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    if (password.length < 8) { setMessage("Usa una contraseña de al menos 8 caracteres."); return; }
    if (password !== confirmPassword) { setMessage("Las contraseñas no coinciden."); return; }
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setMessage("El enlace ya no es válido. Solicita uno nuevo al administrador."); return; }
    setMessage("Contraseña guardada. Ya puedes ingresar al portal.");
    window.history.replaceState({}, document.title, window.location.pathname);
    setTimeout(() => setScreen("app"), 700);
  };

  if (screen === "app") return <ProductionAppV2 />;
  if (screen === "loading") return <AccessShell title="Verificando acceso" copy="Estamos preparando tu espacio de producción." />;
  if (screen === "recovery") return <AccessShell title="Crea tu contraseña" copy="Esta contraseña será la que usarás para ingresar al portal de producción.">
    <form onSubmit={resetPassword} className="production-auth-form">
      <label>Nueva contraseña<input autoFocus required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
      <label>Confirmar contraseña<input required minLength={8} type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} /></label>
      {message && <p className="production-auth-message">{message}</p>}
      <button disabled={busy} className="production-auth-button" type="submit"><ShieldCheck size={17}/>{busy ? "Guardando…" : "Guardar contraseña"}</button>
    </form>
  </AccessShell>;
  return <AccessShell title="Portal de Producción" copy="Ingresa con el correo y contraseña asignados por DMD Perú.">
    <form onSubmit={login} className="production-auth-form">
      <label>Correo<input autoFocus required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@empresa.com" /></label>
      <label>Contraseña<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
      {message && <p className="production-auth-message">{message}</p>}
      <button disabled={busy} className="production-auth-button" type="submit"><LogIn size={17}/>{busy ? "Ingresando…" : "Ingresar"}</button>
      <p className="production-auth-help">Si aún no tienes acceso, solicita una invitación al administrador de DMD.</p>
    </form>
  </AccessShell>;
}

function AccessShell({ title, copy, children }: { title: string; copy: string; children?: React.ReactNode }) {
  return <main className="production-auth-shell"><section className="production-auth-card"><div className="production-auth-mark"><img src="/brand/logo-dmd.png" alt="DMD Perú"/><span>DMD PERÚ</span></div><div className="production-auth-icon"><LockKeyhole size={23}/></div><p className="production-auth-eyebrow">CONTROL DE PRODUCCIÓN</p><h1>{title}</h1><p className="production-auth-copy">{copy}</p>{children}</section><style>{authCss}</style></main>;
}

const authCss = `.production-auth-shell{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 70% 15%,#0fa3bf45,transparent 36%),linear-gradient(145deg,#072a3d,#0b536b 58%,#087a98);font-family:Arial,sans-serif}.production-auth-card{width:min(100%,440px);padding:42px;background:#fff;border:1px solid #e1eff2;border-radius:18px;box-shadow:0 24px 70px #04192370;color:#123c50}.production-auth-mark{display:flex;align-items:center;gap:10px;font-size:11px;font-weight:800;letter-spacing:.16em;color:#54717d}.production-auth-mark img{width:42px;height:42px;object-fit:contain;background:#093c50;border-radius:9px;padding:5px}.production-auth-icon{margin:32px 0 14px;display:grid;place-items:center;width:46px;height:46px;border-radius:12px;background:#e9f8fb;color:#087a98}.production-auth-eyebrow{font-size:10px;color:#087a98;letter-spacing:.14em;font-weight:800;margin:0 0 9px}.production-auth-card h1{margin:0;font-size:29px;letter-spacing:-.04em}.production-auth-copy{line-height:1.55;color:#617b85;margin:11px 0 24px}.production-auth-form{display:grid;gap:15px}.production-auth-form label{display:grid;gap:7px;font-size:12px;font-weight:700;color:#294f5e}.production-auth-form input{width:100%;box-sizing:border-box;border:1px solid #cfe0e5;border-radius:9px;padding:12px;background:#fbfefe;font:inherit;color:#123c50;outline:none}.production-auth-form input:focus{border-color:#0aaac3;box-shadow:0 0 0 3px #0aaac322}.production-auth-button{border:0;border-radius:9px;padding:13px 16px;display:flex;justify-content:center;align-items:center;gap:8px;color:#fff;background:linear-gradient(135deg,#087a98,#0aaac3);font-weight:800;cursor:pointer}.production-auth-button:disabled{opacity:.65;cursor:wait}.production-auth-message{margin:0;padding:10px 12px;border-radius:8px;background:#fff8ed;color:#92620c;font-size:12px;line-height:1.4}.production-auth-help{color:#77909a;font-size:11px;line-height:1.5;margin:3px 0 0}`;
