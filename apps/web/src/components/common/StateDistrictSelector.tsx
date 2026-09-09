import { useMemo } from 'react';
import { SearchableSelect, type OptionItem } from './SearchableSelect';
import {
  getAllStatesAndUTs,
  getDistrictsByStateName,
} from '@/data/indiaAdministrativeData';

interface StateDistrictSelectorProps {
  stateValue: string;
  onStateChange: (stateName: string) => void;
  districtValue: string;
  onDistrictChange: (districtName: string) => void;
  stateLabel?: string;
  districtLabel?: string;
  stateError?: string;
  districtError?: string;
  required?: boolean;
  className?: string;
  stateId?: string;
  districtId?: string;
  stateNameAttr?: string;
  districtNameAttr?: string;
}

export function StateDistrictSelector({
  stateValue,
  onStateChange,
  districtValue,
  onDistrictChange,
  stateLabel = 'State / Union Territory',
  districtLabel = 'District',
  stateError,
  districtError,
  required = true,
  className = '',
  stateId = 'state-select',
  districtId = 'district-select',
  stateNameAttr = 'state',
  districtNameAttr = 'district',
}: StateDistrictSelectorProps) {
  // Generate State/UT options
  const stateOptions: OptionItem[] = useMemo(() => {
    return getAllStatesAndUTs().map((item) => ({
      value: item.name,
      label: item.name,
      subLabel: item.type === 'UNION_TERRITORY' ? 'Union Territory' : 'State',
      group: item.type,
    }));
  }, []);

  // Generate District options based on currently selected State/UT
  const districtOptions: OptionItem[] = useMemo(() => {
    if (!stateValue) return [];
    return getDistrictsByStateName(stateValue).map((d) => ({
      value: d.name,
      label: d.name,
    }));
  }, [stateValue]);

  const handleStateChange = (newState: string) => {
    onStateChange(newState);
    // Clear district whenever state changes
    onDistrictChange('');
  };

  const isDistrictDisabled = !stateValue;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      <SearchableSelect
        id={stateId}
        name={stateNameAttr}
        label={stateLabel}
        required={required}
        value={stateValue}
        onChange={handleStateChange}
        options={stateOptions}
        placeholder="Select State / Union Territory"
        searchPlaceholder="Search State / Union Territory..."
        error={stateError}
      />

      <SearchableSelect
        id={districtId}
        name={districtNameAttr}
        label={districtLabel}
        required={required}
        value={districtValue}
        onChange={onDistrictChange}
        options={districtOptions}
        placeholder={isDistrictDisabled ? 'Select State / Union Territory first' : 'Select District'}
        searchPlaceholder="Search District..."
        disabled={isDistrictDisabled}
        error={districtError}
        helperText={isDistrictDisabled ? 'Select a State / Union Territory to view districts' : undefined}
      />
    </div>
  );
}
