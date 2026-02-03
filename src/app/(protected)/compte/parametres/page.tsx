"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, User, Mail, Lock, Shield, Trash2, Bell, Eye, EyeOff, Check, AlertTriangle, X } from "lucide-react";
import {
  useUserSettings,
  useUpdateSettings,
  useChangePassword,
  useDeleteAccount,
  useEnable2FA,
  useVerify2FA,
  useDisable2FA,
} from "@/frontend/hooks/useUser";
import { useAuth } from "@/frontend/hooks/useAuth";
import { Button } from "@/frontend/components/ui/button";

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { data: settings, isLoading } = useUserSettings();
  const updateSettings = useUpdateSettings();
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();
  const enable2FA = useEnable2FA();
  const verify2FA = useVerify2FA();
  const disable2FA = useDisable2FA();

  // Form states
  const [fullName, setFullName] = useState("");
  const [nameEditing, setNameEditing] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAError, setTwoFAError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Initialize fullName when settings load
  if (settings && !nameEditing && fullName === "") {
    setFullName(settings.fullName);
  }

  const handleSaveName = async () => {
    try {
      await updateSettings.mutateAsync({ fullName });
      setNameEditing(false);
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Erreur");
    }
  };

  const handleToggleNotifications = async () => {
    if (!settings) return;
    await updateSettings.mutateAsync({ emailNotifications: !settings.emailNotifications });
  };

  const handleEnable2FA = async () => {
    try {
      const result = await enable2FA.mutateAsync();
      setTwoFASecret(result.secret);
      setShow2FAModal(true);
      setTwoFACode("");
      setTwoFAError("");
    } catch (error) {
      console.error("Error enabling 2FA:", error);
    }
  };

  const handleVerify2FA = async () => {
    try {
      await verify2FA.mutateAsync(twoFACode);
      setShow2FAModal(false);
      setTwoFASecret("");
      setTwoFACode("");
    } catch (error) {
      setTwoFAError(error instanceof Error ? error.message : "Code invalide");
    }
  };

  const handleDisable2FA = async () => {
    try {
      await disable2FA.mutateAsync(twoFACode);
      setShow2FAModal(false);
      setTwoFACode("");
    } catch (error) {
      setTwoFAError(error instanceof Error ? error.message : "Code invalide");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "SUPPRIMER") return;

    try {
      await deleteAccount.mutateAsync();
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Back link */}
        <Link
          href="/compte"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour au tableau de bord</span>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-gray-900">Paramètres</h1>
          <p className="text-gray-500 mt-1">Gérez votre compte et votre sécurité</p>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white rounded-xl border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Profil</h2>
            <p className="text-sm text-gray-500 mb-6">Vos informations personnelles</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{settings?.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Nom</p>
                    {nameEditing ? (
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="font-medium text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full max-w-xs"
                        autoFocus
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{settings?.fullName}</p>
                    )}
                  </div>
                </div>
                {nameEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setNameEditing(false);
                        setFullName(settings?.fullName || "");
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Annuler
                    </button>
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={updateSettings.isPending}
                    >
                      {updateSettings.isPending ? "..." : "Enregistrer"}
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setNameEditing(true)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Modifier
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-400">
                Membre depuis{" "}
                {settings?.memberSince
                  ? new Date(settings.memberSince).toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
              </p>
            </div>
          </motion.div>

          {/* Security Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white rounded-xl border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Sécurité</h2>
            <p className="text-sm text-gray-500 mb-6">Protégez votre compte</p>

            {/* Password Change */}
            <form onSubmit={handleChangePassword} className="space-y-4 mb-6">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords ? "text" : "password"}
                  placeholder="Mot de passe actuel"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords ? "text" : "password"}
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}

              {passwordSuccess && (
                <p className="text-sm text-emerald-600 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Mot de passe modifié avec succès
                </p>
              )}

              <Button
                type="submit"
                variant="secondary"
                disabled={!currentPassword || !newPassword || changePassword.isPending}
                className="w-full"
              >
                {changePassword.isPending ? "Modification..." : "Changer le mot de passe"}
              </Button>
            </form>

            {/* 2FA */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Authentification à deux facteurs</p>
                    <p className="text-sm text-gray-500">
                      {settings?.twoFactorEnabled ? "Activée" : "Désactivée"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={settings?.twoFactorEnabled ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => {
                    if (settings?.twoFactorEnabled) {
                      setShow2FAModal(true);
                      setTwoFACode("");
                      setTwoFAError("");
                    } else {
                      handleEnable2FA();
                    }
                  }}
                >
                  {settings?.twoFactorEnabled ? "Désactiver" : "Activer"}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white rounded-xl border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h2>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Notifications par email</p>
                  <p className="text-sm text-gray-500">Recevoir les actualités et conseils</p>
                </div>
              </div>
              <button
                onClick={handleToggleNotifications}
                disabled={updateSettings.isPending}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings?.emailNotifications ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings?.emailNotifications ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white rounded-xl border border-red-200"
          >
            <h2 className="text-lg font-semibold text-red-600 mb-6">Zone de danger</h2>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Supprimer mon compte</p>
                  <p className="text-sm text-red-600">Cette action est irréversible</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 2FA Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {settings?.twoFactorEnabled ? "Désactiver l'A2F" : "Activer l'A2F"}
                </h3>
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!settings?.twoFactorEnabled && twoFASecret && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-2">Code secret</p>
                  <code className="text-sm bg-white border border-gray-200 px-3 py-1.5 rounded block text-center font-mono">
                    {twoFASecret}
                  </code>
                  <p className="text-xs text-gray-500 mt-3">
                    Entrez ce code dans votre app d&apos;authentification (Google Authenticator, Authy...)
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de vérification
                </label>
                <input
                  type="text"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  maxLength={6}
                />
                {twoFAError && (
                  <p className="text-sm text-red-600 mt-2">{twoFAError}</p>
                )}
              </div>

              <Button
                onClick={settings?.twoFactorEnabled ? handleDisable2FA : handleVerify2FA}
                disabled={twoFACode.length !== 6 || verify2FA.isPending || disable2FA.isPending}
                variant={settings?.twoFactorEnabled ? "secondary" : "primary"}
                className="w-full"
              >
                {verify2FA.isPending || disable2FA.isPending
                  ? "Vérification..."
                  : settings?.twoFactorEnabled
                  ? "Désactiver"
                  : "Activer"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Supprimer votre compte</h3>
                  <p className="text-sm text-gray-500">Cette action est irréversible</p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Toutes vos données seront définitivement supprimées : analyses, statistiques, paramètres.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tapez SUPPRIMER pour confirmer
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirm("");
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== "SUPPRIMER" || deleteAccount.isPending}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
                >
                  {deleteAccount.isPending ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
