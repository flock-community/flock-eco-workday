import { Chip } from '@mui/material';

type LaptopContractChipProps = {
  signed: boolean;
};

/** Whether the person that has a laptop signed the laptop contract for it. */
export function LaptopContractChip({ signed }: LaptopContractChipProps) {
  return signed ? (
    <Chip label="Signed" color="success" variant="outlined" size="small" />
  ) : (
    <Chip label="Not signed" color="warning" variant="outlined" size="small" />
  );
}
