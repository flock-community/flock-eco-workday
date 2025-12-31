export const allStatusTransitions = [
  { from: 'REQUESTED', to: 'APPROVED' },
  { from: 'REQUESTED', to: 'REJECTED' },
  { from: 'APPROVED', to: 'REQUESTED' },
  { from: 'APPROVED', to: 'DONE' },
  { from: 'REJECTED', to: 'REQUESTED' },
];

export const filterTransitionsFromByStatus = (
  statusToFilter,
  allowedStatusTransitions = allStatusTransitions,
) =>
  allowedStatusTransitions
    .filter(
      (transitionStateProp) => transitionStateProp.from === statusToFilter,
    )
    .map((it) => it.to);

export const canChangeStatus = (
  oldValue,
  newValue,
  allowedStatusTransitions = allStatusTransitions,
) => {
  const possibleTransitionsForOldValue = filterTransitionsFromByStatus(
    oldValue,
    allowedStatusTransitions,
  );
  return (
    possibleTransitionsForOldValue.filter(
      (transitionStateProp) => transitionStateProp === newValue,
    ).length === 1
  );
};
