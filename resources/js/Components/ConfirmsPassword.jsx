import React, { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ConfirmsPassword({ onConfirm, children }) {
    const passwordInput = useRef();
    const [confirmingPassword, setConfirmingPassword] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const closeModal = () => {
        setConfirmingPassword(false);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                closeModal();
                // Execute onConfirm callback
                if (onConfirm && typeof onConfirm === 'function') {
                    onConfirm();
                }
                // Force reload after a short delay to ensure state updates
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            },
        });
    };

    return (
        <>
            <span onClick={() => setConfirmingPassword(true)}>{children}</span>

            <Modal show={confirmingPassword} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Confirm Password
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        For your security, please confirm your password to continue.
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type="password"
                            className="mt-1 block w-full"
                            required
                            autoComplete="current-password"
                            autoFocus
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModal}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>
                            Confirm
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </>
    );
}