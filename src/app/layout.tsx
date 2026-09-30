import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'DMD Perú | Control de Producción',description:'Portal independiente de control de producción de DMD Perú.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>;}
