interface Step3AddressProps {
  streetAddress: string;
  city: string;
  zip: string;
  onStreetAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onZipChange: (value: string) => void;
  errors?: { streetAddress?: string; city?: string; zip?: string };
}

export const Step3Address = ({
  streetAddress,
  city,
  zip,
  onStreetAddressChange,
  onCityChange,
  onZipChange,
  errors
}: Step3AddressProps) => {
  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 5) {
      onZipChange(value);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Where Do You Live?
      </h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Street Address
          </label>
          <input
            type="text"
            value={streetAddress}
            onChange={(e) => onStreetAddressChange(e.target.value)}
            placeholder="123 Main St"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          {errors?.streetAddress && (
            <p className="mt-2 text-sm text-red-600">{errors.streetAddress}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="New York"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          {errors?.city && (
            <p className="mt-2 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            ZIP Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={zip}
            onChange={handleZipChange}
            placeholder="10001"
            maxLength={5}
            pattern="[0-9]{5}"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          {errors?.zip && (
            <p className="mt-2 text-sm text-red-600">{errors.zip}</p>
          )}
        </div>
      </div>
    </div>
  );
};
