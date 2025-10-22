import TopNavbar from "./NavBar";
import TopTabs from "./TopTabs";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navbar */}
      <TopNavbar />

      {/* Push content below fixed navbar */}
      <div className="pt-16 flex flex-col min-h-screen">
        {/* <TopTabs /> */}
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
