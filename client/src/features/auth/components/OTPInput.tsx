import { useRef, useEffect, useState } from "react";

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  onChange?: (otp: string) => void;
}

export default function OTPInput({
  length = 6,
  onComplete,
  onChange,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null));

  // Handle input change
  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    // Limit to single digit
    const digit = value.slice(-1);

    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Call onChange callback
    const otpString = newOtp.join("");
    onChange?.(otpString);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all digits are filled
    if (newOtp.every((digit) => digit !== "") && onComplete) {
      onComplete(otpString);
    }
  };

  // Handle backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      
      if (newOtp[index]) {
        // If current field has value, clear it
        newOtp[index] = "";
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
      } else if (index > 0) {
        // If current field is empty, move to previous and clear it
        newOtp[index - 1] = "";
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      // Move left with arrow key
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      // Move right with arrow key
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, length);

    if (digits.length > 0) {
      const newOtp = digits.split("").concat(Array(length).fill("")).slice(0, length);
      setOtp(newOtp);
      onChange?.(newOtp.join(""));

      // Focus last filled input
      const lastFilledIndex = Math.min(digits.length - 1, length - 1);
      inputRefs.current[lastFilledIndex]?.focus();

      // Call onComplete if all digits are filled
      if (newOtp.every((digit) => digit !== "") && onComplete) {
        onComplete(newOtp.join(""));
      }
    }
  };

  return (
    <div className="flex justify-center gap-3 my-8">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          placeholder="0"
          className="w-14 h-16 text-center text-2xl font-bold rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-gray-400"
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
