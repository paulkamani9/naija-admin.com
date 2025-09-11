import React from "react";
import Logo from "@/components/shared/Logo";

export const AuthHero = () => {
  return (
    <div className="hidden md:flex h-full bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-600 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-16 w-24 h-24 bg-green-500 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-green-700 rounded-full blur-md"></div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col justify-center items-center w-full px-8 lg:px-12 relative z-10">
        {/* Logo Section */}
        <div className="mb-8">
          <Logo size="lg" showAdmin={true} />
        </div>

        {/* Hero Text */}
        <div className="text-center max-w-md">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Healthcare
            <span className="block text-green-600">Administration</span>
            <span className="block text-gray-600 text-2xl lg:text-3xl font-normal">
              Made Simple
            </span>
          </h2>

          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Manage hospitals, HMOs, and insurance plans with our comprehensive
            admin portal. Streamline healthcare operations across Nigeria.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-green-100 shadow-sm">
              <span className="text-sm font-medium text-green-700">
                Hospital Management
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-green-100 shadow-sm">
              <span className="text-sm font-medium text-green-700">
                HMO Integration
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-green-100 shadow-sm">
              <span className="text-sm font-medium text-green-700">
                Plan Analytics
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full opacity-60 animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full opacity-80 animate-pulse"></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Side Decorative Pattern */}
      <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-green-200/20 to-transparent"></div>
      <div className="absolute left-0 bottom-0 h-32 w-full bg-gradient-to-t from-green-200/20 to-transparent"></div>
    </div>
  );
};
