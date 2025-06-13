import Breadcrumb from '@/Components/Breadcrumb';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

export default function UsersCreateEdit({ user = null, roles }) {
    const { data, setData, post, patch, errors, reset, processing } =
        useForm({
            name: user?.name || '',
            email: user?.email || '',
            password: '',
            password_confirmation: '',
            roles: user?.roles?.map(role => role.id) || [],
        });

    const submit = (e) => {
        e.preventDefault();
        if (!user?.id) {
            post(route('users.store'), {
                onFinish: () => reset(),
            });
        } else {
            patch(route('users.update', user.id), {
                onFinish: () => reset(),
            });
        }
    };

    const headWeb = user?.id ? 'Edit User' : 'Create User';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card card-outline card-info">
                            <div className="card-header">
                                <h3 className="card-title">
                                    {user?.id ? 'Edit' : 'Create'} User
                                </h3>
                            </div>
                            <form onSubmit={submit}>
                                <div className="card-body">
                                    {/* Name Field */}
                                    <div className="form-group">
                                        <label className="text-uppercase" htmlFor="name">
                                            <span className="text-danger">*</span> Name
                                        </label>
                                        <input
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            type="text"
                                            className={`form-control ${errors.name && 'is-invalid'}`}
                                            id="name"
                                        />
                                        <InputError className="mt-2" message={errors.name} />
                                    </div>

                                    {/* Email Field */}
                                    <div className="form-group">
                                        <label className="text-uppercase" htmlFor="email">
                                            <span className="text-danger">*</span> Email
                                        </label>
                                        <input
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            type="email"
                                            className={`form-control ${errors.email && 'is-invalid'}`}
                                            id="email"
                                        />
                                        <InputError className="mt-2" message={errors.email} />
                                    </div>

                                    {/* Password Fields - Only show for new users */}
                                    {!user?.id && (
                                        <>
                                            <div className="form-group">
                                                <label className="text-uppercase" htmlFor="password">
                                                    <span className="text-danger">*</span> Password
                                                </label>
                                                <input
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    type="password"
                                                    className={`form-control ${errors.password && 'is-invalid'}`}
                                                    id="password"
                                                />
                                                <InputError className="mt-2" message={errors.password} />
                                            </div>

                                            <div className="form-group">
                                                <label className="text-uppercase" htmlFor="password_confirmation">
                                                    <span className="text-danger">*</span> Confirm Password
                                                </label>
                                                <input
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    type="password"
                                                    className="form-control"
                                                    id="password_confirmation"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Role Selection */}
                                    <div className="form-group">
                                        <label className="text-uppercase" htmlFor="roles">
                                            <span className="text-danger">*</span> Roles
                                        </label>
                                        <select
                                            value={data.roles[0] || ''}
                                            onChange={(e) => setData('roles', [parseInt(e.target.value)])}
                                            className={`form-control ${errors.roles && 'is-invalid'}`}
                                            id="roles"
                                        >
                                            <option value="">Select Role</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError className="mt-2" message={errors.roles} />
                                    </div>
                                </div>

                                <div className="card-footer clearfix">
                                    <button disabled={processing} type="submit" className="btn btn-primary">
                                        {processing ? (user?.id ? "Updating..." : "Saving...") : (user?.id ? "Update" : "Save")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}