import { useAuthStore } from "../../store/authStore";
import { motion } from "framer-motion";

export default function Dashboard() {
    const { user } = useAuthStore();

    return (
        <div className="h-full flex flex-col items-center justify-center space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <h1 className="text-4xl font-bold text-gray-900">
                    Welcome, {user?.name || "User"}!
                </h1>
                <p className="text-xl text-gray-500 max-w-md mx-auto">
                    Start discovering people around you.
                </p>
            </motion.div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-sm aspect-[3/4] bg-white rounded-3xl shadow-xl border border-gray-100 flex items-center justify-center p-8 text-center"
            >
                <div className="space-y-4">
                    <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                        <span className="text-4xl">👋</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">No Matches Yet</h3>
                    <p className="text-gray-500">
                        You're all set up! We'll show you people nearby soon.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
