import React from 'react';
import { useForm } from 'react-hook-form';

const Auth = () => {
    const { register, handleSubmit } = useForm();
    const onSubmit = data => {
        console.log(data);
    };

    return (
        <div className="p-8 bg-white rounded-2xl shadow-md max-w-md mx-auto space-y-8">
            <h1 className="text-2xl font-semibold text-gray-800">Institution Registration</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Institution Name</label>
                    <input type="text" {...register('institutionName')} className="block w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400" />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" {...register('email')} className="block w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400" />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" {...register('phone')} className="block w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400" />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea {...register('address')} className="block w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400" rows="3"></textarea>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Role</label>
                    <div className="space-y-2">
                        <div className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                            <input type="radio" id="role1" {...register('role')} value="administrator" />
                            <label htmlFor="role1" className="ml-2 text-sm text-gray-700">Administrator</label>
                        </div>
                        <div className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                            <input type="radio" id="role2" {...register('role')} value="teacher" />
                            <label htmlFor="role2" className="ml-2 text-sm text-gray-700">Teacher</label>
                        </div>
                        <div className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                            <input type="radio" id="role3" {...register('role')} value="student" />
                            <label htmlFor="role3" className="ml-2 text-sm text-gray-700">Student</label>
                        </div>
                    </div>
                </div>
                <button type="submit" className="w-full text-white bg-blue-600 rounded-lg p-3 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition-colors">Register</button>
            </form>
        </div>
    );
};

export default Auth;