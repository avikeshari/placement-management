import {
    Building2,
    Trash2,
    AlertTriangle
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import getErrorMessage from "../../utils/getErrorMessage";

const Profile = () => {
    const [deleting, setDeleting] =
        useState(false);

    let storedUser = null;

    try {
        storedUser = JSON.parse(
            localStorage.getItem("user") || "null"
        );
    } catch {
        storedUser = null;
    }

    const handleDeleteAccount =
        async () => {
            const confirmed =
                window.confirm(
                    "Are you sure you want to permanently delete your company profile and account?\n\nAll jobs, applications and interviews associated with your company will also be removed.\n\nThis action cannot be undone."
                );

            if (!confirmed) {
                return;
            }

            try {
                setDeleting(true);

                await api.delete(
                    "/profile/me"
                );

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                toast.success(
                    "Company profile deleted successfully"
                );

                window.location.href =
                    "/login";
            } catch (error) {
                console.error(
                    "Delete company profile error:",
                    error
                );

                toast.error(
                    getErrorMessage(
                        error,
                        "Unable to delete company profile."
                    )
                );

                setDeleting(false);
            }
        };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                    <Building2 size={26} />
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                        Company Profile
                    </h1>

                    <p className="mt-1 text-slate-500">
                        View and manage your company account.
                    </p>
                </div>
            </div>

            {/* Company Information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <h2 className="text-xl font-semibold text-slate-900">
                    Company Information
                </h2>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <p className="text-sm text-slate-500">
                            Company Name
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                            {storedUser?.name ||
                                storedUser?.companyName ||
                                "Company"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            Email
                        </p>

                        <p className="mt-1 break-all font-semibold text-slate-900">
                            {storedUser?.email ||
                                "Not available"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            Account Type
                        </p>

                        <p className="mt-1 font-semibold capitalize text-slate-900">
                            {storedUser?.role ||
                                "company"}
                        </p>
                    </div>
                </div>
            </section>

            {/* Danger Zone */}
            <section className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 md:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-red-100 p-3 text-red-700">
                                <AlertTriangle
                                    size={24}
                                />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-red-700">
                                    Danger Zone
                                </h2>

                                <p className="mt-1 text-sm text-red-600">
                                    Delete your company profile permanently.
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 max-w-2xl text-sm text-slate-600">
                            Deleting your company profile will permanently
                            remove your account, posted jobs, applications
                            associated with those jobs, and interviews.
                            This action cannot be undone.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            handleDeleteAccount
                        }
                        disabled={deleting}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        <Trash2 size={18} />

                        {deleting
                            ? "Deleting..."
                            : "Delete Company Profile"}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Profile;