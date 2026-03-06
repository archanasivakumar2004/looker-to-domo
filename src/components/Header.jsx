import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-3 px-4 text-center shadow-lg flex-shrink-0"
    >
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
        Looker ➜ Domo
      </h1>
      <p className="text-xs sm:text-sm opacity-90 mt-0.5">
        Dashboard Migration Tool
      </p>
    </motion.header>
  );
}