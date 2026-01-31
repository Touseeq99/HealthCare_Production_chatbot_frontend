import { UpdatePasswordForm } from "@/components/auth/update-password-form"

export default function UpdatePasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
            <nav className="container mx-auto px-6 py-6">
                <div className="flex items-center">
                    <img
                        src="/MetamedMDlogo (2).png"
                        alt="MetaMedMD Logo"
                        className="h-10 w-10 mr-3 rounded-lg"
                    />
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        MetaMedMD
                    </span>
                </div>
            </nav>

            <div className="flex-1 flex items-center justify-center p-4">
                <UpdatePasswordForm />
            </div>

            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} MetaMedMD. All rights reserved.
            </div>
        </div>
    )
}
