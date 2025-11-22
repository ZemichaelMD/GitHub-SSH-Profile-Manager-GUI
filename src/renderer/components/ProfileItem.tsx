import { useState } from "react";

interface ProfileItemProps {
  profile: string;
}

export default function ProfileItem({ profile }: ProfileItemProps) {
  const [isSwitching, setIsSwitching] = useState(false);

  return (
    <div
      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
      onClick={() => switchProfile(profile)}
    >
      <span className="text-sm truncate">{profile}</span>
      {isSwitching && (
        <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
      )}
    </div>
  );

  function switchProfile(profile: string) {
    setIsSwitching(true);
    setTimeout(() => {
      setIsSwitching(false);
    }, 200);
  }
}
