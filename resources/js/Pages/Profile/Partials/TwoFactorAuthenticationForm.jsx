import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ConfirmsPassword from '@/Components/ConfirmsPassword';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import DangerButton from '@/Components/DangerButton';
import axios from 'axios';

export default function TwoFactorAuthenticationForm({ className = '' }) {
    const { auth } = usePage().props;
    const [enabling, setEnabling] = useState(false);
    const [disabling, setDisabling] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [showVerification, setShowVerification] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [setupKey, setSetupKey] = useState(null);
    const form = useForm({
        code: '',
    });
    const [needsConfirmation, setNeedsConfirmation] = useState(false);


    useEffect(() => {
        const fetchTwoFactorData = async () => {
            if (!auth.user.two_factor_enabled) return;

            try {
                const [qrResponse, keyResponse, codesResponse] = await Promise.all([
                    axios.get(route('two-factor.qr-code')),
                    axios.get(route('two-factor.secret-key')),
                    axios.get(route('two-factor.recovery-codes'))
                ]);

                // Check for locked status (423)
                if ([qrResponse, keyResponse, codesResponse].some(r => r.status === 423)) {
                    setNeedsConfirmation(true);
                    return;
                }

                setQrCode(qrResponse.data.svg);
                setSetupKey(keyResponse.data.secretKey);
                setRecoveryCodes(codesResponse.data);
                setIsAuthenticated(true);
                setNeedsConfirmation(false);
            } catch (error) {
                if (error.response?.status === 423) {
                    setNeedsConfirmation(true);
                }
                console.error('Error fetching 2FA data:', error);
            }
        };

        fetchTwoFactorData();
    }, [auth.user.two_factor_enabled]);

    // Add this new handler for password confirmation
    const handlePasswordConfirm = async (password) => {
        try {
            await axios.post(route('password.confirm'), { password });
            setNeedsConfirmation(false);
            // Refetch data after password confirmation
            const responses = await Promise.all([
                axios.get(route('two-factor.qr-code')),
                axios.get(route('two-factor.secret-key')),
                axios.get(route('two-factor.recovery-codes'))
            ]);

            setQrCode(responses[0].data.svg);
            setSetupKey(responses[1].data.secretKey);
            setRecoveryCodes(responses[2].data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error confirming password:', error);
        }
    };
    const enableTwoFactorAuthentication = () => {
        setEnabling(true);
        form.post(route('two-factor.enable'), {
            preserveScroll: true,
            onSuccess: (response) => {
                if (response?.qr_code) {
                    setQrCode(response.qr_code);
                    setShowVerification(true);
                }
            },
        });
    };
    const confirmTwoFactorAuthentication = () => {
        form.post(route('two-factor.confirm'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowVerification(false);
                setIsAuthenticated(true);
                fetch(route('two-factor.recovery-codes'))
                    .then(async (response) => {
                        const codes = await response.json();
                        setRecoveryCodes(codes);
                    });
                form.reset();
            },
        });
    };
    const regenerateRecoveryCodes = () => {
        form.post(route('two-factor.recovery-codes'), {
            preserveScroll: true,
            onSuccess: (response) => {
                setRecoveryCodes(response);
            },
        });
    };
    const disableTwoFactorAuthentication = () => {
        setDisabling(true);
        form.delete(route('two-factor.disable'), {
            preserveScroll: true,
            onSuccess: () => {
                setEnabling(false);
                setDisabling(false);
                setQrCode(null);
                setRecoveryCodes([]);
                setShowVerification(false);
                setIsAuthenticated(false);
            },
        });
    };
    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Two Factor Authentication
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    When two factor authentication is enabled, you will be prompted for a secure, random token during authentication. You may retrieve this token from your phone's Google Authenticator application.
                </p>
            </header>

            {/* Add password confirmation section here */}
            {needsConfirmation ? (
                <div className="mt-6 space-y-4">
                    {/* Main confirmation section */}
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="max-w-xl text-sm text-gray-600">
                            <div className="flex items-center gap-3 mb-4">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-6V4m0 0v2m0-2h2m-2 0H8" />
                                </svg>
                                <p className="font-medium">
                                    Please confirm your password to view two-factor authentication settings.
                                </p>
                            </div>
                        </div>

                        {/* Placeholder for locked content */}
                        <div className="mt-4 p-4 bg-white/50 rounded-lg border border-gray-300">
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200/70 rounded animate-pulse w-3/4"></div>
                                <div className="h-4 bg-gray-200/70 rounded animate-pulse w-1/2"></div>
                            </div>
                        </div>

                        {/* Confirmation button */}
                        <div className="mt-6">
                            <ConfirmsPassword onConfirm={handlePasswordConfirm}>
                                <PrimaryButton type="button" className="w-full justify-center">
                                    Show Two-Factor Settings
                                </PrimaryButton>
                            </ConfirmsPassword>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {qrCode && (
                        <div className="mt-4">
                            <div className="max-w-xl text-sm text-gray-600">
                                <p className="font-medium mb-4">
                                    Two factor authentication is now enabled. Scan the following QR code using your phone's authenticator application.
                                </p>
                            </div>
                            <div className="p-2 bg-white inline-block rounded border mb-4">
                                <div dangerouslySetInnerHTML={{ __html: qrCode }} />
                            </div>
                            {setupKey && (
                                <div className="mt-4 mb-4">
                                    <p className="text-sm font-medium text-gray-700">Setup Key: {setupKey}</p>
                                </div>
                            )}
                            {showVerification && (
                                <div className="mt-4">
                                    <InputLabel htmlFor="code" value="Code" />
                                    <TextInput
                                        id="code"
                                        type="text"
                                        inputMode="numeric"
                                        className="mt-1 block w-full"
                                        value={form.data.code}
                                        onChange={e => form.setData('code', e.target.value)}
                                        autoFocus
                                        autoComplete="one-time-code"
                                    />
                                    <div className="mt-4 flex items-center gap-4">
                                        <PrimaryButton
                                            onClick={confirmTwoFactorAuthentication}
                                            disabled={form.processing}
                                        >
                                            Confirm
                                        </PrimaryButton>
                                        <SecondaryButton
                                            onClick={() => setShowVerification(false)}
                                        >
                                            Cancel
                                        </SecondaryButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {recoveryCodes.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="max-w-xl text-sm text-gray-600">
                                <p className="font-medium mb-4">
                                    Store these recovery codes in a secure password manager. They can be used to recover access to your account if your two factor authentication device is lost.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 p-4 bg-gray-100 rounded-lg font-mono text-sm">
                                {recoveryCodes.map((code) => (
                                    <div key={code} className="p-2 bg-white rounded border">
                                        {code}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex items-center gap-4">
                                <ConfirmsPassword onConfirm={regenerateRecoveryCodes}>
                                    <SecondaryButton type="button">
                                        Regenerate Recovery Codes
                                    </SecondaryButton>
                                </ConfirmsPassword>

                            </div>
                        </div>
                    )}
                    <div className="mt-5">
                        {!auth.user.two_factor_enabled && !enabling && !disabling && (
                            <ConfirmsPassword onConfirm={enableTwoFactorAuthentication}>
                                <PrimaryButton type="button">
                                    Enable Two-Factor Authentication
                                </PrimaryButton>
                            </ConfirmsPassword>
                        )}

                        {auth.user.two_factor_enabled && !disabling && (
                            <ConfirmsPassword onConfirm={disableTwoFactorAuthentication}>
                                <DangerButton type="button" >
                                    Disable Two-Factor Authentication
                                </DangerButton>
                            </ConfirmsPassword>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}