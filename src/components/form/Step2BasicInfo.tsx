import { useState } from 'react';
import { formatDOB } from '../../utils/formatDOB';

interface Step2BasicInfoProps {
  dob: string;
  citizenship: string;
  onDobChange: (value: string) => void;
  onCitizenshipChange: (value: string) => void;
  errors?: { dob?: string; citizenship?: string };
}

export const Step2BasicInfo = ({
  dob,
  citizenship,
  onDobChange,
  onCitizenshipChange,
  errors
}: Step2BasicInfoProps) => {
  const [dobDisplay, setDobDisplay] = useState(dob);

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatDOB(input);
    setDobDisplay(formatted);
    onDobChange(formatted);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const formatted = formatDOB(pastedText);
    setDobDisplay(formatted);
    onDobChange(formatted);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Your Basic Information
      </h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Date of Birth
          </label>
          <input
            type="text"
            value={dobDisplay}
            onChange={handleDobChange}
            onPaste={handlePaste}
            placeholder="MM / DD / YYYY"
            maxLength={14}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          {errors?.dob && (
            <p className="mt-2 text-sm text-red-600">{errors.dob}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Citizenship Status
          </label>
          <select
            value={citizenship}
            onChange={(e) => onCitizenshipChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">Select one</option>
            <option value="us_citizen">U.S. Citizen</option>
            <option value="non_citizen_legal">Non-Citizen legally admitted to the U.S.</option>
            <option value="other">Other</option>
          </select>
          {errors?.citizenship && (
            <p className="mt-2 text-sm text-red-600">{errors.citizenship}</p>
          )}
        </div>
      </div>
    </div>
  );
};
