import Converter from "../../components/Converter";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-900 via-black to-purple-900 dark:from-gray-900 dark:to-purple-950 text-white p-6">
      <Converter />
    </main>
  );
}
