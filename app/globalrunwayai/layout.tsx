// Route layout for /globalrunwayai
import './globals.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  // nested layouts can't return <html>/<body>, so just wrap the children
  return <>{children}</>;
}
