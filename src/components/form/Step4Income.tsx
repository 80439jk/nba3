interface Step4IncomeProps {
  annualIncome: string;
  employmentStatus: string;
  onAnnualIncomeChange: (value: string) => void;
  onEmploymentStatusChange: (value: string) => void;
  errors?: { annualIncome?: string; employmentStatus?: string };
}

export const Step4Income = ({
  annualIncome,
  employmentStatus,
  onAnnualIncomeChange,
  onEmploymentStatusChange,
  errors
}: Step4IncomeProps) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Household & Income Details
      </h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            What is your household's annual income before taxes (approximately)?
          </label>
          <select
            value={annualIncome}
            onChange={(e) => onAnnualIncomeChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">Select one</option>
            <option value="under_50k">Under 50k</option>
            <option value="50k_75k">50k - 75k</option>
            <option value="76k_150k">76k - 150k</option>
            <option value="150k_plus">150k+</option>
          </select>
          {errors?.annualIncome && (
            <p className="mt-2 text-sm text-red-600">{errors.annualIncome}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            What is your current employment status?
          </label>
          <select
            value={employmentStatus}
            onChange={(e) => onEmploymentStatusChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">Select one</option>
            <option value="employed_full_time">Employed (full-time)</option>
            <option value="employed_part_time">Employed (part-time)</option>
            <option value="unemployed">Unemployed</option>
            <option value="retired">Retired or not seeking work.</option>
          </select>
          {errors?.employmentStatus && (
            <p className="mt-2 text-sm text-red-600">{errors.employmentStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
};
