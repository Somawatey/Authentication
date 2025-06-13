import { useEffect, useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticationCard from '@/Components/AuthenticationCard';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function TwoFactorChallenge() {  
    const [recovery, setRecovery] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        recovery_code: '',
    });

    const codeInput = useRef(null);
    const recoveryCodeInput = useRef(null);

    useEffect(() => {
        if (recovery) {
            recoveryCodeInput.current?.focus();
            setData('code', '');
        } else {
            codeInput.current?.focus();
            setData('recovery_code', '');
        }
    }, [recovery]);

    const submit = (e) => {
        e.preventDefault();
        post(route('two-factor.login'), { 
            onSuccess: () => {
                window.location.href = route('dashboard');
            },
            preserveScroll: true,
        });
    };

    const toggleRecovery = () => {
        setRecovery(!recovery);
    };

    return (
        <>
            <Head title="Two-factor Confirmation" />

            <AuthenticationCard>


                <div className="mb-4 text-sm text-gray-600">
                    {!recovery
                        ? 'Please confirm access to your account by entering the authentication code provided by your authenticator application.'
                        : 'Please confirm access to your account by entering one of your emergency recovery codes.'}
                </div>

                <form onSubmit={submit}>
                    {!recovery ? (
                        <div>
                            <InputLabel htmlFor="code" value="Code" />
                            <TextInput
                                id="code"
                                ref={codeInput}
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                type="text"
                                inputMode="numeric"
                                className="mt-1 block w-full"
                                autoFocus
                                autoComplete="one-time-code"
                            />
                            <InputError className="mt-2" message={errors.code} />
                        </div>
                    ) : (
                        <div>
                            <InputLabel htmlFor="recovery_code" value="Recovery Code" />
                            <TextInput
                                id="recovery_code"
                                ref={recoveryCodeInput}
                                value={data.recovery_code}
                                onChange={(e) => setData('recovery_code', e.target.value)}
                                type="text"
                                className="mt-1 block w-full"
                                autoComplete="one-time-code"
                            />
                            <InputError className="mt-2" message={errors.recovery_code} />
                        </div>
                    )}

                    <div className="flex items-center justify-end mt-4">
                        <button
                            type="button"
                            className="text-sm text-gray-600 hover:text-gray-900 underline cursor-pointer"
                            onClick={toggleRecovery}
                        >
                            {recovery ? 'Use an authentication code' : 'Use a recovery code'}
                        </button>

                        <PrimaryButton className="ms-4" disabled={processing}>
                            Log in
                        </PrimaryButton>
                    </div>
                </form>
            </AuthenticationCard>
        </>
    );
}
