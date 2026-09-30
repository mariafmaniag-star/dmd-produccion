'use client';
export default function Error({reset}:{reset:()=>void}){return <main className="error-screen"><h1>No pudimos abrir esta vista</h1><p>Reintenta para continuar con la demostración.</p><button className="button primary" onClick={reset}>Reintentar</button></main>;}
