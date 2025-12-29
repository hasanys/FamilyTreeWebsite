export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white px-6 py-4 text-center text-sm text-gray-600">
      <p>
        Built by <span className="font-medium text-gray-800">Yasir Hasan</span>
      </p>
      <p className="mt-1">
        Next.js · React · TypeScript · Tailwind · Prisma · PostgreSQL
      </p>
      <p className="mt-2 text-xs text-gray-500">
        Names are shown using first and last name only for database simplicity.
        No disrespect is intended toward any elders. Data may be incomplete or
        inaccurate.
      </p>
    </footer>
  );
}
