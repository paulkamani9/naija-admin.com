import React from "react";

interface LogoProps {
  variant?: "full" | "symbol" | "text";
  size?: "sm" | "md" | "lg";
  showAdmin?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  variant = "full",
  size = "md",
  showAdmin = true,
}) => {
  const sizeClasses = {
    sm: {
      container: "space-x-1.5",
      symbol: "w-6 h-6",
      symbolText: "text-xs",
      mainText: "text-base",
      adminText: "text-xs",
    },
    md: {
      container: "space-x-2",
      symbol: "w-8 h-8",
      symbolText: "text-sm",
      mainText: "text-xl",
      adminText: "text-sm",
    },
    lg: {
      container: "space-x-3",
      symbol: "w-12 h-12",
      symbolText: "text-lg",
      mainText: "text-3xl",
      adminText: "text-lg",
    },
  };

  const currentSize = sizeClasses[size];

  // Symbol component with Nigerian green colors
  const Symbol = () => (
    <div
      className={`${currentSize.symbol} bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-md`}
    >
      <div className="relative">
        <span className={`text-white font-bold ${currentSize.symbolText}`}>
          N
        </span>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full opacity-80"></div>
      </div>
    </div>
  );

  // Text component
  const TextComponent = () => (
    <div className="flex flex-col">
      <div className="flex items-baseline space-x-1">
        <h1
          className={`${currentSize.mainText} font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent`}
        >
          Naija
        </h1>
        <span className={`${currentSize.mainText} font-light text-gray-600`}>
          .com
        </span>
      </div>
      {showAdmin && (
        <span
          className={`${currentSize.adminText} text-green-600 font-medium tracking-wide uppercase opacity-80 -mt-1`}
        >
          Admin Portal
        </span>
      )}
    </div>
  );

  // Render based on variant
  if (variant === "symbol") {
    return <Symbol />;
  }

  if (variant === "text") {
    return <TextComponent />;
  }

  // Full variant (default)
  return (
    <div className={`flex items-center ${currentSize.container}`}>
      <Symbol />
      <TextComponent />
    </div>
  );
};

export default Logo;
