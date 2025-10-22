import { ButtonHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  containerStyles?: string;
  textStyles?: string;
  rightIcon?: ReactNode;
  isDisabled?: boolean;
  handleClick?: () => void;
}

const CustomButton = ({
  title,
  containerStyles,
  textStyles,
  rightIcon,
  isDisabled,
  handleClick,
  ...props
}: CustomButtonProps) => {
  return (
    <button
      disabled={isDisabled}
      className={twMerge(
        'custom-btn',
        containerStyles
      )}
      onClick={handleClick}
      {...props}
    >
      <span className={twMerge('flex-1', textStyles)}>{title}</span>
      {rightIcon && (
        <div className="relative w-6 h-6">
          {rightIcon}
        </div>
      )}
    </button>
  );
};

export default CustomButton; 