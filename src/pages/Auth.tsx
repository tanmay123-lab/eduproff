import React from 'react';
import { useForm } from 'react-hook-form';
import { UserCog, GraduationCap, BookOpen } from 'lucide-react';

const Auth = () => {
    const { register, handleSubmit, watch } = useForm();
    const selectedRole = watch('role');
    const onSubmit = data => {
        console.log(data);
    };

    const roles = [
        { value: 'administrator', label: 'Administrator', icon: UserCog },
        { value: 'teacher', label: 'Teacher', icon: BookOpen },
        { value: 'student', label: 'Student', icon: GraduationCap },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
                {/* Left Column - Branding Section */}
                <div className="hidden lg:flex flex-col justify-center space-y-6 p-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Welcome to EduProof
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Join our platform to manage and verify educational credentials with ease.
                        </p>
                    </div>
                    <div className="space-y-3 text-muted-foreground">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                            <p>Secure credential verification</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                            <p>Easy institution management</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                            <p>Streamlined registration process</p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Auth Card */}
                <div className="w-full">
                    <div className="bg-card rounded-2xl shadow-xl p-8 border border-border/50 backdrop-blur-sm">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold text-foreground">Institution Registration</h2>
                                <p className="text-muted-foreground">Create your account to get started</p>
                            </div>
                            
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">Institution Name</label>
                                    <input 
                                        type="text" 
                                        {...register('institutionName')} 
                                        className="block w-full h-12 border border-input bg-background rounded-xl px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:outline-none transition-all"
                                        placeholder="Enter institution name"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">Email Address</label>
                                    <input 
                                        type="email" 
                                        {...register('email')} 
                                        className="block w-full h-12 border border-input bg-background rounded-xl px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:outline-none transition-all"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        {...register('phone')} 
                                        className="block w-full h-12 border border-input bg-background rounded-xl px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:outline-none transition-all"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">Address</label>
                                    <textarea 
                                        {...register('address')} 
                                        className="block w-full min-h-[96px] border border-input bg-background rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:outline-none transition-all resize-none"
                                        rows={3}
                                        placeholder="Enter complete address"
                                    ></textarea>
                                </div>
                                
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-foreground">Select Role</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {roles.map((role) => {
                                            const Icon = role.icon;
                                            const isSelected = selectedRole === role.value;
                                            return (
                                                <div key={role.value}>
                                                    <input 
                                                        type="radio" 
                                                        id={role.value} 
                                                        {...register('role')} 
                                                        value={role.value}
                                                        className="sr-only"
                                                    />
                                                    <label 
                                                        htmlFor={role.value}
                                                        className={`
                                                            flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                                            ${isSelected 
                                                                ? 'border-primary bg-primary/10 shadow-md' 
                                                                : 'border-input bg-background hover:border-primary/50 hover:bg-accent/50'
                                                            }
                                                        `}
                                                    >
                                                        <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                                        <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                            {role.label}
                                                        </span>
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="w-full h-12 text-white bg-gradient-to-r from-primary to-primary/80 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    Register
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;