import "./App.css";
import FooterComponent from "./components/FooterComponent";
import HeaderComponent from "./components/HeaderComponent";

function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-2">
      <div className="py-2 max-w-5xl mx-auto">
        <HeaderComponent />
      </div>
      <main className="flex-grow max-w-5xl mx-auto min-h-[70vh]">
        {children}
      </main>
      <div className="p-6 max-w-5xl mx-auto">
        <FooterComponent />
      </div>
    </div>
  );
}

export default AppWrapper;
