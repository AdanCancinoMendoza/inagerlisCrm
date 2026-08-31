interface ProfileCardProps {
  letter: string;
  name: string;
  role: string;
  background: string;
  textColor?: string;
  onClick?: () => void;
}

export default function ProfileCard({
  letter,
  name,
  role,
  background,
  textColor = "#FFFFFF",
  onClick,
}: ProfileCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-w-0 flex-col items-center text-center"
    >
      <div
        className="
          flex h-28 w-28
          items-center justify-center
          rounded-full
          border-2 border-transparent
          text-5xl font-bold
          transition-colors
          group-hover:border-[#D8A814]
          xl:h-32 xl:w-32
        "
        style={{
          backgroundColor: background,
          color: textColor,
        }}
      >
        {letter}
      </div>

      <p className="mt-4 w-full truncate text-base font-bold text-white xl:text-lg">
        {name}
      </p>

      <p className="mt-1 w-full truncate text-sm font-medium text-[#D8A814]">
        {role}
      </p>
    </button>
  );
}