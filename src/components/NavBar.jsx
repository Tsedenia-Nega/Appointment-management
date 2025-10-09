import { useUser } from "../context/UserContext";

export default function Navbar() {
  const { user } = useUser();

  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 border-b">
      <div>
        <h1 className="text-xl font-bold">CEO</h1>
        <p className="text-sm text-gray-500">Chief Executive Officer</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-semibold">{user?.name || "Abreham"}</p>
          <p className="text-sm text-gray-500">
            {user?.role || "Chief Executive Officer"}
          </p>
        </div>
        <img
          src="https://via.placeholder.com/40"
          alt="Profile"
          className="w-10 h-10 rounded-full border"
        />
      </div>
    </header>
  );
}
