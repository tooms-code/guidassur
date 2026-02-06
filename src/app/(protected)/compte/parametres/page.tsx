"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, User, Mail, Phone, Lock, Shield, Trash2, Bell, Check, AlertTriangle, X } from "lucide-react";
import {
  useUserSettings,
  useUpdateSettings,
  useRequestPasswordReset,
  useDeleteAccount,
  useEnrollMFA,
  useVerifyMFA,
  useUnenrollMFA,
} from "@/frontend/queries/user";
import { useAuth } from "@/frontend/hooks/useAuth";
import { Button } from "@/frontend/components/ui/button";
import { SpinnerPage } from "@/frontend/components/ui/Spinner";

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { data: settings, isLoading } = useUserSettings();
  const updateSettings = useUpdateSettings();
  const requestPasswordReset = useRequestPasswordReset();
  const deleteAccount = useDeleteAccount();
  const enrollMFA = useEnrollMFA();
  const verifyMFA = useVerifyMFA();
  const unenrollMFA = useUnenrollMFA();

  // Form states
  const [fullName, setFullName] = useState("");
  const [nameEditing, setNameEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneEditing, setPhoneEditing] = useState(false);

  const [passwordEmailSent, setPasswordEmailSent] = useState(false);

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAFactorId, setTwoFAFactorId] = useState("");
  const [twoFASecret, setTwoFASecret] = useState("");
  const [twoFAQrCode, setTwoFAQrCode] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAError, setTwoFAError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Global toast for feedback
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Initialize form values when settings load
  useEffect(() => {
    if (settings) {
      if (!nameEditing) setFullName(settings.fullName);
      if (!phoneEditing) setPhone(settings.phone);
    }
  }, [settings, nameEditing, phoneEditing]);

  const handleSaveName = async () => {
    try {
      await updateSettings.mutateAsync({ fullName });
      setNameEditing(false);
      showToast("success", "Nom mis à jour");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    }
  };

  const handleSavePhone = async () => {
    try {
      await updateSettings.mutateAsync({ phone });
      setPhoneEditing(false);
      showToast("success", "Téléphone mis à jour");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    }
  };

  const handleRequestPasswordReset = async () => {
    try {
      await requestPasswordReset.mutateAsync();
      setPasswordEmailSent(true);
      setTimeout(() => setPasswordEmailSent(false), 5000);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Erreur lors de l'envoi");
    }
  };

  const handleToggleNotifications = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ emailNotifications: !settings.emailNotifications });
      showToast("success", settings.emailNotifications ? "Notifications désactivées" : "Notifications activées");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    }
  };

  const handleEnrollMFA = async () => {
    try {
      const result = await enrollMFA.mutateAsync();
      setTwoFAFactorId(result.factorId);
      setTwoFASecret(result.secret);
      setTwoFAQrCode(result.qrCodeUrl);
      setShow2FAModal(true);
      setTwoFACode("");
      setTwoFAError("");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Erreur lors de l'activation de l'A2F");
    }
  };

  const handleVerifyMFA = async () => {
    try {
      await verifyMFA.mutateAsync({ code: twoFACode, factorId: twoFAFactorId });
      setShow2FAModal(false);
      setTwoFAFactorId("");
      setTwoFASecret("");
      setTwoFAQrCode("");
      setTwoFACode("");
      showToast("success", "Double authentification activée");
    } catch (error) {
      setTwoFAError(error instanceof Error ? error.message : "Code invalide");
    }
  };

  const handleUnenrollMFA = async () => {
    try {
      await unenrollMFA.mutateAsync(twoFACode);
      setShow2FAModal(false);
      setTwoFACode("");
      showToast("success", "Double authentification désactivée");
    } catch (error) {
      setTwoFAError(error instanceof Error ? error.message : "Code invalide");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    setDeleteError("");

    try {
      await deleteAccount.mutateAsync(deletePassword);
      await signOut();
      router.push("/");
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return <SpinnerPage />;
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

        <div className="space-y-6">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white rounded-xl border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Profil</h2>
            <p className="text-sm text-gray-500 mb-6">Vos informations personnelles</p>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{settings?.email}</p>
                </div>
              </div>

              {/* Name */}
              <div className="p-4 rounded-xl border border-gray-200">
                {nameEditing ? (
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">Nom</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500 mb-3"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setNameEditing(false);
                          setFullName(settings?.fullName || "");
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveName}
                        disabled={updateSettings.isPending}
                      >
                        {updateSettings.isPending ? "..." : "Enregistrer"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nom</p>
                        <p className="font-medium text-gray-900">{settings?.fullName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNameEditing(true)}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Modifier
                    </button>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="p-4 rounded-xl border border-gray-200">
                {phoneEditing ? (
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">Téléphone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500 mb-3"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setPhoneEditing(false);
                          setPhone(settings?.phone || "");
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSavePhone}
                        disabled={updateSettings.isPending}
                      >
                        {updateSettings.isPending ? "..." : "Enregistrer"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="font-medium text-gray-900">
                          {settings?.phone || "Non renseigné"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPhoneEditing(true)}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      {settings?.phone ? "Modifier" : "Ajouter"}
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 pl-1">
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

            <div className="space-y-4">
              {/* Password Reset */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mot de passe</p>
                    <p className="text-sm text-gray-500">
                      {passwordEmailSent ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Email envoyé
                        </span>
                      ) : (
                        "Modifier via email"
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRequestPasswordReset}
                  disabled={requestPasswordReset.isPending || passwordEmailSent}
                >
                  {requestPasswordReset.isPending ? "..." : "Réinitialiser"}
                </Button>
              </div>

              {/* 2FA */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Double authentification</p>
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
                      handleEnrollMFA();
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

            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-emerald-600" />
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
            className="p-6 bg-white rounded-xl border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Zone de danger</h2>

            <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Supprimer mon compte</p>
                  <p className="text-sm text-red-600">Cette action est irréversible</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors"
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
                <div className="mb-6">
                  {/* QR Code */}
                  {twoFAQrCode && (
                    <div className="flex flex-col items-center mb-4">
                      <div className="p-3 bg-white rounded-xl border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={twoFAQrCode}
                          alt="QR Code pour l'authentification"
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-3 text-center">
                        Scannez ce QR code avec votre app<br />
                        <span className="text-gray-400">(Google Authenticator, Authy...)</span>
                      </p>
                    </div>
                  )}

                  {/* Manual entry fallback */}
                  <details className="group">
                    <summary className="text-sm text-emerald-600 cursor-pointer hover:text-emerald-700 text-center">
                      Impossible de scanner ? Entrez le code manuellement
                    </summary>
                    <div className="mt-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
                      <p className="text-xs text-gray-500 mb-2 text-center">Code secret</p>
                      <code className="text-sm bg-white border border-gray-200 px-3 py-2 rounded-lg block text-center font-mono break-all">
                        {twoFASecret}
                      </code>
                    </div>
                  </details>
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:outline-none focus:border-emerald-500"
                  maxLength={6}
                />
                {twoFAError && (
                  <p className="text-sm text-red-600 mt-2">{twoFAError}</p>
                )}
              </div>

              <Button
                onClick={settings?.twoFactorEnabled ? handleUnenrollMFA : handleVerifyMFA}
                disabled={twoFACode.length !== 6 || verifyMFA.isPending || unenrollMFA.isPending}
                variant={settings?.twoFactorEnabled ? "secondary" : "primary"}
                className="w-full"
              >
                {verifyMFA.isPending || unenrollMFA.isPending
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
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
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
                  Entrez votre mot de passe pour confirmer
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                />
                {deleteError && (
                  <p className="text-sm text-red-600 mt-2">{deleteError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={!deletePassword || deleteAccount.isPending}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-xl transition-colors"
                >
                  {deleteAccount.isPending ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                toast.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {toast.type === "success" ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
